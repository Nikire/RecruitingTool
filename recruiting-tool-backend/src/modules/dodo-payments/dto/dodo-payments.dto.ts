import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsUrl, IsOptional } from 'class-validator';

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
