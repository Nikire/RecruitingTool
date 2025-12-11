import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { SseService } from '../sse/sse.service';
import { CreateNotificationDto, NotificationResponseDto, GetNotificationsQueryDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private databaseService: DatabaseService,
    private sseService: SseService,
  ) {}

  /**
   * Create a new notification for a user
   */
  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    this.logger.log(`Creating notification for user ${dto.userUid}`);

    // Find user by UID with company relation
    const user = await this.databaseService.user.findUnique({
      where: { uid: dto.userUid },
      include: { company: { select: { uid: true } } },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${dto.userUid} not found`);
    }

    // Create notification
    const notification = await this.databaseService.notification.create({
      data: {
        userId: user.id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata || null,
      },
      include: {
        user: {
          select: { uid: true, company: { select: { uid: true } } },
        },
      },
    });

    // Emit SSE event for real-time notification delivery
    this.sseService.emitNotification(
      notification.uid,
      notification.type,
      notification.title,
      notification.message,
      notification.metadata as Record<string, any> | null,
      user.uid,
      user.company?.uid,
    );

    return this.mapToResponseDto(notification);
  }

  /**
   * Get all notifications for a user with pagination
   */
  async findAll(userUid: string, query: GetNotificationsQueryDto): Promise<NotificationResponseDto[]> {
    this.logger.log(`Fetching notifications for user ${userUid}`);

    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const where: any = { userId: user.id };
    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    const notifications = await this.databaseService.notification.findMany({
      where,
      include: {
        user: {
          select: { uid: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.skip,
    });

    return notifications.map(this.mapToResponseDto);
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userUid: string): Promise<number> {
    this.logger.log(`Getting unread count for user ${userUid}`);

    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    return this.databaseService.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(uid: string, userUid: string): Promise<NotificationResponseDto> {
    this.logger.log(`Marking notification ${uid} as read for user ${userUid}`);

    const notification = await this.databaseService.notification.findUnique({
      where: { uid },
      include: {
        user: {
          select: { uid: true },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with UID ${uid} not found`);
    }

    // Verify the notification belongs to the user
    if (notification.user.uid !== userUid) {
      throw new NotFoundException(`Notification with UID ${uid} not found`);
    }

    const updated = await this.databaseService.notification.update({
      where: { uid },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        user: {
          select: { uid: true },
        },
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userUid: string): Promise<{ count: number }> {
    this.logger.log(`Marking all notifications as read for user ${userUid}`);

    const user = await this.databaseService.user.findUnique({
      where: { uid: userUid },
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${userUid} not found`);
    }

    const result = await this.databaseService.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  /**
   * Delete a notification
   */
  async remove(uid: string, userUid: string): Promise<void> {
    this.logger.log(`Deleting notification ${uid} for user ${userUid}`);

    const notification = await this.databaseService.notification.findUnique({
      where: { uid },
      include: {
        user: {
          select: { uid: true },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with UID ${uid} not found`);
    }

    // Verify the notification belongs to the user
    if (notification.user.uid !== userUid) {
      throw new NotFoundException(`Notification with UID ${uid} not found`);
    }

    await this.databaseService.notification.delete({
      where: { uid },
    });
  }

  /**
   * Map Prisma notification to response DTO
   */
  private mapToResponseDto(notification: any): NotificationResponseDto {
    return {
      uid: notification.uid,
      userUid: notification.user.uid,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }
}
