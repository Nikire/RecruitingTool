import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UID) of the notification',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uid: string;

  @ApiProperty({
    description: 'UID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userUid: string;

  @ApiProperty({
    enum: NotificationType,
    description: 'Type of notification',
    example: NotificationType.INTERVIEW_SCHEDULED,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Interview Scheduled',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your interview has been scheduled for tomorrow at 10:00 AM',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Additional metadata (JSON)',
    example: { interviewUid: '550e8400-e29b-41d4-a716-446655440000' },
    required: false,
    nullable: true,
  })
  metadata?: Record<string, any> | null;

  @ApiProperty({
    description: 'Timestamp when the notification was created',
    example: '2024-12-06T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the notification was read',
    example: '2024-12-06T11:30:00.000Z',
    required: false,
    nullable: true,
  })
  readAt?: Date | null;
}
