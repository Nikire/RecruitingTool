import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';
import { PlanLimits } from '../config/plan-limits.config';

export class QuotaUsageDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'jobPositions',
  })
  resource: string;

  @ApiProperty({
    description: 'Current usage',
    example: 2,
  })
  used: number;

  @ApiProperty({
    description: 'Maximum allowed (-1 means unlimited)',
    example: 3,
  })
  limit: number;

  @ApiProperty({
    description: 'Percentage used (0-100)',
    example: 66.67,
  })
  percentageUsed: number;

  @ApiProperty({
    description: 'Whether quota is exceeded',
    example: false,
  })
  isExceeded: boolean;
}

export class FeatureAccessDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'aiScoring',
  })
  feature: string;

  @ApiProperty({
    description: 'Whether feature is enabled',
    example: false,
  })
  enabled: boolean;
}

export class PlanLimitsDto {
  @ApiProperty({ description: 'Maximum job positions allowed (-1 = unlimited)', example: 3 })
  maxJobPositions: number;

  @ApiProperty({ description: 'Maximum candidates per job position (-1 = unlimited)', example: 50 })
  maxCandidatesPerPosition: number;

  @ApiProperty({ description: 'Maximum users allowed (-1 = unlimited)', example: 3 })
  maxUsers: number;

  @ApiProperty({ description: 'Maximum storage in MB (-1 = unlimited)', example: 500 })
  maxStorageMB: number;

  @ApiProperty({ description: 'Whether AI scoring is enabled', example: false })
  aiScoringEnabled: boolean;

  @ApiProperty({ description: 'AI scoring credits per month (-1 = unlimited, 0 = disabled)', example: 20 })
  aiScoringCreditsPerMonth: number;

  @ApiProperty({ description: 'Whether email templates are enabled', example: true })
  emailTemplatesEnabled: boolean;

  @ApiProperty({ description: 'Whether analytics are enabled', example: false })
  analyticsEnabled: boolean;
}

export class PlanLimitsResponseDto {
  @ApiProperty({
    description: 'Plan limits for all subscription tiers',
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/PlanLimitsDto' },
    example: {
      FREE: { maxJobPositions: 3, maxCandidatesPerPosition: 50, maxUsers: 3, maxStorageMB: 500, aiScoringEnabled: true, aiScoringCreditsPerMonth: 20, emailTemplatesEnabled: true, analyticsEnabled: false },
      PROFESSIONAL: { maxJobPositions: 15, maxCandidatesPerPosition: 200, maxUsers: 10, maxStorageMB: 10000, aiScoringEnabled: true, aiScoringCreditsPerMonth: 200, emailTemplatesEnabled: true, analyticsEnabled: true },
      ENTERPRISE: { maxJobPositions: -1, maxCandidatesPerPosition: -1, maxUsers: -1, maxStorageMB: -1, aiScoringEnabled: true, aiScoringCreditsPerMonth: -1, emailTemplatesEnabled: true, analyticsEnabled: true },
    },
  })
  plans: Record<SubscriptionPlan, PlanLimits>;
}

export class QuotaStatusDto {
  @ApiProperty({
    description: 'Company UID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyUid: string;

  @ApiProperty({
    description: 'Current subscription plan',
    enum: SubscriptionPlan,
    example: 'FREE',
  })
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'Resource quotas with usage',
    type: [QuotaUsageDto],
  })
  quotas: QuotaUsageDto[];

  @ApiProperty({
    description: 'Feature access flags',
    type: [FeatureAccessDto],
  })
  features: FeatureAccessDto[];
}
