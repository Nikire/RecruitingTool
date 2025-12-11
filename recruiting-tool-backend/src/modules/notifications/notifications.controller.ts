import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, NotificationResponseDto, GetNotificationsQueryDto } from './dto';
import { AuthGuard } from '../shared/modules/auth/guards/auth.guard';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification (admin use)' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [NotificationResponseDto],
  })
  async findAll(@CurrentUser() currentUser: User, @Query() query: GetNotificationsQueryDto): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll(currentUser.uid, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  @ApiResponse({
    status: 200,
    description: 'Unread notification count',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  async getUnreadCount(@CurrentUser() currentUser: User): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(currentUser.uid);
    return { count };
  }

  @Patch(':uid/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(uid, currentUser.uid);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 10 },
      },
    },
  })
  async markAllAsRead(@CurrentUser() currentUser: User): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(currentUser.uid);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<void> {
    return this.notificationsService.remove(uid, currentUser.uid);
  }
}
