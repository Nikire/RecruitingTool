import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

export class CustomPlanResponseDto {
  @ApiProperty({ description: 'Unique identifier (UID) of the custom plan', example: 'clz1234567890abcdef' })
  uid: string;

  @ApiProperty({ description: 'Display name for the custom plan', example: 'Acme Corp Custom Plan' })
  name: string;

  @ApiProperty({ description: 'Always true for custom plans', example: true })
  isCustom: boolean;

  @ApiPropertyOptional({ description: 'UID of the assigned company', example: 'clz0987654321fedcba', nullable: true })
  companyUid: string | null;

  @ApiPropertyOptional({ description: 'Name of the assigned company', example: 'Acme Corp', nullable: true })
  companyName: string | null;

  @ApiProperty({ description: 'Maximum users allowed (-1 = unlimited)', example: 20 })
  maxUsers: number;

  @ApiProperty({ description: 'Maximum job positions allowed (-1 = unlimited)', example: 15 })
  maxJobPositions: number;

  @ApiProperty({ description: 'Maximum candidates per job position (-1 = unlimited)', example: 200 })
  maxCandidatesPerPosition: number;

  @ApiProperty({ description: 'Maximum storage in MB (-1 = unlimited)', example: 10000 })
  maxStorageMB: number;

  @ApiProperty({ description: 'AI scoring credits per month (-1 = unlimited, 0 = disabled)', example: 500 })
  aiScoringCreditsPerMonth: number;

  @ApiProperty({ description: 'Whether email templates are enabled', example: true })
  emailTemplatesEnabled: boolean;

  @ApiProperty({ description: 'Whether analytics are enabled', example: true })
  analyticsEnabled: boolean;

  @ApiProperty({ description: 'Monthly price in cents', example: 19900 })
  monthlyPrice: number;

  @ApiProperty({ description: 'Annual price in cents', example: 199000 })
  annualPrice: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ description: 'Stripe product ID (set after sync)', example: 'prod_xxx', nullable: true })
  stripeProductId: string | null;

  @ApiPropertyOptional({ description: 'Stripe monthly price ID (set after sync)', example: 'price_xxx', nullable: true })
  stripePriceId: string | null;

  @ApiPropertyOptional({ description: 'Stripe annual price ID (set after sync)', example: 'price_yyy', nullable: true })
  stripeAnnualPriceId: string | null;

  @ApiPropertyOptional({ description: 'Stripe Payment Link URL for monthly billing (set after sync)', example: 'https://buy.stripe.com/xxx', nullable: true })
  monthlyPaymentLink: string | null;

  @ApiPropertyOptional({ description: 'Stripe Payment Link URL for annual billing (set after sync)', example: 'https://buy.stripe.com/yyy', nullable: true })
  annualPaymentLink: string | null;

  @ApiPropertyOptional({ description: 'Whether this plan was synced using a Stripe test key (null = never synced)', example: true, nullable: true })
  stripeIsTestMode: boolean | null;

  @ApiProperty({ description: 'Record creation timestamp', example: '2026-03-02T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last updated timestamp', example: '2026-03-02T00:00:00.000Z' })
  updatedAt: Date;
}

export class CustomPlanListResponseDto {
  @ApiProperty({ description: 'List of all custom plans', type: [CustomPlanResponseDto] })
  customPlans: CustomPlanResponseDto[];
}

// ---------------------------------------------------------------------------
// Input DTOs
// ---------------------------------------------------------------------------

export class CreateCustomPlanDto {
  @ApiProperty({ description: 'Display name for the custom plan', example: 'Acme Corp Custom Plan' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'UID of the company to assign this plan to', example: 'clz0987654321fedcba' })
  @IsOptional()
  @IsString()
  companyUid?: string;

  @ApiPropertyOptional({ description: 'Maximum users (-1 = unlimited)', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Maximum job positions (-1 = unlimited)', example: 15 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxJobPositions?: number;

  @ApiPropertyOptional({ description: 'Maximum candidates per position (-1 = unlimited)', example: 200 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxCandidatesPerPosition?: number;

  @ApiPropertyOptional({ description: 'Maximum storage in MB (-1 = unlimited)', example: 10000 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxStorageMB?: number;

  @ApiPropertyOptional({ description: 'AI scoring credits per month (-1 = unlimited)', example: 500 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  aiScoringCreditsPerMonth?: number;

  @ApiPropertyOptional({ description: 'Whether email templates are enabled', example: true })
  @IsOptional()
  @IsBoolean()
  emailTemplatesEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Whether analytics are enabled', example: true })
  @IsOptional()
  @IsBoolean()
  analyticsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Monthly price in cents', example: 19900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyPrice?: number;

  @ApiPropertyOptional({ description: 'Annual price in cents', example: 199000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  annualPrice?: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateCustomPlanDto {
  @ApiPropertyOptional({ description: 'Display name for the custom plan', example: 'Updated Plan Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Maximum users (-1 = unlimited)', example: 25 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Maximum job positions (-1 = unlimited)', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxJobPositions?: number;

  @ApiPropertyOptional({ description: 'Maximum candidates per position (-1 = unlimited)', example: 300 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxCandidatesPerPosition?: number;

  @ApiPropertyOptional({ description: 'Maximum storage in MB (-1 = unlimited)', example: 20000 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxStorageMB?: number;

  @ApiPropertyOptional({ description: 'AI scoring credits per month (-1 = unlimited)', example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  aiScoringCreditsPerMonth?: number;

  @ApiPropertyOptional({ description: 'Whether email templates are enabled', example: true })
  @IsOptional()
  @IsBoolean()
  emailTemplatesEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Whether analytics are enabled', example: true })
  @IsOptional()
  @IsBoolean()
  analyticsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Monthly price in cents', example: 29900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyPrice?: number;

  @ApiPropertyOptional({ description: 'Annual price in cents', example: 299000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  annualPrice?: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class StripeSyncResponseDto {
  @ApiProperty({ description: 'The updated custom plan after Stripe sync', type: CustomPlanResponseDto })
  customPlan: CustomPlanResponseDto;

  @ApiProperty({ description: 'Stripe product ID created or reused', example: 'prod_xxx' })
  stripeProductId: string;

  @ApiProperty({ description: 'Stripe monthly price ID created', example: 'price_xxx' })
  stripePriceId: string;

  @ApiProperty({ description: 'Stripe annual price ID created', example: 'price_yyy' })
  stripeAnnualPriceId: string;

  @ApiProperty({ description: 'Stripe Payment Link URL for monthly billing', example: 'https://buy.stripe.com/xxx' })
  monthlyPaymentLink: string;

  @ApiProperty({ description: 'Stripe Payment Link URL for annual billing', example: 'https://buy.stripe.com/yyy' })
  annualPaymentLink: string;

  @ApiProperty({ description: 'Whether Stripe is running in test mode', example: true })
  isTestMode: boolean;
}

export class StripeConfigResponseDto {
  @ApiProperty({ description: 'Whether Stripe is configured on this server', example: true })
  stripeEnabled: boolean;

  @ApiProperty({ description: 'Whether Stripe is running in test mode (sk_test_ key)', example: true })
  isTestMode: boolean;
}
