import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export class SendAsyncInvitationDto {
  @ApiProperty({ description: 'UID of the stage to send invitation for' })
  @IsString()
  stageUid: string;

  @ApiProperty({ description: 'UID of the hiring process' })
  @IsString()
  hiringProcessUid: string;

  @ApiPropertyOptional({ description: 'Deadline for submission (ISO8601)' })
  @IsOptional()
  @IsString()
  deadline?: string;
}

export class ReviewSubmissionDto {
  @ApiPropertyOptional({ description: 'HR note for the submission' })
  @IsOptional()
  @IsString()
  hrNote?: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export class AsyncStageTokenResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  stageUid: string;

  @ApiProperty()
  hiringProcessUid: string;

  @ApiProperty()
  candidateEmail: string;

  @ApiProperty()
  candidateName: string;

  @ApiPropertyOptional()
  expiresAt: string | null;

  @ApiPropertyOptional()
  usedAt: string | null;

  @ApiPropertyOptional()
  revokedAt: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ description: 'Full submission URL for copy' })
  submissionUrl: string;
}

export class AsyncSubmissionFileResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  mimetype: string;

  @ApiProperty({ description: 'Signed MinIO download URL' })
  downloadUrl: string;
}

export class AsyncStageSubmissionResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  stageUid: string;

  @ApiProperty()
  hiringProcessUid: string;

  @ApiPropertyOptional()
  textContent: string | null;

  @ApiProperty()
  submittedAt: string;

  @ApiPropertyOptional()
  reviewedAt: string | null;

  @ApiPropertyOptional()
  reviewedByName: string | null;

  @ApiPropertyOptional()
  hrNote: string | null;

  @ApiProperty({ type: [AsyncSubmissionFileResponseDto] })
  files: AsyncSubmissionFileResponseDto[];
}

export class AsyncStageStatusResponseDto {
  @ApiPropertyOptional({ type: AsyncStageTokenResponseDto })
  token: AsyncStageTokenResponseDto | null;

  @ApiPropertyOptional({ type: AsyncStageSubmissionResponseDto })
  submission: AsyncStageSubmissionResponseDto | null;
}

// ─── Public DTOs ───────────────────────────────────────────────────────────────

export class PublicAsyncStageInfoDto {
  @ApiProperty()
  stageTitle: string;

  @ApiPropertyOptional()
  stageDescription: string | null;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty()
  companyName: string;

  @ApiPropertyOptional()
  expiresAt: string | null;

  @ApiProperty({ description: 'Whether the candidate has already submitted' })
  alreadySubmitted: boolean;
}
