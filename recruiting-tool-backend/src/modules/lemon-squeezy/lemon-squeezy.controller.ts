import { Controller, Post, Get, Body, HttpCode, HttpStatus, Headers, RawBodyRequest, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import { SubscriptionResponseDto } from '../stripe/dto/stripe.dto';
import { LsCreateCheckoutDto, LsCheckoutResponseDto, LsCancelResponseDto, LsBillingPortalResponseDto, LsInvoicesResponseDto } from './dto/lemon-squeezy.dto';

@ApiTags('Billing (Lemon Squeezy)')
@Controller('billing')
export class LemonSqueezyController {
  constructor(private readonly lsService: LemonSqueezyService) {}

  @Post('checkout')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Lemon Squeezy checkout',
    description: 'Creates a Lemon Squeezy checkout URL for subscribing to a paid plan.',
  })
  @ApiResponse({ status: 200, description: 'Checkout URL created successfully', type: LsCheckoutResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request or LS not configured' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async createCheckout(@CurrentUser() user: any, @Body() dto: LsCreateCheckoutDto): Promise<LsCheckoutResponseDto> {
    return this.lsService.createCheckout(user.companyId, dto);
  }

  @Get('subscription')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER, RolesType.HR])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current subscription',
    description: 'Retrieves the current subscription details for the company, syncing with Lemon Squeezy if needed.',
  })
  @ApiResponse({ status: 200, description: 'Subscription details', type: SubscriptionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getSubscription(@CurrentUser() user: any): Promise<SubscriptionResponseDto> {
    return this.lsService.getSubscription(user.companyId);
  }

  @Post('cancel')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancels the Lemon Squeezy subscription at the end of the current billing period.',
  })
  @ApiResponse({ status: 200, description: 'Subscription cancelled at period end', type: LsCancelResponseDto })
  @ApiResponse({ status: 400, description: 'No LS subscription found or LS not configured' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company or subscription not found' })
  async cancelSubscription(@CurrentUser() user: any): Promise<LsCancelResponseDto> {
    return this.lsService.cancelSubscription(user.companyId);
  }

  @Post('customer-portal')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Lemon Squeezy Customer Portal URL',
    description: 'Returns the Lemon Squeezy Customer Portal URL so users can manage their subscription and billing.',
  })
  @ApiResponse({ status: 200, description: 'Customer portal URL', type: LsBillingPortalResponseDto })
  @ApiResponse({ status: 400, description: 'No LS subscription found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCustomerPortal(@CurrentUser() user: any): Promise<LsBillingPortalResponseDto> {
    return this.lsService.getCustomerPortal(user.companyId);
  }

  @Get('invoices')
  @Auth([RolesType.COMPANY_OWNER])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get billing invoices / order history',
    description: 'Retrieves Lemon Squeezy order history for the company. Only accessible by company owners.',
  })
  @ApiResponse({ status: 200, description: 'Orders/invoices retrieved', type: LsInvoicesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getInvoices(@CurrentUser() user: any): Promise<LsInvoicesResponseDto> {
    return this.lsService.getOrders(user.companyId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(@Headers('x-signature') signature: string, @Req() request: RawBodyRequest<Request>): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing x-signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Request body is required');
    }

    await this.lsService.handleWebhook(rawBody, signature);
    return { received: true };
  }
}
