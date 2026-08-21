import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, Headers, RawBodyRequest, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { DodoPaymentsService } from './dodo-payments.service';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import {
  DoCreateCheckoutDto,
  DoCheckoutResponseDto,
  DoCancelResponseDto,
  DoBillingPortalResponseDto,
  DoInvoicesResponseDto,
  DoSubscriptionResponseDto,
  DoAdminSubscriptionsResponseDto,
  DoListSubscriptionsQueryDto,
  DoSubscriptionsListResponseDto,
} from './dto/dodo-payments.dto';

@ApiTags('Billing (Dodo Payments)')
@Controller('billing')
export class DodoPaymentsController {
  constructor(private readonly dodoService: DodoPaymentsService) {}

  @Post('checkout')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Dodo Payments checkout session',
    description: 'Creates a Dodo Payments checkout session URL for subscribing to a paid plan.',
  })
  @ApiResponse({ status: 200, description: 'Checkout URL created successfully', type: DoCheckoutResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request or Dodo Payments not configured' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async createCheckout(@CurrentUser() user: any, @Body() dto: DoCreateCheckoutDto): Promise<DoCheckoutResponseDto> {
    return this.dodoService.createCheckout(user.companyId, dto);
  }

  @Get('subscription')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER, RolesType.HR])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current subscription',
    description: 'Retrieves the current subscription details for the company, syncing with Dodo Payments if needed.',
  })
  @ApiResponse({ status: 200, description: 'Subscription details', type: DoSubscriptionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getSubscription(@CurrentUser() user: any): Promise<DoSubscriptionResponseDto> {
    return this.dodoService.getSubscription(user.companyId);
  }

  @Post('cancel')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancels the Dodo Payments subscription at the end of the current billing period.',
  })
  @ApiResponse({ status: 200, description: 'Subscription cancellation scheduled', type: DoCancelResponseDto })
  @ApiResponse({ status: 400, description: 'No Dodo subscription found or Dodo Payments not configured' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company or subscription not found' })
  async cancelSubscription(@CurrentUser() user: any): Promise<DoCancelResponseDto> {
    return this.dodoService.cancelSubscription(user.companyId);
  }

  @Post('customer-portal')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Dodo Payments Customer Portal URL',
    description: 'Returns the Dodo Payments Customer Portal URL so users can manage their subscription and billing.',
  })
  @ApiResponse({ status: 200, description: 'Customer portal URL', type: DoBillingPortalResponseDto })
  @ApiResponse({ status: 400, description: 'No Dodo customer found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCustomerPortal(@CurrentUser() user: any): Promise<DoBillingPortalResponseDto> {
    return this.dodoService.getCustomerPortal(user.companyId);
  }

  @Get('invoices')
  @Auth([RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get billing invoices / payment history',
    description: 'Retrieves Dodo Payments payment history for the company. Only accessible by company owners.',
  })
  @ApiResponse({ status: 200, description: 'Payments/invoices retrieved', type: DoInvoicesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getInvoices(@CurrentUser() user: any): Promise<DoInvoicesResponseDto> {
    return this.dodoService.getInvoices(user.companyId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Headers('webhook-id') webhookId: string,
    @Headers('webhook-timestamp') webhookTimestamp: string,
    @Headers('webhook-signature') webhookSignature: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      throw new BadRequestException('Missing required Dodo Payments webhook headers (webhook-id, webhook-timestamp, webhook-signature)');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Request body is required');
    }

    await this.dodoService.handleWebhook(rawBody, {
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': webhookSignature,
    });

    return { received: true };
  }

  @Get('admin/subscriptions')
  @Auth([RolesType.SUPER_ADMIN, RolesType.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all subscriptions (Admin only)',
    description:
      'Returns every subscription with company and owner details plus headline counters, for the admin subscriptions screen. Read from the local database only, so it works even when Dodo Payments is unreachable or unconfigured.',
  })
  @ApiResponse({ status: 200, description: 'All subscriptions retrieved successfully', type: DoAdminSubscriptionsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - user is not an admin' })
  async getAllSubscriptionsAdmin(): Promise<DoAdminSubscriptionsResponseDto> {
    return this.dodoService.getAllSubscriptionsAdmin();
  }

  @Get('admin/subscriptions/list')
  @Auth([RolesType.SUPER_ADMIN, RolesType.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List subscriptions with pagination and filters (Admin only)',
    description: 'Paginated, filterable list of subscriptions with company information and aggregate statistics.',
  })
  @ApiResponse({ status: 200, description: 'Subscriptions list retrieved successfully', type: DoSubscriptionsListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - user is not an admin' })
  async listAllSubscriptions(@Query() query: DoListSubscriptionsQueryDto): Promise<DoSubscriptionsListResponseDto> {
    return this.dodoService.listAllSubscriptions(query);
  }
}
