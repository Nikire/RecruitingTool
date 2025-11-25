import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../shared/modules/database/database.service';
import { CreateUserActivityLogDto, UserActivityLogResponseDto } from '../dto/users.dto';
import { UserActivityLog } from '@prisma/client';

@Injectable()
export class UserActivityService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Log a user activity
   * @param userId - Internal user ID
   * @param createActivityLogDto - Activity log data
   * @returns Promise<UserActivityLogResponseDto>
   */
  async logActivity(
    userId: number,
    createActivityLogDto: CreateUserActivityLogDto,
  ): Promise<UserActivityLogResponseDto> {
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
      throw new InternalServerErrorException(
        `Failed to log activity: ${error.message}`,
      );
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
      throw new InternalServerErrorException(
        `Failed to get user activity: ${error.message}`,
      );
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
