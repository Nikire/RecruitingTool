import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { InterviewStatus } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty({
    description: 'The UID of the stage for this interview',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  stageUid: string;

  @ApiProperty({
    description: 'The scheduled date for the interview (ISO 8601 format)',
    example: '2025-12-15T00:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    description: 'The scheduled time for the interview (24-hour format)',
    example: '14:00',
    required: false
  })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiProperty({
    description: 'Duration of the interview in minutes',
    example: 60,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'Meeting link (Zoom, Google Meet, etc.)',
    example: 'https://zoom.us/j/1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({
    description: 'Physical location of the interview',
    example: 'Conference Room A, 5th Floor',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Additional notes for the interview',
    example: 'Prepare coding challenges',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInterviewDto {
  @ApiProperty({
    description: 'The scheduled date for the interview (ISO 8601 format)',
    example: '2025-12-15T00:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    description: 'The scheduled time for the interview (24-hour format)',
    example: '15:30',
    required: false
  })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiProperty({
    description: 'Duration of the interview in minutes',
    example: 90,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'Meeting link (Zoom, Google Meet, etc.)',
    example: 'https://meet.google.com/abc-defg-hij',
    required: false
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({
    description: 'Physical location of the interview',
    example: 'Conference Room B, 3rd Floor',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Additional notes for the interview',
    example: 'Updated notes',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Status of the interview',
    example: InterviewStatus.SCHEDULED,
    enum: InterviewStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}

export class AddInterviewerDto {
  @ApiProperty({
    description: 'UID of the user to add as interviewer',
    example: '123e4567-e89b-12d3-a456-426614174003'
  })
  @IsString()
  @IsNotEmpty()
  userUid: string;

  @ApiProperty({
    description: 'Role of the interviewer (e.g., Lead, Technical, HR)',
    example: 'Lead Interviewer',
    required: false
  })
  @IsOptional()
  @IsString()
  role?: string;
}

export class RescheduleInterviewDto {
  @ApiProperty({
    description: 'New scheduled date for the interview (ISO 8601 format)',
    example: '2025-12-20T00:00:00.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  newScheduledDate: string;

  @ApiProperty({
    description: 'New scheduled time for the interview (24-hour format)',
    example: '15:30'
  })
  @IsString()
  @IsNotEmpty()
  newScheduledTime: string;

  @ApiProperty({
    description: 'Reason for rescheduling',
    example: 'Candidate requested different time',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Duration of the interview in minutes',
    example: 60,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'Meeting link (Zoom, Google Meet, etc.)',
    example: 'https://zoom.us/j/1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class InterviewRescheduleHistoryDto {
  @ApiProperty({
    description: 'The UID of the reschedule record',
    example: '123e4567-e89b-12d3-a456-426614174005'
  })
  uid: string;

  @ApiProperty({
    description: 'Previous scheduled date',
    example: '2025-12-15T00:00:00.000Z'
  })
  oldScheduledDate: Date;

  @ApiProperty({
    description: 'Previous scheduled time',
    example: '14:00'
  })
  oldScheduledTime: string;

  @ApiProperty({
    description: 'New scheduled date',
    example: '2025-12-20T00:00:00.000Z'
  })
  newScheduledDate: Date;

  @ApiProperty({
    description: 'New scheduled time',
    example: '15:30'
  })
  newScheduledTime: string;

  @ApiProperty({
    description: 'Reason for rescheduling',
    example: 'Candidate requested different time',
    required: false
  })
  reason: string | null;

  @ApiProperty({
    description: 'UID of the user who rescheduled',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  rescheduledByUid: string;

  @ApiProperty({
    description: 'Name of the user who rescheduled',
    example: 'John Doe'
  })
  rescheduledByName: string;

  @ApiProperty({
    description: 'When the reschedule occurred',
    example: '2025-11-25T16:30:00.000Z'
  })
  rescheduledAt: Date;
}

export class InterviewResponseDto {
  @ApiProperty({
    description: 'The UID of the interview',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  uid: string;

  @ApiProperty({
    description: 'The UID of the stage',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  stageUid: string;

  @ApiProperty({
    description: 'The scheduled date for the interview',
    example: '2025-12-15T00:00:00.000Z',
    required: false
  })
  scheduledDate: string | null;

  @ApiProperty({
    description: 'The scheduled time for the interview',
    example: '14:00',
    required: false
  })
  scheduledTime: string | null;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
    required: false
  })
  duration: number | null;

  @ApiProperty({
    description: 'Status of the interview',
    example: InterviewStatus.SCHEDULED,
    enum: InterviewStatus
  })
  status: InterviewStatus;

  @ApiProperty({
    description: 'Meeting link',
    example: 'https://zoom.us/j/1234567890',
    required: false
  })
  meetingLink: string | null;

  @ApiProperty({
    description: 'Physical location of the interview',
    example: 'Conference Room A, 5th Floor',
    required: false
  })
  location: string | null;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Technical interview with coding exercises',
    required: false
  })
  notes: string | null;

  @ApiProperty({
    description: 'UID of the user who scheduled this interview',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  scheduledByUid: string;

  @ApiProperty({
    description: 'Name of the user who scheduled this interview',
    example: 'John Doe'
  })
  scheduledByName: string;

  @ApiProperty({
    description: 'List of interviewers participating in this interview',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userUid: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174003' },
        userName: { type: 'string', example: 'Jane Smith' },
        role: { type: 'string', example: 'Lead Interviewer', nullable: true }
      }
    }
  })
  interviewers: Array<{
    userUid: string;
    userName: string;
    role: string | null;
  }>;

  @ApiProperty({
    description: 'Number of times this interview has been rescheduled',
    example: 2,
    default: 0
  })
  rescheduledCount: number;

  @ApiProperty({
    description: 'Original scheduled date before any rescheduling',
    example: '2025-12-15T00:00:00.000Z',
    required: false
  })
  originalScheduledDate: string | null;

  @ApiProperty({
    description: 'Timestamp of the last reschedule',
    example: '2025-11-25T16:30:00.000Z',
    required: false
  })
  lastRescheduledAt: string | null;

  @ApiProperty({
    description: 'Reason for the last reschedule',
    example: 'Candidate requested different time',
    required: false
  })
  rescheduledReason: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-20T10:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-20T15:30:00.000Z'
  })
  updatedAt: Date;
}
