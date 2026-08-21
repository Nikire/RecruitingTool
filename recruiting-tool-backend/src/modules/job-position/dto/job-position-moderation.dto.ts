import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceLevel, JobModerationStatus, JobPositionStatus, JobType, WorkLocation } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';

/**
 * Query filters for the platform job posting moderation queue.
 * Extends the shared PaginationDto (page / pageSize / search / sortBy / sortOrder).
 */
export class JobModerationQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Moderation state to list. Defaults to PENDING_APPROVAL (the review queue).',
    enum: JobModerationStatus,
    default: JobModerationStatus.PENDING_APPROVAL,
  })
  @IsOptional()
  @IsEnum(JobModerationStatus)
  moderationStatus?: JobModerationStatus;

  @ApiPropertyOptional({ description: 'Restrict the queue to a single company (UID)' })
  @IsOptional()
  @IsString()
  companyUid?: string;
}

/** A single posting as shown in the moderation queue. */
export class ModerationJobPositionItemDto {
  @ApiProperty({ description: 'Job position UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'Job title', example: 'Senior Backend Engineer' })
  title: string;

  @ApiProperty({ description: 'Job description', required: false, nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Lifecycle status of the posting (independent from moderation)', enum: JobPositionStatus })
  status: JobPositionStatus;

  @ApiProperty({ description: 'Platform moderation state', enum: JobModerationStatus })
  moderationStatus: JobModerationStatus;

  @ApiProperty({ description: 'Reason supplied when the posting was rejected', required: false, nullable: true })
  moderationReason: string | null;

  @ApiProperty({ description: 'When the posting was approved or rejected', required: false, nullable: true })
  moderatedAt: Date | null;

  @ApiProperty({ description: 'UID of the administrator who moderated the posting', required: false, nullable: true })
  moderatedByUid: string | null;

  @ApiProperty({ description: 'Name of the administrator who moderated the posting', required: false, nullable: true })
  moderatedByName: string | null;

  @ApiProperty({ description: 'UID of the company that owns the posting' })
  companyUid: string;

  @ApiProperty({ description: 'Name of the company that owns the posting' })
  companyName: string;

  @ApiProperty({ description: 'Company logo URL', required: false, nullable: true })
  companyLogoUrl: string | null;

  @ApiProperty({ description: 'Subscription plan of the owning company', example: 'FREE' })
  companyPlan: string;

  @ApiProperty({ description: 'Whether the owning company currently has an active paid subscription', example: false })
  companyHasActiveSubscription: boolean;

  @ApiProperty({ description: 'UID of the user who created the posting' })
  createdByUid: string;

  @ApiProperty({ description: 'Name of the user who created the posting' })
  createdByName: string;

  @ApiProperty({ description: 'Email of the user who created the posting', required: false, nullable: true })
  createdByEmail: string | null;

  @ApiProperty({ description: 'Job type', enum: JobType, required: false, nullable: true })
  jobType: JobType | null;

  @ApiProperty({ description: 'Work location', enum: WorkLocation, required: false, nullable: true })
  workLocation: WorkLocation | null;

  @ApiProperty({ description: 'Experience level', enum: ExperienceLevel, required: false, nullable: true })
  experienceLevel: ExperienceLevel | null;

  @ApiProperty({ description: 'City', required: false, nullable: true })
  city: string | null;

  @ApiProperty({ description: 'Country', required: false, nullable: true })
  country: string | null;

  @ApiProperty({ description: 'When the posting was created' })
  createdAt: Date;
}

/** Optional internal note recorded when approving a posting. */
export class ApproveJobPositionDto {
  @ApiPropertyOptional({ description: 'Optional internal note recorded with the approval', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

/** Rejection payload — the reason is mandatory and is shown to the company. */
export class RejectJobPositionDto {
  @ApiProperty({ description: 'Reason for rejecting the posting. Shown to the company.', example: 'Duplicate posting / not a real job offer.', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}

/** Counters for the moderation dashboard. */
export class JobModerationStatsDto {
  @ApiProperty({ description: 'Postings awaiting administrator review', example: 4 })
  pending: number;

  @ApiProperty({ description: 'Approved postings', example: 132 })
  approved: number;

  @ApiProperty({ description: 'Rejected postings', example: 7 })
  rejected: number;

  @ApiProperty({ description: 'Total non-deleted postings', example: 143 })
  total: number;
}
