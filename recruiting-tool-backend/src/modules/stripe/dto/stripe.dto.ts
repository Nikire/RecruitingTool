import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUrl } from 'class-validator';
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
