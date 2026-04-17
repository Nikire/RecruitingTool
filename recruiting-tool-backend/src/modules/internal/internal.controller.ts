import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';
import { InternalService } from './internal.service';
import { BatchSummaryDto } from './dto/batch-summary.dto';
import { DeploymentNotificationDto } from './dto/deployment-notification.dto';

@ApiTags('Internal')
@Controller('internal')
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  @Post('batch-summary')
  @UseGuards(InternalApiKeyGuard)
  @ApiOperation({ summary: 'Send a batch summary notification email to the developer' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Internal API key — must match INTERNAL_API_KEY env var',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    schema: { example: { message: 'Notification sent successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid API key' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendBatchSummary(@Body() dto: BatchSummaryDto): Promise<{ message: string }> {
    return this.internalService.sendBatchSummary(dto);
  }

  @Post('deployment-notification')
  @UseGuards(InternalApiKeyGuard)
  @ApiOperation({ summary: 'Send a deployment status notification email to the developer' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Internal API key — must match INTERNAL_API_KEY env var',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    schema: { example: { message: 'Notification sent successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid API key' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendDeploymentNotification(@Body() dto: DeploymentNotificationDto): Promise<{ message: string }> {
    return this.internalService.sendDeploymentNotification(dto);
  }
}
