import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JobModerationStatus, NotificationType, Prisma, User } from '@prisma/client';
import { DatabaseService } from '../shared/modules/database/database.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CacheService } from '../cache/cache.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginatedResponse } from 'src/dto/pagination.dto';
import { EntityNotFoundException } from 'src/common/exceptions';
import { hasActivePaidSubscription } from 'src/utils/subscription-status.helper';
import { ApproveJobPositionDto, JobModerationQueryDto, JobModerationStatsDto, ModerationJobPositionItemDto, RejectJobPositionDto } from './dto/job-position-moderation.dto';

const moderationInclude = {
  company: {
    select: {
      uid: true,
      name: true,
      logoUrl: true,
      subscription: {
        select: { status: true, plan: true, currentPeriodEnd: true, gracePeriodEndsAt: true },
      },
    },
  },
  createdBy: { select: { uid: true, name: true, email: true } },
  moderatedBy: { select: { uid: true, name: true } },
} satisfies Prisma.JobPositionInclude;

type ModerationJobPosition = Prisma.JobPositionGetPayload<{ include: typeof moderationInclude }>;

/**
 * Platform-level moderation of job postings (anti-spam gate).
 *
 * Postings created by a company WITHOUT an active paid subscription land in
 * PENDING_APPROVAL and stay off the public careers board until a SUPER_ADMIN
 * approves them. Paid companies auto-approve on create.
 */
@Injectable()
export class JobPositionModerationService {
  private readonly logger = new Logger(JobPositionModerationService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly auditLogService: AuditLogService,
    private readonly cacheService: CacheService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Paginated moderation queue across every company.
   * Defaults to the PENDING_APPROVAL bucket.
   */
  async list(query: JobModerationQueryDto): Promise<PaginatedResponse<ModerationJobPositionItemDto>> {
    try {
      const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * pageSize;

      const where: Prisma.JobPositionWhereInput = {
        deletedAt: null,
        moderationStatus: query.moderationStatus ?? JobModerationStatus.PENDING_APPROVAL,
      };

      if (search) {
        where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { company: { name: { contains: search, mode: 'insensitive' } } }];
      }

      if (query.companyUid) {
        where.company = { uid: query.companyUid };
      }

      const allowedSortFields = ['createdAt', 'title', 'moderatedAt'];
      const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

      const [total, items] = await Promise.all([
        this.databaseService.jobPosition.count({ where }),
        this.databaseService.jobPosition.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { [orderByField]: sortOrder },
          include: moderationInclude,
        }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: items.map((item) => this.toModerationItemDto(item)),
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
      throw new InternalServerErrorException(`Failed to list job postings for moderation: ${error.message}`);
    }
  }

  /** Counters for the moderation dashboard. */
  async getStats(): Promise<JobModerationStatsDto> {
    try {
      const [pending, approved, rejected, total] = await Promise.all([
        this.databaseService.jobPosition.count({ where: { deletedAt: null, moderationStatus: JobModerationStatus.PENDING_APPROVAL } }),
        this.databaseService.jobPosition.count({ where: { deletedAt: null, moderationStatus: JobModerationStatus.APPROVED } }),
        this.databaseService.jobPosition.count({ where: { deletedAt: null, moderationStatus: JobModerationStatus.REJECTED } }),
        this.databaseService.jobPosition.count({ where: { deletedAt: null } }),
      ]);

      return { pending, approved, rejected, total };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get moderation stats: ${error.message}`);
    }
  }

  /** Single posting with everything a moderator needs to make a decision. */
  async findOne(uid: string): Promise<ModerationJobPositionItemDto> {
    const jobPosition = await this.databaseService.jobPosition.findFirst({
      where: { uid, deletedAt: null },
      include: moderationInclude,
    });

    if (!jobPosition) {
      throw new EntityNotFoundException('Job position', uid);
    }

    return this.toModerationItemDto(jobPosition);
  }

  /** Approve a posting so it becomes visible on the public careers board. */
  async approve(uid: string, dto: ApproveJobPositionDto, moderator: User): Promise<ModerationJobPositionItemDto> {
    return this.moderate(uid, JobModerationStatus.APPROVED, dto.reason ?? null, moderator);
  }

  /** Reject a posting. The reason is mandatory and is surfaced to the company. */
  async reject(uid: string, dto: RejectJobPositionDto, moderator: User): Promise<ModerationJobPositionItemDto> {
    return this.moderate(uid, JobModerationStatus.REJECTED, dto.reason, moderator);
  }

  private async moderate(uid: string, decision: JobModerationStatus, reason: string | null, moderator: User): Promise<ModerationJobPositionItemDto> {
    try {
      const existing = await this.databaseService.jobPosition.findFirst({
        where: { uid, deletedAt: null },
        select: { id: true, uid: true, title: true, companyId: true, moderationStatus: true, createdById: true },
      });

      if (!existing) {
        throw new EntityNotFoundException('Job position', uid);
      }

      if (existing.moderationStatus === decision) {
        throw new BadRequestException(`Job position is already ${decision}`);
      }

      const updated = await this.databaseService.jobPosition.update({
        where: { id: existing.id },
        data: {
          moderationStatus: decision,
          moderationReason: reason,
          moderatedAt: new Date(),
          moderatedById: moderator.id,
        },
        include: moderationInclude,
      });

      await this.auditLogService.logAction({
        action: decision === JobModerationStatus.APPROVED ? 'MODERATION_APPROVE' : 'MODERATION_REJECT',
        entityType: 'JobPosition',
        entityUid: existing.uid,
        entityId: existing.id,
        user: moderator,
        metadata: {
          title: existing.title,
          companyId: existing.companyId,
          previousModerationStatus: existing.moderationStatus,
          newModerationStatus: decision,
          reason,
        },
      });

      await this.notifyCreator(updated, decision, reason);

      // The public careers board is cached — drop it so the decision takes effect at once.
      await this.cacheService.invalidate(`job-position:${existing.uid}`);
      await this.cacheService.invalidatePattern('job-position');
      await this.cacheService.invalidatePattern('company');

      return this.toModerationItemDto(updated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to moderate job position: ${error.message}`);
    }
  }

  /**
   * Best-effort in-app notification to the user who created the posting.
   * Never fails the moderation decision.
   */
  private async notifyCreator(jobPosition: ModerationJobPosition, decision: JobModerationStatus, reason: string | null): Promise<void> {
    try {
      const approved = decision === JobModerationStatus.APPROVED;

      await this.notificationsService.create({
        userUid: jobPosition.createdBy.uid,
        type: approved ? NotificationType.JOB_POSITION_APPROVED : NotificationType.JOB_POSITION_REJECTED,
        title: approved ? 'Job posting approved' : 'Job posting rejected',
        message: approved
          ? `Your job posting "${jobPosition.title}" was approved and is now live on the public job board.`
          : `Your job posting "${jobPosition.title}" was rejected${reason ? `: ${reason}` : '.'}`,
        metadata: {
          jobPositionUid: jobPosition.uid,
          moderationStatus: decision,
          moderationReason: reason,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to notify creator of job position ${jobPosition.uid}: ${error.message}`);
    }
  }

  private toModerationItemDto(jobPosition: ModerationJobPosition): ModerationJobPositionItemDto {
    return {
      uid: jobPosition.uid,
      title: jobPosition.title,
      description: jobPosition.description,
      status: jobPosition.status,
      moderationStatus: jobPosition.moderationStatus,
      moderationReason: jobPosition.moderationReason,
      moderatedAt: jobPosition.moderatedAt,
      moderatedByUid: jobPosition.moderatedBy?.uid ?? null,
      moderatedByName: jobPosition.moderatedBy?.name ?? null,
      companyUid: jobPosition.company.uid,
      companyName: jobPosition.company.name,
      companyLogoUrl: jobPosition.company.logoUrl,
      companyPlan: jobPosition.company.subscription?.plan ?? 'FREE',
      companyHasActiveSubscription: hasActivePaidSubscription(jobPosition.company.subscription),
      createdByUid: jobPosition.createdBy.uid,
      createdByName: jobPosition.createdBy.name,
      createdByEmail: jobPosition.createdBy.email,
      jobType: jobPosition.jobType,
      workLocation: jobPosition.workLocation,
      experienceLevel: jobPosition.experienceLevel,
      city: jobPosition.city,
      country: jobPosition.country,
      createdAt: jobPosition.createdAt,
    };
  }
}
