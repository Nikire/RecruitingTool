import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';

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
