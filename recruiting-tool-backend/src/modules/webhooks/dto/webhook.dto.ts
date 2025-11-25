import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookAuthDto {
  @ApiProperty({
    description: 'API key for webhook authentication',
    example: 'your-secure-api-key',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

export class CandidateCreatedWebhookDto {
  @ApiProperty({
    description: 'Candidate UID',
    example: 'cand_123456789',
  })
  @IsString()
  @IsNotEmpty()
  candidateUid: string;

  @ApiProperty({
    description: 'Candidate name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @ApiProperty({
    description: 'Candidate email',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  candidateEmail: string;

  @ApiProperty({
    description: 'Job position UID',
    example: 'job_123456789',
  })
  @IsString()
  @IsOptional()
  jobPositionUid?: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { source: 'website', referrer: 'linkedin' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class InterviewScheduledWebhookDto {
  @ApiProperty({
    description: 'Interview UID',
    example: 'int_123456789',
  })
  @IsString()
  @IsNotEmpty()
  interviewUid: string;

  @ApiProperty({
    description: 'Candidate UID',
    example: 'cand_123456789',
  })
  @IsString()
  @IsNotEmpty()
  candidateUid: string;

  @ApiProperty({
    description: 'Candidate name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @ApiProperty({
    description: 'Interview date and time (ISO 8601)',
    example: '2025-11-30T10:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  scheduledAt: string;

  @ApiProperty({
    description: 'Interview type',
    example: 'Technical Interview',
  })
  @IsString()
  @IsNotEmpty()
  interviewType: string;

  @ApiProperty({
    description: 'Interviewer name',
    example: 'Jane Smith',
  })
  @IsString()
  @IsOptional()
  interviewerName?: string;

  @ApiProperty({
    description: 'Meeting link (Google Meet, Zoom, etc.)',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsString()
  @IsOptional()
  meetingLink?: string;
}

export class StageChangedWebhookDto {
  @ApiProperty({
    description: 'Candidate UID',
    example: 'cand_123456789',
  })
  @IsString()
  @IsNotEmpty()
  candidateUid: string;

  @ApiProperty({
    description: 'Candidate name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @ApiProperty({
    description: 'Previous stage',
    example: 'Phone Screen',
  })
  @IsString()
  @IsOptional()
  previousStage?: string;

  @ApiProperty({
    description: 'New stage',
    example: 'Technical Interview',
  })
  @IsString()
  @IsNotEmpty()
  newStage: string;

  @ApiProperty({
    description: 'Job position UID',
    example: 'job_123456789',
  })
  @IsString()
  @IsNotEmpty()
  jobPositionUid: string;

  @ApiProperty({
    description: 'Changed by (user UID)',
    example: 'user_123456789',
  })
  @IsString()
  @IsOptional()
  changedBy?: string;
}

export class ApplicationStatusChangedWebhookDto {
  @ApiProperty({
    description: 'Application UID',
    example: 'app_123456789',
  })
  @IsString()
  @IsNotEmpty()
  applicationUid: string;

  @ApiProperty({
    description: 'Candidate UID',
    example: 'cand_123456789',
  })
  @IsString()
  @IsNotEmpty()
  candidateUid: string;

  @ApiProperty({
    description: 'Candidate name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @ApiProperty({
    description: 'Previous status',
    example: 'IN_REVIEW',
  })
  @IsString()
  @IsOptional()
  previousStatus?: string;

  @ApiProperty({
    description: 'New status',
    example: 'ACCEPTED',
  })
  @IsString()
  @IsNotEmpty()
  newStatus: string;

  @ApiProperty({
    description: 'Job position UID',
    example: 'job_123456789',
  })
  @IsString()
  @IsNotEmpty()
  jobPositionUid: string;

  @ApiProperty({
    description: 'Status change reason',
    example: 'Candidate accepted the offer',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
