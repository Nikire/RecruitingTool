import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';
import { InternalService } from './internal.service';
import { BatchSummaryDto } from './dto/batch-summary.dto';
import { DeploymentNotificationDto } from './dto/deployment-notification.dto';
import { CompanyHealthService } from './company-health.service';
import { CompanyHealthDigestRunDto, CompanyHealthSnapshotRunDto } from './dto/company-health-digest.dto';

@ApiTags('Internal')
@Controller('internal')
export class InternalController {
  constructor(
    private readonly internalService: InternalService,
    private readonly companyHealthService: CompanyHealthService,
  ) {}

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

  // ─── Company Health (P3-9) ──────────────────────────────────────────────────
  //
  // The two jobs below run themselves on a cron (nightly 04:00 / Mondays 08:00).
  // These endpoints exist so the founder can trigger them on demand — to seed the
  // first snapshots right after deploy, or to see the digest without waiting for
  // Monday — using the same x-api-key already used for batch-summary.

  @Post('company-health/snapshot')
  @UseGuards(InternalApiKeyGuard)
  @ApiOperation({
    summary: 'Capture a company health snapshot for every company now (same work as the nightly cron)',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Internal API key — must match INTERNAL_API_KEY env var',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Snapshots captured', type: CompanyHealthSnapshotRunDto })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid API key' })
  async captureCompanyHealthSnapshot(): Promise<CompanyHealthSnapshotRunDto> {
    return this.companyHealthService.captureSnapshots();
  }

  @Post('company-health/weekly-digest')
  @UseGuards(InternalApiKeyGuard)
  @ApiOperation({
    summary: 'Email the founder every company whose health tier degraded versus a week ago (same work as the weekly cron)',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Internal API key — must match INTERNAL_API_KEY env var',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Digest evaluated (email only sent when something degraded)', type: CompanyHealthDigestRunDto })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid API key' })
  async runCompanyHealthWeeklyDigest(): Promise<CompanyHealthDigestRunDto> {
    return this.companyHealthService.runWeeklyDigest();
  }
}
