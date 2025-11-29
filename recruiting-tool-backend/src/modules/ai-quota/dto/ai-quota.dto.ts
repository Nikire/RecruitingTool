import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { QuotaType } from '@prisma/client';

export class SetQuotaLimitDto {
  @ApiProperty({
    description: 'Type of AI operation quota',
    enum: QuotaType,
    example: QuotaType.RESUME_PARSING,
  })
  @IsEnum(QuotaType)
  quotaType: QuotaType;

  @ApiProperty({
    description: 'Monthly quota limit',
    example: 100,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  limit: number;
}

export class AIQuotaResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uid: string;

  @ApiProperty({
    description: 'Company UID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  companyUid: string;

  @ApiProperty({
    description: 'Type of AI operation quota',
    enum: QuotaType,
    example: QuotaType.RESUME_PARSING,
  })
  quotaType: QuotaType;

  @ApiProperty({
    description: 'Monthly quota limit',
    example: 100,
  })
  limit: number;

  @ApiProperty({
    description: 'Amount of quota used',
    example: 45,
  })
  used: number;

  @ApiProperty({
    description: 'Remaining quota available',
    example: 55,
  })
  remaining: number;

  @ApiProperty({
    description: 'Date when quota will reset',
    example: '2025-12-01T00:00:00.000Z',
  })
  resetDate: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-25T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class UseQuotaDto {
  @ApiProperty({
    description: 'Type of AI operation',
    enum: QuotaType,
    example: QuotaType.RESUME_PARSING,
  })
  @IsEnum(QuotaType)
  operation: QuotaType;

  @ApiProperty({
    description: 'Amount of quota to use',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    description: 'Number of tokens used (optional)',
    example: 1500,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  tokensUsed?: number;

  @ApiPropertyOptional({
    description: 'Cost in dollars (optional)',
    example: 0.05,
  })
  @IsOptional()
  cost?: number;
}

export class AIUsageLogResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uid: string;

  @ApiProperty({
    description: 'Company UID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  companyUid: string;

  @ApiProperty({
    description: 'User UID who performed the operation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userUid: string;

  @ApiProperty({
    description: 'Type of AI operation',
    enum: QuotaType,
    example: QuotaType.RESUME_PARSING,
  })
  operation: QuotaType;

  @ApiPropertyOptional({
    description: 'Number of tokens used',
    example: 1500,
  })
  tokensUsed?: number;

  @ApiPropertyOptional({
    description: 'Cost in dollars',
    example: 0.05,
  })
  cost?: number;

  @ApiProperty({
    description: 'Timestamp of the operation',
    example: '2025-11-25T12:00:00.000Z',
  })
  createdAt: Date;
}

export class GetUsageHistoryDto {
  @ApiPropertyOptional({
    description: 'Start date for usage history (ISO 8601)',
    example: '2025-11-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for usage history (ISO 8601)',
    example: '2025-11-30T23:59:59.000Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by operation type',
    enum: QuotaType,
  })
  @IsOptional()
  @IsEnum(QuotaType)
  operation?: QuotaType;
}
