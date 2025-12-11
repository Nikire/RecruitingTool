import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsUrl, IsOptional } from 'class-validator';
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
