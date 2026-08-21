import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsUrl, IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class DoCreateCheckoutDto {
  @ApiProperty({
    description: 'Subscription plan to purchase',
    enum: ['PROFESSIONAL', 'ENTERPRISE'],
    example: 'PROFESSIONAL',
  })
  @IsEnum(['PROFESSIONAL', 'ENTERPRISE'])
  @IsNotEmpty()
  plan: 'PROFESSIONAL' | 'ENTERPRISE';

  @ApiProperty({
    description: 'Billing interval (monthly or annual)',
    enum: ['monthly', 'annual'],
    example: 'monthly',
    required: false,
  })
  @IsEnum(['monthly', 'annual'])
  @IsOptional()
  interval?: 'monthly' | 'annual';

  @ApiProperty({
    description: 'URL to redirect to after successful payment',
    example: 'https://app.borderlessats.com/subscription/success',
  })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'URL to redirect to after canceled payment',
    example: 'https://app.borderlessats.com/subscription/cancel',
  })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  cancelUrl: string;
}

export class DoCheckoutResponseDto {
  @ApiProperty({
    description: 'Dodo Payments checkout URL to redirect user to',
    example: 'https://checkout.dodopayments.com/...',
  })
  url: string;
}

export class DoCancelResponseDto {
  @ApiProperty({
    description: 'Whether the cancellation was successful',
    example: true,
  })
  canceled: boolean;

  @ApiProperty({
    description: 'Whether the subscription will cancel at period end',
    example: true,
  })
  cancelAtPeriodEnd: boolean;
}

export class DoBillingPortalResponseDto {
  @ApiProperty({
    description: 'Dodo Payments customer portal URL',
    example: 'https://billing.dodopayments.com/portal/...',
  })
  url: string;
}

export class DoInvoiceDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'pay_xxxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Amount in major currency unit (e.g. dollars, not cents)',
    example: 79.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'succeeded',
  })
  status: string;

  @ApiProperty({
    description: 'Payment creation date (ISO string)',
    example: '2025-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Invoice URL (if available)',
    required: false,
  })
  invoiceUrl?: string;
}

export class DoInvoicesResponseDto {
  @ApiProperty({
    description: 'List of payments/invoices',
    type: [DoInvoiceDto],
  })
  invoices: DoInvoiceDto[];
}

/**
 * Current-subscription payload returned by GET /billing/subscription.
 *
 * This class used to live in `modules/stripe/dto/stripe.dto.ts` and was
 * imported across the provider boundary by the Dodo controller and service.
 * Stripe is no longer a payment provider here, so the shape now lives with the
 * only module that still produces it. The JSON is byte-for-byte identical to
 * what the frontend `Subscription` type already expects.
 */
export class DoSubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription UID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uid: string;

  @ApiProperty({
    description: 'Company UID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyUid: string;

  @ApiProperty({ description: 'Current subscription plan', enum: SubscriptionPlan, example: 'PROFESSIONAL' })
  plan: SubscriptionPlan;

  @ApiProperty({ description: 'Current subscription status', enum: SubscriptionStatus, example: 'ACTIVE' })
  status: SubscriptionStatus;

  @ApiProperty({ description: 'Current billing period start date', required: false })
  currentPeriodStart?: Date;

  @ApiProperty({ description: 'Current billing period end date', required: false })
  currentPeriodEnd?: Date;

  @ApiProperty({ description: 'Trial end date', required: false })
  trialEnd?: Date;

  @ApiProperty({ description: 'Whether subscription will cancel at period end', example: false })
  cancelAtPeriodEnd: boolean;

  @ApiProperty({ description: 'Grace period end date (for PAST_DUE subscriptions)', required: false })
  gracePeriodEndsAt?: Date;

  @ApiProperty({ description: 'Subscription end date (when the subscription actually ends)', required: false })
  subscriptionEndsAt?: Date;
}

// ─── Admin: flat subscriptions overview (no pagination) ──────────────────────

export class DoAdminSubscriptionItemDto {
  @ApiProperty({ description: 'Subscription UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  subscriptionUid: string;

  @ApiProperty({ description: 'Company UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  companyUid: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corporation' })
  companyName: string;

  @ApiProperty({ description: 'Company owner UID', required: false })
  ownerUid?: string;

  @ApiProperty({ description: 'Company owner name', required: false })
  ownerName?: string;

  @ApiProperty({ description: 'Company owner email', required: false })
  ownerEmail?: string;

  @ApiProperty({ description: 'Subscription plan', enum: SubscriptionPlan, example: 'PROFESSIONAL' })
  plan: SubscriptionPlan;

  @ApiProperty({ description: 'Subscription status', enum: SubscriptionStatus, example: 'ACTIVE' })
  status: SubscriptionStatus;

  @ApiProperty({ description: 'Whether the company has an active Dodo Payments subscription linked', example: true })
  hasProviderSubscription: boolean;

  @ApiProperty({ description: 'Current billing period start', required: false })
  currentPeriodStart?: Date;

  @ApiProperty({ description: 'Current billing period end', required: false })
  currentPeriodEnd?: Date;

  @ApiProperty({ description: 'Trial end date', required: false })
  trialEnd?: Date;

  @ApiProperty({ description: 'Whether subscription will cancel at period end', example: false })
  cancelAtPeriodEnd: boolean;

  @ApiProperty({ description: 'Monthly recurring revenue in cents (0 unless the subscription is ACTIVE)', example: 4900 })
  mrr: number;

  @ApiProperty({ description: 'Subscription created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Subscription last updated date' })
  updatedAt: Date;
}

export class DoAdminSubscriptionsResponseDto {
  @ApiProperty({ description: 'All subscriptions', type: [DoAdminSubscriptionItemDto] })
  subscriptions: DoAdminSubscriptionItemDto[];

  @ApiProperty({ description: 'Total number of subscriptions', example: 42 })
  total: number;

  @ApiProperty({ description: 'Total active subscriptions', example: 35 })
  totalActive: number;

  @ApiProperty({ description: 'Total trialing subscriptions', example: 5 })
  totalTrialing: number;

  @ApiProperty({ description: 'Total past due subscriptions', example: 2 })
  totalPastDue: number;

  @ApiProperty({ description: 'Total monthly recurring revenue in cents', example: 171500 })
  totalMrr: number;
}

// ─── Admin: paginated + filterable subscriptions list ────────────────────────

export class DoListSubscriptionsQueryDto {
  @ApiProperty({ description: 'Page number (1-indexed)', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Number of items per page (max 100)', example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ description: 'Filter by subscription status', enum: SubscriptionStatus, required: false })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiProperty({ description: 'Filter by subscription plan', enum: SubscriptionPlan, required: false })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @ApiProperty({ description: 'Search by company name', example: 'Acme Corp', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class DoSubscriptionWithCompanyDto extends DoSubscriptionResponseDto {
  @ApiProperty({ description: 'Company name', example: 'Acme Corporation' })
  companyName: string;

  @ApiProperty({ description: 'Number of users in the company', example: 15 })
  userCount: number;

  @ApiProperty({ description: 'Monthly revenue from this subscription, in cents', example: 4900 })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Yearly revenue from this subscription, in cents', example: 49000 })
  yearlyRevenue: number;
}

export class DoSubscriptionsListResponseDto {
  @ApiProperty({ description: 'Subscriptions for the requested page', type: [DoSubscriptionWithCompanyDto] })
  subscriptions: DoSubscriptionWithCompanyDto[];

  @ApiProperty({ description: 'Total number of subscriptions matching the filters', example: 150 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Aggregate statistics across ALL subscriptions, not just this page' })
  stats: {
    totalActive: number;
    totalTrialing: number;
    totalCanceled: number;
    totalPastDue: number;
    totalMonthlyRevenue: number;
    totalYearlyRevenue: number;
  };
}
