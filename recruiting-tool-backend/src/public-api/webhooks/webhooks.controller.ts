import { Controller, Get, Post, Patch, Delete, Body, Param, Req, HttpCode, HttpStatus, UseGuards, UseFilters } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';
import { PublicApiExceptionFilter } from '../filters/public-api-exception.filter';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';

@Controller('v1/webhooks')
@UseGuards(ApiKeyAuthGuard, PublicApiThrottlerGuard)
@UseFilters(PublicApiExceptionFilter)
@Throttle({ default: { limit: 1000, ttl: 3600000 } })
@ApiTags('Webhooks')
@ApiSecurity('api-key')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a webhook endpoint',
    description: 'Creates a new webhook endpoint. The signing secret is returned once in the response body — store it securely as it cannot be retrieved again.',
  })
  @ApiResponse({ status: 201, description: 'Webhook endpoint created (includes secret)', type: WebhookResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing API key' })
  async create(@Req() req: Request, @Body() dto: CreateWebhookDto): Promise<WebhookResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.create(companyId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List webhook endpoints',
    description: 'Returns all registered webhook endpoints for your company. Signing secrets are not included.',
  })
  @ApiResponse({ status: 200, description: 'List of webhook endpoints', type: [WebhookResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req: Request): Promise<WebhookResponseDto[]> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findAll(companyId);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a webhook endpoint', description: 'Returns a single webhook endpoint by UID.' })
  @ApiParam({ name: 'uid', description: 'Webhook endpoint UID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Webhook endpoint found', type: WebhookResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Webhook endpoint not found' })
  async findOne(@Req() req: Request, @Param('uid') uid: string): Promise<WebhookResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findOne(uid, companyId);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Update a webhook endpoint',
    description: 'Partially updates a webhook endpoint. Can update URL, subscribed events, or active status.',
  })
  @ApiParam({ name: 'uid', description: 'Webhook endpoint UID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Webhook endpoint updated', type: WebhookResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Webhook endpoint not found' })
  async update(@Req() req: Request, @Param('uid') uid: string, @Body() dto: UpdateWebhookDto): Promise<WebhookResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.update(uid, companyId, dto);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook endpoint', description: 'Permanently deletes a webhook endpoint.' })
  @ApiParam({ name: 'uid', description: 'Webhook endpoint UID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Webhook endpoint deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Webhook endpoint not found' })
  async remove(@Req() req: Request, @Param('uid') uid: string): Promise<void> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.remove(uid, companyId);
  }
}
