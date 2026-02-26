import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class FeatureFlagResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UID) of the feature flag record',
    example: 'clz1234567890abcdef',
  })
  uid: string;

  @ApiProperty({
    description: 'Feature key identifier',
    example: 'ai_screening',
  })
  key: string;

  @ApiProperty({
    description: 'Subscription plan type this flag applies to',
    example: 'FREE',
    enum: ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  })
  planType: string;

  @ApiProperty({
    description: 'Whether the feature is enabled for this plan type',
    example: false,
  })
  enabled: boolean;

  @ApiPropertyOptional({
    description: 'Optional description of what this feature flag controls',
    example: 'Enables AI-powered resume screening for candidates',
  })
  description: string | null;

  @ApiProperty({
    description: 'Record last updated timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class UpdateFeatureFlagDto {
  @ApiProperty({
    description: 'Whether the feature should be enabled for this plan type',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;
}

export class FeatureFlagListResponseDto {
  @ApiProperty({
    description: 'List of feature flags',
    type: [FeatureFlagResponseDto],
  })
  featureFlags: FeatureFlagResponseDto[];
}

export class FeatureFlagsByPlanResponseDto {
  @ApiProperty({
    description: 'The plan type these feature flags belong to',
    example: 'FREE',
  })
  planType: string;

  @ApiProperty({
    description: 'List of feature flags for this plan',
    type: [FeatureFlagResponseDto],
  })
  featureFlags: FeatureFlagResponseDto[];
}
