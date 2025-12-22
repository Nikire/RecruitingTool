import { Controller, Post, Get, Body, HttpCode, HttpStatus, Headers, RawBodyRequest, Req, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import {
  CreateCheckoutSessionDto,
  SubscriptionResponseDto,
  CheckoutSessionResponseDto,
  CancelSubscriptionResponseDto,
  CreateBillingPortalDto,
  BillingPortalResponseDto,
  InvoicesResponseDto,
  ListSubscriptionsQueryDto,
  SubscriptionsListResponseDto,
} from './dto/stripe.dto';

@ApiTags('Stripe Subscriptions')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Stripe Checkout session',
    description: 'Creates a Stripe Checkout session for subscribing to a paid plan. Accessible by company admins and owners.',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
    type: CheckoutSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request (missing required fields, invalid plan, etc.)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async createCheckoutSession(@CurrentUser() user: any, @Body() dto: CreateCheckoutSessionDto): Promise<CheckoutSessionResponseDto> {
    return this.stripeService.createCheckoutSession(user.companyId, dto);
  }

  @Get('subscription')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER, RolesType.HR])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current subscription',
    description: 'Retrieves the current subscription details for the company. Automatically syncs with Stripe if needed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription details retrieved successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getSubscription(@CurrentUser() user: any): Promise<SubscriptionResponseDto> {
    return this.stripeService.getSubscription(user.companyId);
  }

  @Post('cancel')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancels the subscription at the end of the current billing period. Accessible by company admins and owners.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription will be canceled at period end',
    type: CancelSubscriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel free subscription',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Company or subscription not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async cancelSubscription(@CurrentUser() user: any): Promise<CancelSubscriptionResponseDto> {
    return this.stripeService.cancelSubscription(user.companyId);
  }

  @Post('billing-portal')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Stripe Customer Portal session',
    description:
      'Creates a Stripe Customer Portal session where users can manage their subscription, update payment methods, and view billing history. Accessible by company admins and owners.',
  })
  @ApiResponse({
    status: 200,
    description: 'Billing portal session created successfully',
    type: BillingPortalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No Stripe customer found or Stripe not configured',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not an admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async createBillingPortalSession(@CurrentUser() user: any, @Body() dto: CreateBillingPortalDto): Promise<BillingPortalResponseDto> {
    return this.stripeService.createBillingPortalSession(user.companyId, dto);
  }

  @Get('invoices')
  @Auth([RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get billing invoices',
    description: 'Retrieves the list of billing invoices from Stripe for the company. Accessible only by company owners.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: InvoicesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a company owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getInvoices(@CurrentUser() user: any): Promise<InvoicesResponseDto> {
    return this.stripeService.getInvoices(user.companyId);
  }

  @Get('subscriptions/all')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all subscriptions (Admin only)',
    description:
      'Retrieves paginated list of all subscriptions with company information, filtering, and statistics. Only accessible by ADMIN and SUPER_ADMIN roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions list retrieved successfully',
    type: SubscriptionsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not an admin',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async listAllSubscriptions(@Query() query: ListSubscriptionsQueryDto): Promise<SubscriptionsListResponseDto> {
    return this.stripeService.listAllSubscriptions(query);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: RawBodyRequest<Request>): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Get raw body for signature verification
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Request body is required');
    }

    try {
      // Construct and verify webhook event
      const event = this.stripeService.constructWebhookEvent(rawBody, signature);

      // Handle the event asynchronously (don't block Stripe)
      setImmediate(() => {
        this.stripeService.handleWebhookEvent(event).catch(() => {
          // Error is already logged in the service
        });
      });

      // Return 200 OK immediately to acknowledge receipt
      return { received: true };
    } catch (error) {
      // If signature verification fails, return 400
      throw new BadRequestException(error.message);
    }
  }
}
