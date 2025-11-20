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
