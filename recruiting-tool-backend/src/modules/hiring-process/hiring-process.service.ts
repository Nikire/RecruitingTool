import { forwardRef, Inject, Injectable, NotFoundException, HttpException, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import {
  CreateHiringProcessDto,
  HiringProcessFindDto,
  HiringProcessResponseDto,
  UpdateHiringProcessDto,
  PublicHiringProcessTrackingDto,
  HiringProcessGroupedFilterDto,
  HiringProcessGroupedResponseDto,
  PaginatedHiringProcessGroupsResponseDto,
} from './dto/hiring-process.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { HiringProcessOneMapper, includeHiringProcess } from './entities/hiring-process.entity';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { JobPositionService } from '../job-position/job-position.service';
import { CandidateService } from './modules/candidate/candidate.service';
import { StagesService } from './modules/stages/stages.service';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { User, NotificationType, RolesType } from '@prisma/client';
import { getUserCompanyId, verifyCompanyAccess } from 'src/utils/company-access.helper';
import { EntityNotFoundException } from 'src/common/exceptions';
import { QuotaService } from '../quota/quota.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class HiringProcessService {
  private readonly logger = new Logger(HiringProcessService.name);

  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
    @Inject(forwardRef(() => JobPositionService)) private readonly jobPositionService: JobPositionService,
    private readonly candidateService: CandidateService,
    private readonly stagesService: StagesService,
    private readonly quotaService: QuotaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  async create(createHiringProcessDto: CreateHiringProcessDto): Promise<HiringProcessResponseDto> {
    try {
      const candidate = await this.candidateService.findOne(createHiringProcessDto.candidateUid);

      if (!candidate) {
        throw new NotFoundException(`Candidate ${createHiringProcessDto.candidateUid} not found`);
      }

      const jobPosition = await this.jobPositionService.findOne(createHiringProcessDto.jobPositionUid);

      if (!jobPosition.stages?.length) {
        throw new NotFoundException(`There is no stages on job position ${jobPosition.uid}`);
      }

      // Get companyId from jobPosition - need to fetch the company ID from UID
      const company = await this.databaseService.company.findUnique({
        where: { uid: jobPosition.companyUid },
      });
      if (!company) {
        throw new NotFoundException(`Company ${jobPosition.companyUid} not found`);
      }
      const companyId = company.id;

      // Get jobPositionId for quota check
      const jobPositionEntity = await this.databaseService.jobPosition.findUnique({
        where: { uid: jobPosition.uid },
      });
      if (!jobPositionEntity) {
        throw new NotFoundException(`Job position ${jobPosition.uid} not found`);
      }

      // Check candidates per position quota
      await this.quotaService.checkCandidatesQuota(companyId, jobPositionEntity.id);

      const newHiringProcess = await this.databaseService.hiringProcess.create({
        data: {
          title: jobPosition.title + ' - ' + candidate.name,
          candidate: { connect: { uid: candidate.uid } },
          jobPosition: { connect: { uid: jobPosition.uid } },
          company: { connect: { id: companyId } },
        },
        include: includeHiringProcess,
      });

      // Copy stages from job position template, but link them ONLY to the hiring process
      // Do NOT include jobPositionUid so stages are isolated to this hiring process
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const copiedStages = jobPosition.stages.map(({ uid, jobPositionUid, status, position, ...rest }) => ({
        ...rest,
        hiringProcessUid: newHiringProcess.uid,
        // Note: jobPositionUid is intentionally omitted - stages belong to hiring process only
      }));
      await this.stagesService.bulkCreateStages(copiedStages);

      // Auto-generate access code for candidate tracking (valid 90 days)
      const accessCode = this.generateRandomCode(8);
      const codeExpiresAt = new Date();
      codeExpiresAt.setDate(codeExpiresAt.getDate() + 90);
      await this.databaseService.hiringProcess.update({
        where: { uid: newHiringProcess.uid },
        data: { accessCode, codeExpiresAt },
      });

      // Send tracking code email to the candidate
      try {
        await this.emailService.sendHiringProcessAccessCode(candidate.email, candidate.name, accessCode, newHiringProcess.uid, jobPosition.title, company.name);
      } catch (emailError) {
        this.logger.error(`Failed to send access code email to candidate ${candidate.email}: ${emailError.message}`);
      }

      // Notify HR users about new hiring process started
      try {
        const hrUsers = await this.databaseService.user.findMany({
          where: {
            companyId,
            roles: {
              hasSome: [RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN],
            },
          },
        });

        for (const hrUser of hrUsers) {
          try {
            await this.notificationsService.create({
              userUid: hrUser.uid,
              type: NotificationType.HIRING_PROCESS_STARTED,
              title: 'New Hiring Process Started',
              message: `Hiring process started for ${candidate.name} - ${jobPosition.title}`,
              metadata: {
                hiringProcessUid: newHiringProcess.uid,
                candidateUid: candidate.uid,
                candidateName: candidate.name,
                jobPositionUid: jobPosition.uid,
                jobPositionTitle: jobPosition.title,
              },
            });
          } catch (notifError) {
            this.logger.error(`Failed to create notification for user ${hrUser.uid}: ${notifError.message}`);
          }
        }

        // Notify candidate if they have a user account
        const candidateUser = await this.databaseService.user.findFirst({
          where: { email: candidate.email },
        });

        if (candidateUser) {
          try {
            await this.notificationsService.create({
              userUid: candidateUser.uid,
              type: NotificationType.CANDIDATE_ADDED_TO_PROCESS,
              title: 'Added to Hiring Process',
              message: `You've been added to the hiring process for ${jobPosition.title}`,
              metadata: {
                hiringProcessUid: newHiringProcess.uid,
                jobPositionUid: jobPosition.uid,
                jobPositionTitle: jobPosition.title,
              },
            });
          } catch (notifError) {
            this.logger.error(`Failed to create notification for candidate ${candidateUser.uid}: ${notifError.message}`);
          }
        }
      } catch (notifError) {
        this.logger.error(`Failed to send hiring process started notifications: ${notifError.message}`);
      }

      return HiringProcessOneMapper(newHiringProcess);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create: ${error.message}`);
    }
  }

  async list(
    paginationDto: PaginationDto & { status?: string; companyUid?: string; positionUid?: string; candidateUid?: string; startDate?: string; endDate?: string },
    user: User,
  ): Promise<PaginatedResponse<HiringProcessResponseDto>> {
    try {
      const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc', status, companyUid, positionUid, candidateUid, startDate, endDate } = paginationDto;
      const skip = (page - 1) * pageSize;

      // Build where clause for search
      const where: any = search
        ? {
            OR: [{ title: { contains: search, mode: 'insensitive' as const } }],
          }
        : {};

      // Exclude soft-deleted records
      where.deletedAt = null;

      // Add status filter
      if (status) {
        where.status = status;
      }

      // Add company filter by UID
      if (companyUid) {
        const company = await this.databaseService.company.findUnique({
          where: { uid: companyUid },
        });
        if (company) {
          where.companyId = company.id;
        }
      }

      // Add job position filter by UID
      if (positionUid) {
        const jobPosition = await this.databaseService.jobPosition.findUnique({
          where: { uid: positionUid },
        });
        if (jobPosition) {
          where.jobPositionId = jobPosition.id;
        }
      }

      // Add candidate filter by UID
      if (candidateUid) {
        const candidate = await this.databaseService.candidate.findUnique({
          where: { uid: candidateUid },
        });
        if (candidate) {
          where.candidateId = candidate.id;
        }
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

      // Add company filter for HR and USER roles (override if not admin/super admin)
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        where.companyId = userCompanyId;
      }

      // Get total count
      const total = await this.databaseService.hiringProcess.count({ where });

      // Get paginated data
      const hiringProcesses = await this.databaseService.hiringProcess.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: includeHiringProcess,
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: hiringProcesses.map((hp) => HiringProcessOneMapper(hp)),
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
      throw new InternalServerErrorException(`Failed to list: ${error.message}`);
    }
  }

  async listGrouped(filterDto: HiringProcessGroupedFilterDto, user: User): Promise<PaginatedHiringProcessGroupsResponseDto> {
    try {
      const page = Number(filterDto.page) || 1;
      const limit = Number(filterDto.limit) || 10;
      const { search, status } = filterDto;

      const where: any = { deletedAt: null };

      if (search) {
        where.OR = [{ title: { contains: search, mode: 'insensitive' as const } }];
      }

      if (status) {
        where.status = status;
      }

      // Add company filter for HR and USER roles
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        where.companyId = userCompanyId;
      }

      // Fetch all matching hiring processes to group by job position
      const allProcesses = await this.databaseService.hiringProcess.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: includeHiringProcess,
      });

      // Group by job position
      const groupMap = new Map<string, HiringProcessGroupedResponseDto>();
      for (const process of allProcesses) {
        const key = process.jobPosition?.uid ?? '__no_position__';
        const title = process.jobPosition?.title ?? 'No Job Position';

        if (!groupMap.has(key)) {
          groupMap.set(key, {
            jobPositionUid: process.jobPosition?.uid ?? null,
            jobPositionTitle: title,
            processes: [],
          });
        }
        groupMap.get(key)!.processes.push(HiringProcessOneMapper(process));
      }

      // Sort groups: named positions alphabetically first, then "no position" last
      const allGroups = Array.from(groupMap.values()).sort((a, b) => {
        if (a.jobPositionUid === null) return 1;
        if (b.jobPositionUid === null) return -1;
        return a.jobPositionTitle.localeCompare(b.jobPositionTitle);
      });

      const total = allGroups.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedGroups = allGroups.slice(skip, skip + limit);

      return {
        data: paginatedGroups,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to list grouped: ${error.message}`);
    }
  }

  async findAll(hiringProcessFindDto: HiringProcessFindDto, user: User): Promise<Array<HiringProcessResponseDto>> {
    try {
      const where: any = hiringProcessFindDto.candidateUid ? { candidate: { uid: hiringProcessFindDto.candidateUid }, deletedAt: null } : { deletedAt: null };

      // Add company filter for HR and USER roles
      const userCompanyId = getUserCompanyId(user);
      if (userCompanyId !== null) {
        where.companyId = userCompanyId;
      }

      const hiringProcesses = await this.databaseService.hiringProcess.findMany({
        include: includeHiringProcess,
        where,
      });
      return hiringProcesses.map((hp) => HiringProcessOneMapper(hp));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find all: ${error.message}`);
    }
  }

  async findOne(uid: string, user?: User): Promise<HiringProcessResponseDto> {
    try {
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { uid, deletedAt: null },
        include: includeHiringProcess,
      });

      if (!hiringProcess) {
        throw new EntityNotFoundException('Hiring process', uid);
      }

      // Verify company access if user is provided
      if (user) {
        verifyCompanyAccess(user, hiringProcess.companyId);
      }

      return HiringProcessOneMapper(hiringProcess);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find one: ${error.message}`);
    }
  }

  async update(uid: string, updateHiringProcessDto: UpdateHiringProcessDto, user: User): Promise<HiringProcessResponseDto> {
    try {
      if (!uid) {
        throw new EntityNotFoundException('Hiring process', uid);
      }

      // Verify company access before update (exclude soft-deleted)
      const existingHiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { uid, deletedAt: null },
        include: {
          candidate: true,
          jobPosition: true,
        },
      });

      if (!existingHiringProcess) {
        throw new EntityNotFoundException('Hiring process', uid);
      }

      verifyCompanyAccess(user, existingHiringProcess.companyId);

      // Track status change for notifications
      const statusChanged = updateHiringProcessDto.status && updateHiringProcessDto.status !== existingHiringProcess.status;
      const oldStatus = existingHiringProcess.status;

      const hiringProcess = await this.databaseService.hiringProcess.update({
        where: { uid },
        data: { ...updateHiringProcessDto },
        include: includeHiringProcess,
      });

      // Cascade-archive pending/reviewed applications when hiring process is closed
      if (updateHiringProcessDto.status && ['CLOSED', 'REJECTED', 'CANCELLED'].includes(updateHiringProcessDto.status)) {
        await this.databaseService.application.updateMany({
          where: {
            jobPositionId: existingHiringProcess.jobPositionId,
            status: { in: ['PENDING', 'REVIEWED'] as any[] },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { status: 'ARCHIVED' as any },
        });

        // Cascade-cancel active/pending stages belonging to this hiring process
        const activeStages = await this.databaseService.stage.findMany({
          where: {
            hiringProcessId: existingHiringProcess.id,
            status: { in: ['OPEN', 'CURRENT'] as any[] },
            deletedAt: null,
          },
          select: { id: true },
        });

        if (activeStages.length > 0) {
          const activeStageIds = activeStages.map((s) => s.id);

          // Cancel the active/current stages
          await this.databaseService.stage.updateMany({
            where: { id: { in: activeStageIds } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { status: 'CANCELLED' as any },
          });

          // Cancel any SCHEDULED or PENDING interviews attached to those stages
          await this.databaseService.interview.updateMany({
            where: {
              stageId: { in: activeStageIds },
              status: { in: ['SCHEDULED', 'PENDING'] as any[] },
              deletedAt: null,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { status: 'CANCELLED' as any },
          });
        }
      }

      // Auto-close the job position when a hiring process is marked as CLOSED (hired)
      if (updateHiringProcessDto.status === 'CLOSED' && existingHiringProcess.jobPositionId) {
        try {
          const jobPosition = await this.databaseService.jobPosition.findUnique({
            where: { id: existingHiringProcess.jobPositionId },
          });

          if (jobPosition && jobPosition.status !== 'CLOSED') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await this.databaseService.jobPosition.update({
              where: { id: existingHiringProcess.jobPositionId },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: { status: 'CLOSED' as any },
            });
            this.logger.log(`Auto-closed job position ${jobPosition.uid} because hiring process ${uid} was marked as hired (CLOSED)`);
          }
        } catch (autoCloseError) {
          // Log but don't fail the hiring process update
          this.logger.error(`Failed to auto-close job position for hiring process ${uid}: ${autoCloseError.message}`);
        }
      }

      // Send notifications if status changed
      if (statusChanged) {
        try {
          // Determine notification type based on new status
          let notificationType: NotificationType;
          let title: string;
          let message: string;

          if (updateHiringProcessDto.status === 'CLOSED') {
            notificationType = NotificationType.HIRING_PROCESS_COMPLETED;
            title = 'Hiring Process Completed';
            message = `Hiring process for ${existingHiringProcess.candidate?.name || 'candidate'} - ${existingHiringProcess.jobPosition?.title || 'position'} has been completed`;
          } else if (updateHiringProcessDto.status === 'REJECTED') {
            notificationType = NotificationType.CANDIDATE_STAGE_REJECTED;
            title = 'Candidate Rejected';
            message = `${existingHiringProcess.candidate?.name || 'Candidate'} was rejected for ${existingHiringProcess.jobPosition?.title || 'position'}`;
          } else if (updateHiringProcessDto.status === 'CANCELLED') {
            notificationType = NotificationType.HIRING_PROCESS_STAGE_CHANGED;
            title = 'Hiring Process Cancelled';
            message = `Hiring process for ${existingHiringProcess.candidate?.name || 'candidate'} - ${existingHiringProcess.jobPosition?.title || 'position'} has been cancelled`;
          } else {
            // Generic status change (OPEN, IN_PROGRESS)
            notificationType = NotificationType.HIRING_PROCESS_STAGE_CHANGED;
            title = 'Hiring Process Status Changed';
            message = `Hiring process status changed from ${oldStatus} to ${updateHiringProcessDto.status}`;
          }

          // Notify HR users
          const hrUsers = await this.databaseService.user.findMany({
            where: {
              companyId: existingHiringProcess.companyId,
              roles: {
                hasSome: [RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN],
              },
            },
          });

          for (const hrUser of hrUsers) {
            try {
              await this.notificationsService.create({
                userUid: hrUser.uid,
                type: notificationType,
                title,
                message,
                metadata: {
                  hiringProcessUid: uid,
                  candidateUid: existingHiringProcess.candidate?.uid,
                  candidateName: existingHiringProcess.candidate?.name,
                  jobPositionUid: existingHiringProcess.jobPosition?.uid,
                  jobPositionTitle: existingHiringProcess.jobPosition?.title,
                  oldStatus,
                  newStatus: updateHiringProcessDto.status,
                },
              });
            } catch (notifError) {
              this.logger.error(`Failed to create notification for user ${hrUser.uid}: ${notifError.message}`);
            }
          }

          // Notify candidate if they have a user account
          if (existingHiringProcess.candidate?.email) {
            const candidateUser = await this.databaseService.user.findFirst({
              where: { email: existingHiringProcess.candidate.email },
            });

            if (candidateUser) {
              try {
                await this.notificationsService.create({
                  userUid: candidateUser.uid,
                  type: notificationType,
                  title,
                  message,
                  metadata: {
                    hiringProcessUid: uid,
                    jobPositionUid: existingHiringProcess.jobPosition?.uid,
                    jobPositionTitle: existingHiringProcess.jobPosition?.title,
                    oldStatus,
                    newStatus: updateHiringProcessDto.status,
                  },
                });
              } catch (notifError) {
                this.logger.error(`Failed to create notification for candidate ${candidateUser.uid}: ${notifError.message}`);
              }
            }
          }
        } catch (notifError) {
          this.logger.error(`Failed to send status change notifications: ${notifError.message}`);
        }
      }

      return HiringProcessOneMapper(hiringProcess);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to update: ${error.message}`);
    }
  }

  async remove(uid: string, user: User): Promise<MessageResponseDto> {
    try {
      // Verify company access before soft delete (exclude already soft-deleted)
      const existingHiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { uid, deletedAt: null },
      });

      if (!existingHiringProcess) {
        throw new EntityNotFoundException('Hiring process', uid);
      }

      verifyCompanyAccess(user, existingHiringProcess.companyId);

      // Soft delete: set deletedAt instead of hard delete
      await this.databaseService.hiringProcess.update({
        where: { uid },
        data: { deletedAt: new Date() },
      });

      return { message: `Hiring Process deleted successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to remove: ${error.message}`);
    }
  }

  async progressToNextStage(hiringProcessUid: string, user: User) {
    try {
      // Verify company access before progressing stage (exclude soft-deleted)
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { uid: hiringProcessUid, deletedAt: null },
      });

      if (!hiringProcess) {
        throw new EntityNotFoundException('Hiring process', hiringProcessUid);
      }

      verifyCompanyAccess(user, hiringProcess.companyId);

      return this.stagesService.progressToNextStage(hiringProcessUid);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to progress to next stage: ${error.message}`);
    }
  }

  async moveToSpecificStage(hiringProcessUid: string, targetStageUid: string, user: User) {
    try {
      // Verify company access before moving to specific stage (exclude soft-deleted)
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { uid: hiringProcessUid, deletedAt: null },
      });

      if (!hiringProcess) {
        throw new EntityNotFoundException('Hiring process', hiringProcessUid);
      }

      verifyCompanyAccess(user, hiringProcess.companyId);

      return this.stagesService.moveToSpecificStage(hiringProcessUid, targetStageUid);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to move to specific stage: ${error.message}`);
    }
  }

  /**
   * Generate an access code for a hiring process (HR only)
   * Access code is 8 alphanumeric characters and expires in 30 days
   */
  async generateAccessCode(hiringProcessUid: string, user: User) {
    try {
      // Verify hiring process exists and user has access (exclude soft-deleted)
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { uid: hiringProcessUid, deletedAt: null },
      });

      if (!hiringProcess) {
        throw new EntityNotFoundException('Hiring process', hiringProcessUid);
      }

      verifyCompanyAccess(user, hiringProcess.companyId);

      // Generate 8-character alphanumeric code
      const accessCode = this.generateRandomCode(8);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

      // Update hiring process with access code
      await this.databaseService.hiringProcess.update({
        where: { uid: hiringProcessUid },
        data: {
          accessCode,
          codeExpiresAt: expiresAt,
        },
      });

      return {
        accessCode,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to generate access code: ${error.message}`);
    }
  }

  /**
   * Get hiring process status by access code (PUBLIC endpoint - no auth)
   * Returns limited information for candidate privacy
   */
  async getStatusByAccessCode(accessCode: string) {
    try {
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { accessCode, deletedAt: null },
        include: {
          candidate: true,
          jobPosition: true,
          company: true,
          stages: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!hiringProcess) {
        throw new NotFoundException('Invalid or expired access code');
      }

      // Check if code is expired
      if (hiringProcess.codeExpiresAt && hiringProcess.codeExpiresAt < new Date()) {
        throw new NotFoundException('Access code has expired');
      }

      // Update access tracking
      await this.databaseService.hiringProcess.update({
        where: { accessCode },
        data: {
          lastAccessedAt: new Date(),
          accessCount: { increment: 1 },
        },
      });

      // Find current stage (first stage with CURRENT status)
      const currentStage = hiringProcess.stages.find((stage) => stage.status === 'CURRENT');

      // Extract first name only for privacy
      const candidateName = hiringProcess.candidate?.name?.split(' ')[0] || 'Candidate';

      return {
        candidateName,
        positionTitle: hiringProcess.jobPosition?.title || 'Position',
        companyName: hiringProcess.company?.name || 'Company',
        currentStage: currentStage?.title,
        status: hiringProcess.status,
        lastUpdated: hiringProcess.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to retrieve status: ${error.message}`);
    }
  }

  /**
   * Get public tracking view of a hiring process by UID (NO auth required)
   * Requires an access code that was emailed to the candidate on process creation.
   * Returns candidate-facing read-only information: name, position, company, and ordered stages.
   */
  async getPublicTracking(uid: string, accessCode: string): Promise<PublicHiringProcessTrackingDto> {
    try {
      const hiringProcess = await this.databaseService.hiringProcess.findFirst({
        where: { uid, deletedAt: null },
        include: {
          candidate: true,
          jobPosition: true,
          company: true,
          stages: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!hiringProcess) {
        throw new NotFoundException('Hiring process not found');
      }

      // Validate access code
      if (!hiringProcess.accessCode || hiringProcess.accessCode !== accessCode) {
        throw new UnauthorizedException('Invalid access code');
      }

      // Check if code is expired
      if (hiringProcess.codeExpiresAt && hiringProcess.codeExpiresAt < new Date()) {
        throw new UnauthorizedException('Access code has expired');
      }

      // Map each stage to a candidate-facing status:
      //   DONE / CANCELLED → COMPLETED
      //   CURRENT          → CURRENT
      //   OPEN             → PENDING
      const stages = hiringProcess.stages.map((stage) => {
        let publicStatus: 'COMPLETED' | 'CURRENT' | 'PENDING';
        if (stage.status === 'DONE' || stage.status === 'CANCELLED') {
          publicStatus = 'COMPLETED';
        } else if (stage.status === 'CURRENT') {
          publicStatus = 'CURRENT';
        } else {
          publicStatus = 'PENDING';
        }

        return {
          uid: stage.uid,
          title: stage.title,
          type: stage.type,
          position: stage.position,
          status: publicStatus,
        };
      });

      return {
        uid: hiringProcess.uid,
        candidateName: hiringProcess.candidate?.name || '',
        positionTitle: hiringProcess.jobPosition?.title || '',
        companyName: hiringProcess.company?.name || '',
        status: hiringProcess.status,
        stages,
        lastUpdated: hiringProcess.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to retrieve public tracking: ${error.message}`);
    }
  }

  /**
   * Generate a random alphanumeric code of specified length
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
