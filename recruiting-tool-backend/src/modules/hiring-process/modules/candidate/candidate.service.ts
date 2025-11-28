import { Injectable, NotFoundException, HttpException, InternalServerErrorException, ConflictException, forwardRef, Inject } from '@nestjs/common';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CandidateResponseDto, CreateCandidateDto, UpdateCandidateDto, CreateManualCandidateDto } from './dto/candidate.dto';
import { CandidateMapper } from './entities/candidate.entity';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { CandidateNoteResponseDto, CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
import { User, ApplicationSource, StageStatus } from '@prisma/client';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';
import { EntityNotFoundException } from 'src/common/exceptions';
import { CandidateJourneyResponseDto, CandidateJourneyStepDto } from '../stages/dto/stage-time-tracking.dto';
import { HiringProcessResponseDto } from '../../dto/hiring-process.dto';
import { EmailService } from 'src/modules/email/email.service';
import { CandidateActivityService } from './services/candidate-activity.service';
import { CandidateActivityType } from '@prisma/client';
import { StorageService } from 'src/modules/storage/storage.service';

@Injectable()
export class CandidateService {
  constructor(
    private candidateActivityService: CandidateActivityService,
    private databaseService: DatabaseService,
    private emailService: EmailService,
    private storageService: StorageService,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<CandidateResponseDto> {
    try {
      const candidate = await this.databaseService.candidate.create({
        data: {
          name: createCandidateDto.name,
          email: createCandidateDto.email,
          source: createCandidateDto.source,
          sourceDetails: createCandidateDto.sourceDetails,
          sourceUrl: createCandidateDto.sourceUrl,
        },
      });

      // Log candidate creation activity
      try {
        await this.candidateActivityService.logActivity(
          candidate.id,
          CandidateActivityType.CREATED,
          `Candidate profile created from source: ${candidate.source || 'UNKNOWN'}`,
          null, // System event, no user
          { source: candidate.source, email: candidate.email }
        );
      } catch (error) {
        // Log error but don't fail candidate creation
        console.error('Failed to log candidate creation activity:', error.message);
      }

      return CandidateMapper(candidate);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create: ${error.message}`,
      );
    }
  }

  /**
   * Create a manual candidate (from phone call, referral, walk-in, etc.)
   * - Creates candidate with source=MANUAL
   * - Auto-creates hiring process linked to job position
   * - Sends welcome email to candidate
   * - Validates email uniqueness per company
   */
  async createManual(createManualCandidateDto: CreateManualCandidateDto, user: User): Promise<HiringProcessResponseDto> {
    try {
      const { name, email, phoneNumber, jobPositionUid, sourceDetails } = createManualCandidateDto;

      // Get job position and verify it exists
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid: jobPositionUid },
        include: {
          company: true,
          stages: {
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!jobPosition) {
        throw new EntityNotFoundException('JobPosition', jobPositionUid);
      }

      if (!jobPosition.stages || jobPosition.stages.length === 0) {
        throw new NotFoundException(`Job position ${jobPositionUid} has no stages configured`);
      }

      // Verify user has access to this company's job position
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null && jobPosition.companyId !== userCompanyId) {
        throw new EntityNotFoundException('JobPosition', jobPositionUid);
      }

      // Check if candidate with this email already exists for this company
      const existingCandidate = await this.databaseService.candidate.findUnique({
        where: { email },
        include: {
          hiringProcesses: {
            where: {
              companyId: jobPosition.companyId,
            },
          },
        },
      });

      if (existingCandidate && existingCandidate.hiringProcesses.length > 0) {
        throw new ConflictException(
          `A candidate with email ${email} already exists for this company`,
        );
      }

      // Create candidate with MANUAL source
      const candidate = await this.databaseService.candidate.create({
        data: {
          name,
          email,
          source: ApplicationSource.MANUAL,
          sourceDetails: sourceDetails || 'Manual entry by HR',
        },
      });

      // Auto-create hiring process
      const hiringProcess = await this.databaseService.hiringProcess.create({
        data: {
          title: `${jobPosition.title} - ${candidate.name}`,
          candidateId: candidate.id,
          jobPositionId: jobPosition.id,
          companyId: jobPosition.companyId,
        },
        include: {
          candidate: true,
          jobPosition: true,
          company: true,
          stages: true,
        },
      });

      // Copy stages from job position template to hiring process
      const copiedStages = jobPosition.stages.map((stage, index) => ({
        title: stage.title,
        type: stage.type,
        description: stage.description,
        position: index,
        status: index === 0 ? StageStatus.CURRENT : StageStatus.OPEN, // First stage is CURRENT
        estimatedTime: stage.estimatedTime,
        hiringProcessId: hiringProcess.id,
        // jobPositionId is null - stages belong only to hiring process
      }));

      await this.databaseService.stage.createMany({
        data: copiedStages,
      });

      // Fetch the complete hiring process with stages
      const completeHiringProcess = await this.databaseService.hiringProcess.findUnique({
        where: { uid: hiringProcess.uid },
        include: {
          candidate: true,
          jobPosition: true,
          company: true,
          stages: {
            orderBy: { position: 'asc' },
          },
        },
      });

      // Send welcome email to candidate
      try {
        await this.emailService.sendWelcomeEmail(candidate.email, {
          userName: candidate.name,
          userEmail: candidate.email,
          userRole: 'Candidate',
          companyName: jobPosition.company.name,
        });
      } catch (emailError) {
        // Log email error but don't fail the whole operation
        console.error(`Failed to send welcome email: ${emailError.message}`);
      }

      // Map to response DTO (we'll need to create a mapper for this)
      return {
        uid: completeHiringProcess.uid,
        title: completeHiringProcess.title,
        status: completeHiringProcess.status,
        candidateUid: completeHiringProcess.candidate.uid,
        candidateName: completeHiringProcess.candidate.name,
        jobPositionUid: completeHiringProcess.jobPosition.uid,
        jobPositionTitle: completeHiringProcess.jobPosition.title,
        companyUid: completeHiringProcess.company.uid,
        companyName: completeHiringProcess.company.name,
        createdAt: completeHiringProcess.createdAt,
        updatedAt: completeHiringProcess.updatedAt,
        stages: completeHiringProcess.stages.map((stage) => ({
          uid: stage.uid,
          title: stage.title,
          type: stage.type,
          description: stage.description,
          status: stage.status,
          position: stage.position,
          estimatedTime: stage.estimatedTime,
          createdAt: stage.createdAt,
          updatedAt: stage.updatedAt,
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create manual candidate: ${error.message}`,
      );
    }
  }

  async findOne(uid: string, user?: User): Promise<CandidateResponseDto> {
    try {
    const candidate = await this.databaseService.candidate.findFirst({
      where: { uid, deletedAt: null },
      include: { hiringProcesses: true },
    });

    if (!candidate) {
      throw new EntityNotFoundException('Candidate', uid);
    }

    // Verify company access if user is provided (through hiring processes)
    if (user && candidate.hiringProcesses && candidate.hiringProcesses.length > 0) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        // Check if candidate has at least one hiring process for this company
        const hasAccessToCandidate = candidate.hiringProcesses.some(hp => hp.companyId === userCompanyId);
        if (!hasAccessToCandidate) {
          throw new EntityNotFoundException('Candidate', uid);
        }
      }
    }

    return CandidateMapper(candidate);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find one: ${error.message}`,
      );
    }}

  async list(paginationDto: PaginationDto & { source?: string; skills?: string[]; startDate?: string; endDate?: string; status?: string }, user: User): Promise<PaginatedResponse<CandidateResponseDto>> {
    try {
    const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc', source, skills, startDate, endDate, status } = paginationDto;
    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Exclude soft-deleted records
    where.deletedAt = null;

    // Add source filter if provided
    if (source) {
      where.source = source;
    }

    // Add date range filters
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Add skills filter - search in candidate files (resume text) or sourceDetails
    if (skills && skills.length > 0) {
      where.OR = where.OR || [];
      skills.forEach(skill => {
        where.OR.push(
          { sourceDetails: { contains: skill, mode: 'insensitive' as const } }
        );
      });
    }

    // Add status filter - filter by hiring process status
    if (status) {
      where.hiringProcesses = where.hiringProcesses || {};
      where.hiringProcesses.some = where.hiringProcesses.some || {};
      where.hiringProcesses.some.status = status;
    }

    // Add company filter for HR and USER roles (filter by hiring processes company)
    const userCompanyId = getUserCompanyId(user);
    if (userCompanyId !== null) {
      if (!where.hiringProcesses) {
        where.hiringProcesses = {};
      }
      if (!where.hiringProcesses.some) {
        where.hiringProcesses.some = {};
      }
      where.hiringProcesses.some.companyId = userCompanyId;
    }

    // Get total count
    const total = await this.databaseService.candidate.count({ where });

    // Get paginated data
    const candidates = await this.databaseService.candidate.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: { hiringProcesses: true },
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: candidates.map((c) => CandidateMapper(c)),
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to list: ${error.message}`,
      );
    }}

  async findAll(user: User): Promise<Array<CandidateResponseDto>> {
    try {
    const where: any = { deletedAt: null };

    // Add company filter for HR and USER roles (filter by hiring processes company)
    const userCompanyId = getUserCompanyId(user);
    if (userCompanyId !== null) {
      where.hiringProcesses = {
        some: {
          companyId: userCompanyId,
        },
      };
    }

    const candidates = await this.databaseService.candidate.findMany({
      where,
      include: { hiringProcesses: true },
    });
    return candidates.map((c) => CandidateMapper(c));
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find all: ${error.message}`,
      );
    }}

  async update(uid: string, updateCandidateDto: UpdateCandidateDto, user: User): Promise<CandidateResponseDto> {
    try {
    if (!uid) {
      throw new EntityNotFoundException('Candidate', uid);
    }

    // Verify company access before update (through hiring processes)
    const existingCandidate = await this.databaseService.candidate.findUnique({
      where: { uid },
      include: { hiringProcesses: true },
    });

    if (!existingCandidate) {
      throw new EntityNotFoundException('Candidate', uid);
    }

    // Check if user has access to this candidate through any hiring process
    if (existingCandidate.hiringProcesses && existingCandidate.hiringProcesses.length > 0) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        const hasAccessToCandidate = existingCandidate.hiringProcesses.some(hp => hp.companyId === userCompanyId);
        if (!hasAccessToCandidate) {
          throw new EntityNotFoundException('Candidate', uid);
        }
      }
    }

    const candidate = await this.databaseService.candidate.update({
      where: { uid },
      data: { ...updateCandidateDto },
    });

    return CandidateMapper(candidate);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update: ${error.message}`,
      );
    }}

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    try {
    if (!uid) {
      throw new EntityNotFoundException('Candidate', uid);
    }

    // Verify company access before soft delete (through hiring processes)
    const existingCandidate = await this.databaseService.candidate.findUnique({
      where: { uid },
      include: { hiringProcesses: true },
    });

    if (!existingCandidate) {
      throw new EntityNotFoundException('Candidate', uid);
    }

    // Check if user has access to this candidate through any hiring process
    if (existingCandidate.hiringProcesses && existingCandidate.hiringProcesses.length > 0) {
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        const hasAccessToCandidate = existingCandidate.hiringProcesses.some(hp => hp.companyId === userCompanyId);
        if (!hasAccessToCandidate) {
          throw new EntityNotFoundException('Candidate', uid);
        }
      }
    }

    // Soft delete: Set deletedAt instead of hard delete
    await this.databaseService.candidate.update({
      where: { uid },
      data: { deletedAt: new Date() },
    });

    return { message: `Candidate soft deleted successfully` };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove: ${error.message}`,
      );
    }}

  /**
   * GDPR Compliance: Permanently delete candidate data (hard delete)
   * Only accessible by SUPER_ADMIN for "right to be forgotten" requests
   *
   * This method:
   * 1. Finds all files associated with the candidate (resumes, documents)
   * 2. Deletes all files from MinIO storage
   * 3. Permanently deletes the candidate record from database (cascade deletes related data)
   */
  async purge(uid: string): Promise<MessageResponseDto> {
    try {
      if (!uid) {
        throw new EntityNotFoundException('Candidate', uid);
      }

      const existingCandidate = await this.databaseService.candidate.findUnique({
        where: { uid },
        include: {
          files: true, // Include files directly associated with candidate
          hiringProcesses: {
            include: {
              jobPosition: {
                include: {
                  applications: {
                    where: {
                      applicantEmail: { equals: '' }, // Will be replaced with candidate email
                    },
                    include: {
                      resumeFile: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!existingCandidate) {
        throw new EntityNotFoundException('Candidate', uid);
      }

      // Collect all S3 keys to delete
      const s3KeysToDelete: string[] = [];

      // 1. Collect files directly associated with candidate
      if (existingCandidate.files && existingCandidate.files.length > 0) {
        existingCandidate.files.forEach(file => {
          if (file.s3Key) {
            s3KeysToDelete.push(file.s3Key);
          }
        });
      }

      // 2. Collect resume files from applications (if candidate applied through public careers page)
      if (existingCandidate.hiringProcesses && existingCandidate.hiringProcesses.length > 0) {
        for (const hiringProcess of existingCandidate.hiringProcesses) {
          if (hiringProcess.jobPosition && hiringProcess.jobPosition.applications) {
            const candidateApplications = hiringProcess.jobPosition.applications.filter(
              app => app.applicantEmail.toLowerCase() === existingCandidate.email.toLowerCase()
            );

            candidateApplications.forEach(app => {
              if (app.resumeFile && app.resumeFile.s3Key) {
                s3KeysToDelete.push(app.resumeFile.s3Key);
              }
            });
          }
        }
      }

      // Delete all files from MinIO storage
      const deletionErrors: string[] = [];
      for (const s3Key of s3KeysToDelete) {
        try {
          await this.storageService.deleteFile(s3Key);
        } catch (deleteError) {
          // Log error but continue with other deletions
          deletionErrors.push(`Failed to delete ${s3Key}: ${deleteError.message}`);
          console.error(`Error deleting file ${s3Key} from storage:`, deleteError.message);
        }
      }

      // Hard delete: Permanently remove candidate from database
      // This will cascade delete related data (hiring processes, notes, activities, etc.)
      await this.databaseService.candidate.delete({ where: { uid } });

      // Build response message
      let message = `Candidate permanently deleted (GDPR purge). Deleted ${s3KeysToDelete.length} file(s) from storage.`;
      if (deletionErrors.length > 0) {
        message += ` Warning: ${deletionErrors.length} file(s) failed to delete from storage.`;
      }

      return { message };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to purge: ${error.message}`,
      );
    }
  }

  // Candidate Notes methods
  async createNote(createNoteDto: CreateCandidateNoteDto, authorUserId: number): Promise<CandidateNoteResponseDto> {
    try {
    // Find candidate by UID to get the numeric ID
    const candidate = await this.databaseService.candidate.findFirst({
      where: { uid: createNoteDto.candidateUid, deletedAt: null },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate ${createNoteDto.candidateUid} not found`);
    }

    const note = await this.databaseService.candidateNote.create({
      data: {
        content: createNoteDto.content,
        candidateId: candidate.id,
        authorId: authorUserId,
      },
      include: {
        author: true,
        candidate: true,
      },
    });

    return {
      uid: note.uid,
      content: note.content,
      candidateUid: note.candidate.uid,
      authorUid: note.author.uid,
      authorName: note.author.name,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create note: ${error.message}`,
      );
    }}

  async findNotesByCandidateUid(candidateUid: string): Promise<CandidateNoteResponseDto[]> {
    try {
    const candidate = await this.databaseService.candidate.findFirst({
      where: { uid: candidateUid, deletedAt: null },
    });

    if (!candidate) {
      throw new EntityNotFoundException('Candidate', candidateUid);
    }

    const notes = await this.databaseService.candidateNote.findMany({
      where: { candidateId: candidate.id },
      include: {
        author: true,
        candidate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => ({
      uid: note.uid,
      content: note.content,
      candidateUid: note.candidate.uid,
      authorUid: note.author.uid,
      authorName: note.author.name,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find notes by candidate uid: ${error.message}`,
      );
    }}

  async updateNote(noteUid: string, updateNoteDto: UpdateCandidateNoteDto, authorUserId: number): Promise<CandidateNoteResponseDto> {
    try {
    // First fetch the note to verify ownership
    const existingNote = await this.databaseService.candidateNote.findUnique({
      where: { uid: noteUid },
      include: {
        author: true,
        candidate: true,
      },
    });

    if (!existingNote) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    const note = await this.databaseService.candidateNote.update({
      where: { uid: noteUid },
      data: { content: updateNoteDto.content },
      include: {
        author: true,
        candidate: true,
      },
    });

    return {
      uid: note.uid,
      content: note.content,
      candidateUid: note.candidate.uid,
      authorUid: note.author.uid,
      authorName: note.author.name,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update note: ${error.message}`,
      );
    }}

  async removeNote(noteUid: string, authorUserId: number): Promise<MessageResponseDto> {
    try {
    // First fetch the note to verify ownership
    const existingNote = await this.databaseService.candidateNote.findUnique({
      where: { uid: noteUid },
    });

    if (!existingNote) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    const note = await this.databaseService.candidateNote.delete({
      where: { uid: noteUid },
    });

    if (!note) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    return { message: 'Note deleted successfully' };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove note: ${error.message}`,
      );
    }}

  // Candidate Journey Tracking
  async getCandidateJourney(candidateUid: string, user?: User): Promise<CandidateJourneyResponseDto[]> {
    try {
      const candidate = await this.databaseService.candidate.findFirst({
        where: { uid: candidateUid, deletedAt: null },
        include: {
          hiringProcesses: {
            include: {
              stages: {
                orderBy: { position: 'asc' },
              },
            },
          },
          stageTimeLogs: {
            include: {
              stage: true,
            },
            orderBy: { enteredAt: 'asc' },
          },
        },
      });

      if (!candidate) {
        throw new EntityNotFoundException('Candidate', candidateUid);
      }

      // Verify company access if user is provided
      if (user && candidate.hiringProcesses && candidate.hiringProcesses.length > 0) {
        const userCompanyId = getUserCompanyId(user);
        if (userCompanyId !== null) {
          const hasAccessToCandidate = candidate.hiringProcesses.some(hp => hp.companyId === userCompanyId);
          if (!hasAccessToCandidate) {
            throw new EntityNotFoundException('Candidate', candidateUid);
          }
        }
      }

      // Build journey for each hiring process
      const journeys: CandidateJourneyResponseDto[] = candidate.hiringProcesses.map((hiringProcess) => {
        // Get time logs for this hiring process stages
        const stageTimeLogs = candidate.stageTimeLogs.filter((log) =>
          hiringProcess.stages.some((stage) => stage.id === log.stageId)
        );

        // Build stage steps
        const stageSteps: CandidateJourneyStepDto[] = hiringProcess.stages.map((stage) => {
          const timeLog = stageTimeLogs.find((log) => log.stageId === stage.id);

          return {
            stageUid: stage.uid,
            stageTitle: stage.title,
            stagePosition: stage.position,
            enteredAt: timeLog?.enteredAt || new Date(),
            exitedAt: timeLog?.exitedAt || null,
            durationMinutes: timeLog?.duration || null,
            isCurrent: stage.status === 'CURRENT',
          };
        });

        // Calculate total time
        const totalTimeMinutes = stageTimeLogs
          .filter((log) => log.duration !== null)
          .reduce((sum, log) => sum + (log.duration || 0), 0);

        return {
          candidateUid: candidate.uid,
          candidateName: candidate.name,
          hiringProcessUid: hiringProcess.uid,
          hiringProcessTitle: hiringProcess.title,
          totalTimeMinutes: totalTimeMinutes > 0 ? totalTimeMinutes : null,
          stages: stageSteps,
        };
      });

      return journeys;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get candidate journey: ${error.message}`,
      );
    }
  }
}
