import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsUrl, IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class CreateCheckoutSessionDto {
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
    example: 'https://app.recruitingtool.com/subscription/success',
  })
  @IsUrl({ require_tld: false }) // Allow localhost for development
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'URL to redirect to after canceled payment',
    example: 'https://app.recruitingtool.com/subscription/cancel',
  })
  @IsUrl({ require_tld: false }) // Allow localhost for development
  @IsNotEmpty()
  cancelUrl: string;
}

export class SubscriptionResponseDto {
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

  @ApiProperty({
    description: 'Current subscription plan',
    enum: SubscriptionPlan,
    example: 'PROFESSIONAL',
  })
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'Current subscription status',
    enum: SubscriptionStatus,
    example: 'ACTIVE',
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Current billing period start date',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  currentPeriodStart?: Date;

  @ApiProperty({
    description: 'Current billing period end date',
    example: '2025-02-01T00:00:00Z',
    required: false,
  })
  currentPeriodEnd?: Date;

  @ApiProperty({
    description: 'Trial end date',
    example: '2025-01-15T00:00:00Z',
    required: false,
  })
  trialEnd?: Date;

  @ApiProperty({
    description: 'Whether subscription will cancel at period end',
    example: false,
  })
  cancelAtPeriodEnd: boolean;

  @ApiProperty({
    description: 'Grace period end date (for PAST_DUE subscriptions)',
    example: '2025-01-22T00:00:00Z',
    required: false,
  })
  gracePeriodEndsAt?: Date;

  @ApiProperty({
    description: 'Subscription end date (when subscription actually ends)',
    example: '2025-02-01T00:00:00Z',
    required: false,
  })
  subscriptionEndsAt?: Date;
}

export class CheckoutSessionResponseDto {
  @ApiProperty({
    description: 'Stripe Checkout Session ID',
    example: 'cs_test_abc123...',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Stripe Checkout URL to redirect user to',
    example: 'https://checkout.stripe.com/c/pay/cs_test_abc123...',
  })
  url: string;
}

export class CancelSubscriptionResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Subscription will be canceled at the end of the current billing period',
  })
  message: string;

  @ApiProperty({
    description: 'Date when subscription will be canceled',
    example: '2025-02-01T00:00:00Z',
  })
  cancelAt: Date;
}

export class CreateBillingPortalDto {
  @ApiProperty({
    description: 'URL to redirect to after user exits the billing portal',
    example: 'https://app.recruitingtool.com/subscription',
  })
  @IsUrl({ require_tld: false }) // Allow localhost for development
  @IsNotEmpty()
  returnUrl: string;
}

export class BillingPortalResponseDto {
  @ApiProperty({
    description: 'Stripe Customer Portal URL to redirect user to',
    example: 'https://billing.stripe.com/p/session/test_abc123...',
  })
  url: string;
}

export class InvoiceResponseDto {
  @ApiProperty({
    description: 'Stripe Invoice ID',
    example: 'in_1ABC234...',
  })
  id: string;

  @ApiProperty({
    description: 'Invoice number',
    example: 'INV-12345',
  })
  invoiceNumber: string;

  @ApiProperty({
    description: 'Invoice amount in cents',
    example: 2999,
  })
  amountDue: number;

  @ApiProperty({
    description: 'Amount paid in cents',
    example: 2999,
  })
  amountPaid: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'usd',
  })
  currency: string;

  @ApiProperty({
    description: 'Invoice status',
    example: 'paid',
  })
  status: string;

  @ApiProperty({
    description: 'Invoice creation date',
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Invoice due date',
    example: '2025-02-15T10:30:00Z',
    required: false,
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'PDF download URL for invoice',
    example: 'https://pay.stripe.com/invoice/acct_123/invst_abc...',
  })
  pdfUrl: string;

  @ApiProperty({
    description: 'Hosted invoice page URL',
    example: 'https://invoice.stripe.com/i/acct_123/invst_abc...',
  })
  hostedInvoiceUrl: string;
}

export class InvoicesResponseDto {
  @ApiProperty({
    description: 'List of invoices',
    type: [InvoiceResponseDto],
  })
  invoices: InvoiceResponseDto[];

  @ApiProperty({
    description: 'Total number of invoices',
    example: 12,
  })
  total: number;
}

export class ListSubscriptionsQueryDto {
  @ApiProperty({
    description: 'Page number (1-indexed)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description: 'Filter by subscription status',
    enum: SubscriptionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiProperty({
    description: 'Filter by subscription plan',
    enum: SubscriptionPlan,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @ApiProperty({
    description: 'Search by company name',
    example: 'Acme Corp',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class SubscriptionWithCompanyDto extends SubscriptionResponseDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  companyName: string;

  @ApiProperty({
    description: 'Number of users in the company',
    example: 15,
  })
  userCount: number;

  @ApiProperty({
    description: 'Monthly revenue from this subscription (in cents)',
    example: 4900,
  })
  monthlyRevenue: number;

  @ApiProperty({
    description: 'Yearly revenue from this subscription (in cents)',
    example: 58800,
  })
  yearlyRevenue: number;

  @ApiProperty({
    description: 'Billing interval (monthly or yearly)',
    example: 'monthly',
    required: false,
  })
  billingInterval?: string;
}

export class SubscriptionsListResponseDto {
  @ApiProperty({
    description: 'List of subscriptions with company information',
    type: [SubscriptionWithCompanyDto],
  })
  subscriptions: SubscriptionWithCompanyDto[];

  @ApiProperty({
    description: 'Total number of subscriptions',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Subscription statistics',
    type: 'object',
  })
  stats: {
    totalActive: number;
    totalTrialing: number;
    totalCanceled: number;
    totalPastDue: number;
    totalMonthlyRevenue: number;
    totalYearlyRevenue: number;
  };
}
