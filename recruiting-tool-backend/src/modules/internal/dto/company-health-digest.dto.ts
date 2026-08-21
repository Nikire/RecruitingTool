import { ApiProperty } from '@nestjs/swagger';

/**
 * One company whose health tier got WORSE between the prior week's snapshot and the
 * most recent one. This is the payload of the Monday morning digest.
 *
 * Uid-only: the numeric companyId used to write snapshots never leaves the service.
 */
export class CompanyHealthDegradationDto {
  @ApiProperty({ description: 'Company UID' })
  companyUid: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'Subscription plan at the time of the digest' })
  plan: string;

  @ApiProperty({ description: 'Risk tier a week ago', example: 'HEALTHY' })
  previousTier: string;

  @ApiProperty({ description: 'Risk tier now', example: 'AT_RISK' })
  currentTier: string;

  @ApiProperty({ description: 'Health score a week ago', nullable: true })
  previousScore: number | null;

  @ApiProperty({ description: 'Health score now', nullable: true })
  currentScore: number | null;

  @ApiProperty({ description: 'When the comparison snapshot was taken' })
  previousAt: Date;

  @ApiProperty({ description: 'When the current snapshot was taken' })
  currentAt: Date;

  @ApiProperty({ description: 'Days since the most recent login by any user', nullable: true })
  lastLoginDaysAgo: number | null;

  @ApiProperty({ description: 'Open job positions', nullable: true })
  activeJobPositions: number | null;

  @ApiProperty({ description: 'Applications received this month', nullable: true })
  applicationsThisMonth: number | null;

  @ApiProperty({ description: 'Hiring processes touched this month', nullable: true })
  hiringActivitiesThisMonth: number | null;
}

/** Result of running the nightly snapshot job once. */
export class CompanyHealthSnapshotRunDto {
  @ApiProperty({ description: 'Number of snapshot rows written' })
  snapshotsWritten: number;

  @ApiProperty({ description: 'Whether the job actually ran (false when disabled/test env)' })
  ran: boolean;
}

/** Result of running the weekly digest job once. */
export class CompanyHealthDigestRunDto {
  @ApiProperty({ description: 'Whether the job actually ran (false when disabled/test env)' })
  ran: boolean;

  @ApiProperty({ description: 'Companies compared (those with both a current and a prior-week snapshot)' })
  companiesCompared: number;

  @ApiProperty({ description: 'Companies whose tier degraded week over week' })
  degradedCount: number;

  @ApiProperty({ description: 'Whether an email was dispatched (skipped when nothing degraded)' })
  emailSent: boolean;
}
