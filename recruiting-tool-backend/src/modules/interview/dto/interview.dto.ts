import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { InterviewStatus } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty({
    description: 'The UID of the stage for this interview',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  stageUid: string;

  @ApiPropertyOptional({
    description: 'UID of the HR member who owns/organizes this interview. Defaults to the requesting user if omitted.',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsString()
  organizerUid?: string;

  @ApiProperty({
    description: 'The scheduled date for the interview (ISO 8601 format)',
    example: '2025-12-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    description: 'The scheduled time for the interview (24-hour format)',
    example: '14:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiProperty({
    description: 'Duration of the interview in minutes',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'Meeting link (Zoom, Google Meet, etc.)',
    example: 'https://zoom.us/j/1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({
    description: 'Physical location of the interview',
    example: 'Conference Room A, 5th Floor',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Additional notes for the interview',
    example: 'Prepare coding challenges',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInterviewDto {
  @ApiProperty({
    description: 'The scheduled date for the interview (ISO 8601 format)',
    example: '2025-12-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    description: 'The scheduled time for the interview (24-hour format)',
    example: '15:30',
    required: false,
  })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiProperty({
    description: 'Duration of the interview in minutes',
    example: 90,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'Meeting link (Zoom, Google Meet, etc.)',
    example: 'https://meet.google.com/abc-defg-hij',
    required: false,
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({
    description: 'Physical location of the interview',
    example: 'Conference Room B, 3rd Floor',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Additional notes for the interview',
    example: 'Updated notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Status of the interview',
    example: InterviewStatus.SCHEDULED,
    enum: InterviewStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}

export class AddInterviewerDto {
  @ApiProperty({
    description: 'UID of the user to add as interviewer',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsString()
  @IsNotEmpty()
  userUid: string;

  @ApiProperty({
    description: 'Role of the interviewer (e.g., Lead, Technical, HR)',
    example: 'Lead Interviewer',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;
}

export class RescheduleInterviewDto {
  @ApiProperty({
    description: 'New scheduled date for the interview (ISO 8601 format)',
    example: '2025-12-20T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  newScheduledDate: string;

  @ApiProperty({
    description: 'New scheduled time for the interview (24-hour format)',
    example: '15:30',
  })
  @IsString()
  @IsNotEmpty()
  newScheduledTime: string;

  @ApiProperty({
    description: 'Reason for rescheduling',
    example: 'Candidate requested different time',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Duration of the interview in minutes',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'Meeting link (Zoom, Google Meet, etc.)',
    example: 'https://zoom.us/j/1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class InterviewRescheduleHistoryDto {
  @ApiProperty({
    description: 'The UID of the reschedule record',
    example: '123e4567-e89b-12d3-a456-426614174005',
  })
  uid: string;

  @ApiProperty({
    description: 'Previous scheduled date',
    example: '2025-12-15T00:00:00.000Z',
  })
  oldScheduledDate: Date;

  @ApiProperty({
    description: 'Previous scheduled time',
    example: '14:00',
  })
  oldScheduledTime: string;

  @ApiProperty({
    description: 'New scheduled date',
    example: '2025-12-20T00:00:00.000Z',
  })
  newScheduledDate: Date;

  @ApiProperty({
    description: 'New scheduled time',
    example: '15:30',
  })
  newScheduledTime: string;

  @ApiProperty({
    description: 'Reason for rescheduling',
    example: 'Candidate requested different time',
    required: false,
  })
  reason: string | null;

  @ApiProperty({
    description: 'UID of the user who rescheduled',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  rescheduledByUid: string;

  @ApiProperty({
    description: 'Name of the user who rescheduled',
    example: 'John Doe',
  })
  rescheduledByName: string;

  @ApiProperty({
    description: 'When the reschedule occurred',
    example: '2025-11-25T16:30:00.000Z',
  })
  rescheduledAt: Date;
}

export class InterviewResponseDto {
  @ApiProperty({
    description: 'The UID of the interview',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uid: string;

  @ApiProperty({
    description: 'The UID of the stage',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  stageUid: string;

  @ApiProperty({
    description: 'The scheduled date for the interview',
    example: '2025-12-15T00:00:00.000Z',
    required: false,
  })
  scheduledDate: string | null;

  @ApiProperty({
    description: 'The scheduled time for the interview',
    example: '14:00',
    required: false,
  })
  scheduledTime: string | null;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
    required: false,
  })
  duration: number | null;

  @ApiProperty({
    description: 'Status of the interview',
    example: InterviewStatus.SCHEDULED,
    enum: InterviewStatus,
  })
  status: InterviewStatus;

  @ApiProperty({
    description: 'Meeting link',
    example: 'https://zoom.us/j/1234567890',
    required: false,
  })
  meetingLink: string | null;

  @ApiProperty({
    description: 'Physical location of the interview',
    example: 'Conference Room A, 5th Floor',
    required: false,
  })
  location: string | null;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Technical interview with coding exercises',
    required: false,
  })
  notes: string | null;

  @ApiProperty({
    description: 'UID of the user who scheduled this interview',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  scheduledByUid: string;

  @ApiProperty({
    description: 'Name of the user who scheduled this interview',
    example: 'John Doe',
  })
  scheduledByName: string;

  @ApiPropertyOptional({
    description: 'The HR member who owns/organizes this interview (used for calendar color-coding and filtering)',
    type: 'object',
    properties: {
      uid: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174002' },
      name: { type: 'string', example: 'Jane Smith' },
      profilePicture: { type: 'string', example: 'https://example.com/avatar.jpg', nullable: true },
    },
    nullable: true,
  })
  organizer: { uid: string; name: string; profilePicture: string | null } | null;

  @ApiProperty({
    description: 'List of interviewers participating in this interview',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userUid: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174003' },
        userName: { type: 'string', example: 'Jane Smith' },
        role: { type: 'string', example: 'Lead Interviewer', nullable: true },
      },
    },
  })
  interviewers: Array<{
    userUid: string;
    userName: string;
    role: string | null;
  }>;

  @ApiProperty({
    description: 'Number of times this interview has been rescheduled',
    example: 2,
    default: 0,
  })
  rescheduledCount: number;

  @ApiProperty({
    description: 'Original scheduled date before any rescheduling',
    example: '2025-12-15T00:00:00.000Z',
    required: false,
  })
  originalScheduledDate: string | null;

  @ApiProperty({
    description: 'Timestamp of the last reschedule',
    example: '2025-11-25T16:30:00.000Z',
    required: false,
  })
  lastRescheduledAt: string | null;

  @ApiProperty({
    description: 'Reason for the last reschedule',
    example: 'Candidate requested different time',
    required: false,
  })
  rescheduledReason: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-20T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-20T15:30:00.000Z',
  })
  updatedAt: Date;
}

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'Array of interviewer UIDs to check availability for',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  interviewerUids: string[];

  @ApiProperty({
    description: 'Proposed interview start time (ISO 8601)',
    example: '2025-12-15T14:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  proposedStartTime: string;

  @ApiProperty({
    description: 'Duration of the interview in minutes',
    example: 60,
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({
    description: 'Timezone (IANA format)',
    example: 'America/New_York',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({
    description: 'Buffer time in minutes before and after the interview',
    example: 15,
    default: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferMinutes?: number;

  @ApiPropertyOptional({
    description: 'Whether to suggest alternative time slots if there are conflicts',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  suggestAlternatives?: boolean;
}

export class ConflictDto {
  @ApiProperty({
    description: 'UID of the interviewer with a conflict',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  interviewerUid: string;

  @ApiProperty({
    description: 'Name of the interviewer with a conflict',
    example: 'John Doe',
  })
  interviewerName: string;

  @ApiProperty({
    description: 'Start time of the conflicting event',
    example: '2025-12-15T14:00:00.000Z',
  })
  conflictStart: string;

  @ApiProperty({
    description: 'End time of the conflicting event',
    example: '2025-12-15T15:00:00.000Z',
  })
  conflictEnd: string;

  @ApiProperty({
    description: 'Type of conflict',
    example: 'calendar_event',
  })
  conflictType: string;
}

export class AlternativeSlotDto {
  @ApiProperty({
    description: 'Suggested start time for the interview',
    example: '2025-12-15T15:30:00.000Z',
  })
  startTime: string;

  @ApiProperty({
    description: 'Suggested end time for the interview',
    example: '2025-12-15T16:30:00.000Z',
  })
  endTime: string;

  @ApiProperty({
    description: 'All interviewers available for this slot',
    default: true,
  })
  allAvailable: boolean;

  @ApiPropertyOptional({
    description: 'UIDs of interviewers who are unavailable during this slot',
    type: [String],
  })
  unavailableInterviewers?: string[];
}

export class AvailabilityCheckResponseDto {
  @ApiProperty({
    description: 'Whether all interviewers are available at the proposed time',
  })
  available: boolean;

  @ApiPropertyOptional({
    description: 'List of conflicts detected',
    type: [ConflictDto],
  })
  conflicts?: ConflictDto[];

  @ApiPropertyOptional({
    description: 'Alternative time slots suggested (if requested)',
    type: [AlternativeSlotDto],
  })
  alternativeSlots?: AlternativeSlotDto[];

  @ApiProperty({
    description: 'Timestamp when this availability check was performed',
  })
  checkedAt: Date;
}
