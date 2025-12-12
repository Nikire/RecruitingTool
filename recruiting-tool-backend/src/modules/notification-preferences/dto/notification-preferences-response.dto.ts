import { ApiProperty } from '@nestjs/swagger';

/**
 * NotificationPreferenceResponseDto
 * Represents the notification preferences returned to the client
 * Uses UID instead of internal numeric ID
 */
export class NotificationPreferenceResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the notification preferences',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uid: string;

  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userUid: string;

  // Email preferences
  @ApiProperty({
    description: 'Receive email notifications for application status updates',
    example: true,
  })
  emailApplicationStatus: boolean;

  @ApiProperty({
    description: 'Receive email notifications when interviews are scheduled',
    example: true,
  })
  emailInterviewScheduled: boolean;

  @ApiProperty({
    description: 'Receive email notifications for new candidates',
    example: true,
  })
  emailNewCandidate: boolean;

  @ApiProperty({
    description: 'Receive email notifications for system announcements',
    example: true,
  })
  emailSystemAnnouncement: boolean;

  // In-app preferences
  @ApiProperty({
    description: 'Receive in-app notifications for application status updates',
    example: true,
  })
  inAppApplicationStatus: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications when interviews are scheduled',
    example: true,
  })
  inAppInterviewScheduled: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications for new candidates',
    example: true,
  })
  inAppNewCandidate: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications for system announcements',
    example: true,
  })
  inAppSystemAnnouncement: boolean;

  @ApiProperty({
    description: 'When the preferences were created',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the preferences were last updated',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
