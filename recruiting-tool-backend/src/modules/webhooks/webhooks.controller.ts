import { Controller, Post, Body, UseGuards, Get, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import {
  CandidateCreatedWebhookDto,
  InterviewScheduledWebhookDto,
  StageChangedWebhookDto,
  ApplicationStatusChangedWebhookDto,
} from './dto/webhook.dto';
import { WebhookAuthGuard } from './guards/webhook-auth.guard';

@ApiTags('Webhooks')
@Controller('webhooks')
@UseGuards(WebhookAuthGuard)
@ApiSecurity('X-API-Key')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check webhook service health',
    description:
      'Returns the health status of the webhook service and available webhook endpoints',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook service is healthy',
  })
  async getHealth() {
    return this.webhooksService.getWebhookHealth();
  }

  @Post('candidate-created')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook trigger for new candidate creation',
    description:
      'This endpoint is called when a new candidate is created. Use this in n8n to trigger automated workflows like sending welcome emails, updating CRM systems, or notifying team members.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  async candidateCreated(@Body() data: CandidateCreatedWebhookDto) {
    return this.webhooksService.processCandidateCreated(data);
  }

  @Post('interview-scheduled')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook trigger for interview scheduling',
    description:
      'This endpoint is called when an interview is scheduled. Use this in n8n to trigger workflows like sending calendar invites, reminder emails, or updating external calendars.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  async interviewScheduled(@Body() data: InterviewScheduledWebhookDto) {
    return this.webhooksService.processInterviewScheduled(data);
  }

  @Post('stage-changed')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook trigger for candidate stage changes',
    description:
      'This endpoint is called when a candidate moves between hiring stages. Use this in n8n to trigger stage-specific workflows like sending emails, notifying hiring managers, or updating analytics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  async stageChanged(@Body() data: StageChangedWebhookDto) {
    return this.webhooksService.processStageChanged(data);
  }

  @Post('application-status-changed')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook trigger for application status changes',
    description:
      'This endpoint is called when an application status changes (e.g., ACCEPTED, REJECTED). Use this in n8n to trigger workflows like sending offer letters, rejection emails, or starting onboarding processes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  async applicationStatusChanged(
    @Body() data: ApplicationStatusChangedWebhookDto,
  ) {
    return this.webhooksService.processApplicationStatusChanged(data);
  }
}
