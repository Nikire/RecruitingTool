import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * UpdateNotificationPreferencesDto
 * Data transfer object for updating notification preferences
 * All fields are optional to allow partial updates
 */
export class UpdateNotificationPreferencesDto {
  // Email preferences
  @ApiProperty({
    description: 'Receive email notifications for application status updates',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailApplicationStatus?: boolean;

  @ApiProperty({
    description: 'Receive email notifications when interviews are scheduled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailInterviewScheduled?: boolean;

  @ApiProperty({
    description: 'Receive email notifications for new candidates',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailNewCandidate?: boolean;

  @ApiProperty({
    description: 'Receive email notifications for system announcements',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailSystemAnnouncement?: boolean;

  // In-app preferences
  @ApiProperty({
    description: 'Receive in-app notifications for application status updates',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  inAppApplicationStatus?: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications when interviews are scheduled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  inAppInterviewScheduled?: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications for new candidates',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  inAppNewCandidate?: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications for system announcements',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  inAppSystemAnnouncement?: boolean;
}
