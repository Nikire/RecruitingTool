import { Injectable, NotFoundException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CandidateResponseDto, CreateCandidateDto, UpdateCandidateDto } from './dto/candidate.dto';
import { CandidateMapper } from './entities/candidate.entity';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { CandidateNoteResponseDto, CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
import { User } from '@prisma/client';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';
import { EntityNotFoundException } from 'src/common/exceptions';
import { CandidateJourneyResponseDto, CandidateJourneyStepDto } from '../stages/dto/stage-time-tracking.dto';

@Injectable()
export class CandidateService {
  constructor(private databaseService: DatabaseService) {}

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
    return CandidateMapper(candidate);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create: ${error.message}`,
      );
    }}

  async findOne(uid: string, user?: User): Promise<CandidateResponseDto> {
    try {
    const candidate = await this.databaseService.candidate.findUnique({
      where: { uid },
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
    const where: any = {};

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

    // Verify company access before delete (through hiring processes)
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

    const candidate = await this.databaseService.candidate.delete({ where: { uid } });

    return { message: `Candidate deleted successfully` };
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove: ${error.message}`,
      );
    }}

  // Candidate Notes methods
  async createNote(createNoteDto: CreateCandidateNoteDto, authorUserId: number): Promise<CandidateNoteResponseDto> {
    try {
    // Find candidate by UID to get the numeric ID
    const candidate = await this.databaseService.candidate.findUnique({
      where: { uid: createNoteDto.candidateUid },
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
    const candidate = await this.databaseService.candidate.findUnique({
      where: { uid: candidateUid },
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
      const candidate = await this.databaseService.candidate.findUnique({
        where: { uid: candidateUid },
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
