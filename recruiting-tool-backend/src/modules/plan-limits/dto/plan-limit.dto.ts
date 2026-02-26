import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class PlanLimitResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UID) of the plan limit record',
    example: 'clz1234567890abcdef',
  })
  uid: string;

  @ApiProperty({
    description: 'Subscription plan type',
    example: 'FREE',
    enum: ['FREE', 'PROFESSIONAL', 'ENTERPRISE'],
  })
  planType: string;

  @ApiProperty({
    description: 'Maximum job positions allowed (-1 = unlimited)',
    example: 3,
  })
  maxJobPositions: number;

  @ApiProperty({
    description: 'Maximum candidates per job position (-1 = unlimited)',
    example: 50,
  })
  maxCandidatesPerPosition: number;

  @ApiProperty({
    description: 'Maximum users allowed (-1 = unlimited)',
    example: 3,
  })
  maxUsers: number;

  @ApiProperty({
    description: 'Maximum storage in MB (-1 = unlimited)',
    example: 500,
  })
  maxStorageMB: number;

  @ApiProperty({
    description: 'Whether AI scoring is enabled',
    example: true,
  })
  aiScoringEnabled: boolean;

  @ApiProperty({
    description: 'AI scoring credits per month (-1 = unlimited, 0 = disabled)',
    example: 20,
  })
  aiScoringCreditsPerMonth: number;

  @ApiProperty({
    description: 'Whether email templates are enabled',
    example: true,
  })
  emailTemplatesEnabled: boolean;

  @ApiProperty({
    description: 'Whether analytics are enabled',
    example: false,
  })
  analyticsEnabled: boolean;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last updated timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class UpdatePlanLimitDto {
  @ApiPropertyOptional({
    description: 'Maximum job positions allowed (-1 = unlimited)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  maxJobPositions?: number;

  @ApiPropertyOptional({
    description: 'Maximum candidates per job position (-1 = unlimited)',
    example: 100,
  })
  @IsOptional()
  @IsInt()
  maxCandidatesPerPosition?: number;

  @ApiPropertyOptional({
    description: 'Maximum users allowed (-1 = unlimited)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'Maximum storage in MB (-1 = unlimited)',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  maxStorageMB?: number;

  @ApiPropertyOptional({
    description: 'Whether AI scoring is enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  aiScoringEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'AI scoring credits per month (-1 = unlimited, 0 = disabled)',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  aiScoringCreditsPerMonth?: number;

  @ApiPropertyOptional({
    description: 'Whether email templates are enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailTemplatesEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Whether analytics are enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  analyticsEnabled?: boolean;
}

export class PlanLimitListResponseDto {
  @ApiProperty({
    description: 'List of plan limits for all subscription tiers',
    type: [PlanLimitResponseDto],
  })
  planLimits: PlanLimitResponseDto[];
}
