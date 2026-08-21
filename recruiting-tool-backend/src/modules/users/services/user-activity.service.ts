import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../shared/modules/database/database.service';
import { CreateUserActivityLogDto, UserActivityLogResponseDto } from '../dto/users.dto';

/**
 * Canonical catalogue of every value written to `UserActivityLog.action`.
 *
 * WHY A CONST MAP INSTEAD OF FREE-FORM STRINGS: `UserActivityLog` is this
 * product's server-side events table. A typo in an action name does not fail
 * anywhere - it silently writes a row that no funnel, cohort or retention
 * query will ever match, orphaning the analysis. Declaring the names once here
 * and referencing them by symbol turns that class of bug into a compile error.
 *
 * DO NOT rename or delete an entry once it has shipped: historical rows keep
 * the old string forever. Add a new entry and deprecate the old one instead.
 */
export const USER_ACTIVITY_ACTIONS = {
  // --- Auth / account lifecycle (pre-existing) ---
  LOGIN: 'LOGIN',
  LINK_SOCIAL_ACCOUNT: 'LINK_SOCIAL_ACCOUNT',
  UNLINK_SOCIAL_ACCOUNT: 'UNLINK_SOCIAL_ACCOUNT',
  DEACTIVATED: 'DEACTIVATED',
  REACTIVATED: 'REACTIVATED',
  RESUME_UPLOADED: 'RESUME_UPLOADED',
  RESUME_DELETED: 'RESUME_DELETED',

  // --- Activation milestones (the events that predict retention) ---
  /** A job position was created. metadata.isFirst marks the company's first ever. */
  JOB_POSITION_CREATED: 'JOB_POSITION_CREATED',
  /** A candidate was created. metadata.isFirst marks the company's first ever. */
  CANDIDATE_CREATED: 'CANDIDATE_CREATED',
  /** A hiring process moved forward a stage. metadata.isFirst is null - see ActivationEventsService. */
  APPLICATION_STAGE_ADVANCED: 'APPLICATION_STAGE_ADVANCED',
  /** A teammate invitation was sent. Every occurrence is emitted. */
  TEAMMATE_INVITED: 'TEAMMATE_INVITED',
  /** The post-signup onboarding wizard was finished. */
  ONBOARDING_COMPLETED: 'ONBOARDING_COMPLETED',
} as const;

/**
 * Union of every valid `UserActivityLog.action`. Emitters must use
 * `USER_ACTIVITY_ACTIONS.X` - arbitrary strings are a compile error.
 */
export type UserActivityAction = (typeof USER_ACTIVITY_ACTIONS)[keyof typeof USER_ACTIVITY_ACTIONS];

@Injectable()
export class UserActivityService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Log a user activity
   * @param userId - Internal user ID
   * @param createActivityLogDto - Activity log data
   * @returns Promise<UserActivityLogResponseDto>
   */
  async logActivity(userId: number, createActivityLogDto: CreateUserActivityLogDto): Promise<UserActivityLogResponseDto> {
    try {
      const activityLog = await this.databaseService.userActivityLog.create({
        data: {
          userId,
          action: createActivityLogDto.action,
          ipAddress: createActivityLogDto.ipAddress,
          userAgent: createActivityLogDto.userAgent,
          metadata: createActivityLogDto.metadata || {},
        },
        include: {
          user: true,
        },
      });

      return this.mapActivityLogToDto(activityLog);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to log activity: ${error.message}`);
    }
  }

  /**
   * Get activity logs for a specific user
   * @param userUid - User UID
   * @returns Promise<UserActivityLogResponseDto[]>
   */
  async getUserActivity(userUid: string): Promise<UserActivityLogResponseDto[]> {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { uid: userUid },
      });

      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      const activityLogs = await this.databaseService.userActivityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 activities
        include: {
          user: true,
        },
      });

      return activityLogs.map((log) => this.mapActivityLogToDto(log));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get user activity: ${error.message}`);
    }
  }

  /**
   * Map UserActivityLog entity to DTO
   */
  private mapActivityLogToDto(activityLog: any): UserActivityLogResponseDto {
    return {
      uid: activityLog.uid,
      userUid: activityLog.user.uid,
      action: activityLog.action,
      ipAddress: activityLog.ipAddress,
      userAgent: activityLog.userAgent,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt.toISOString(),
    };
  }
}
