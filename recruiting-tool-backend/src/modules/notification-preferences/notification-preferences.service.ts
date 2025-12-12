import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { NotificationPreferenceResponseDto, UpdateNotificationPreferencesDto } from './dto';

@Injectable()
export class NotificationPreferencesService {
  private readonly logger = new Logger(NotificationPreferencesService.name);

  constructor(private databaseService: DatabaseService) {}

  /**
   * Get notification preferences for a user (by userUid)
   * Creates default preferences if they don't exist
   */
  async getPreferences(userUid: string): Promise<NotificationPreferenceResponseDto> {
    this.logger.log(`Getting notification preferences for user ${userUid}`);

    // Find user by UID
    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
      include: {
        notificationPreferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    // If preferences don't exist, create them with defaults
    let preferences = user.notificationPreferences;
    if (!preferences) {
      this.logger.log(`No preferences found for user ${userUid}, creating defaults`);
      preferences = await this.databaseService.notificationPreference.create({
        data: {
          userId: user.id,
          // All defaults are true (set in schema)
        },
      });
    }

    return this.mapToResponseDto(preferences, user.uid);
  }

  /**
   * Update notification preferences for a user
   */
  async updatePreferences(userUid: string, dto: UpdateNotificationPreferencesDto): Promise<NotificationPreferenceResponseDto> {
    this.logger.log(`Updating notification preferences for user ${userUid}`);

    // Find user by UID
    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
      include: {
        notificationPreferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    // If preferences don't exist, create them
    if (!user.notificationPreferences) {
      this.logger.log(`No preferences found for user ${userUid}, creating with provided values`);
      const newPreferences = await this.databaseService.notificationPreference.create({
        data: {
          userId: user.id,
          ...dto,
        },
      });
      return this.mapToResponseDto(newPreferences, user.uid);
    }

    // Update existing preferences
    const updatedPreferences = await this.databaseService.notificationPreference.update({
      where: { userId: user.id },
      data: dto,
    });

    return this.mapToResponseDto(updatedPreferences, user.uid);
  }

  /**
   * Map Prisma NotificationPreference to ResponseDto
   * Converts internal IDs to UIDs for external API
   */
  private mapToResponseDto(preferences: any, userUid: string): NotificationPreferenceResponseDto {
    return {
      uid: preferences.uid,
      userUid,
      emailApplicationStatus: preferences.emailApplicationStatus,
      emailInterviewScheduled: preferences.emailInterviewScheduled,
      emailNewCandidate: preferences.emailNewCandidate,
      emailSystemAnnouncement: preferences.emailSystemAnnouncement,
      inAppApplicationStatus: preferences.inAppApplicationStatus,
      inAppInterviewScheduled: preferences.inAppInterviewScheduled,
      inAppNewCandidate: preferences.inAppNewCandidate,
      inAppSystemAnnouncement: preferences.inAppSystemAnnouncement,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    };
  }
}
