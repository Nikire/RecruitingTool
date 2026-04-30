import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsUrl } from 'class-validator';

export class LsCreateCheckoutDto {
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

export class LsCheckoutResponseDto {
  @ApiProperty({
    description: 'Lemon Squeezy checkout URL to redirect user to',
    example: 'https://borderless.lemonsqueezy.com/checkout/buy/...',
  })
  url: string;
}

export class LsCancelResponseDto {
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

export class LsBillingPortalResponseDto {
  @ApiProperty({
    description: 'Lemon Squeezy customer portal URL',
    example: 'https://app.lemonsqueezy.com/my-orders',
  })
  url: string;
}

export class LsInvoiceDto {
  @ApiProperty({
    description: 'Order/invoice ID',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: 'Amount in dollars (not cents)',
    example: 49.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Order status',
    example: 'paid',
  })
  status: string;

  @ApiProperty({
    description: 'Order creation date (ISO string)',
    example: '2025-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Receipt/invoice URL',
    example: 'https://app.lemonsqueezy.com/my-orders/12345',
    required: false,
  })
  invoiceUrl?: string;
}

export class LsInvoicesResponseDto {
  @ApiProperty({
    description: 'List of orders/invoices',
    type: [LsInvoiceDto],
  })
  invoices: LsInvoiceDto[];
}
