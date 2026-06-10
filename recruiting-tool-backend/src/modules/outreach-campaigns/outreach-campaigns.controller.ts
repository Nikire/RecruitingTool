import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import { OutreachCampaignsService } from './outreach-campaigns.service';
import {
  CreateCampaignDto,
  UpdateLeadDto,
  CampaignResponseDto,
  LeadResponseDto,
  ImportResultDto,
  ConvertResultDto,
  ConvertLeadDto,
  DailyCheckResultDto,
  BulkCreateLeadsDto,
  SendLeadEmailDto,
  SendLeadEmailResultDto,
  PreviewEmailResultDto,
  SendTestEmailDto,
  SendTestEmailResultDto,
  SetLinkedinMessageDto,
} from './dto/outreach-campaign.dto';
import { WebhookAuthGuard } from '../webhooks/guards/webhook-auth.guard';
import { SkipAuth } from '../shared/modules/auth/decorators/skip-auth.decorator';

@ApiTags('outreach-campaigns')
@ApiBearerAuth()
@Controller('outreach-campaigns')
@Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
export class OutreachCampaignsController {
  constructor(private readonly service: OutreachCampaignsService) {}

  // ─── Campaigns ──────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all campaigns - ADMIN required' })
  @ApiResponse({ status: 200, type: [CampaignResponseDto] })
  findAll(): Promise<CampaignResponseDto[]> {
    return this.service.findAllCampaigns();
  }

  @Post()
  @ApiOperation({ summary: 'Create a campaign - ADMIN required' })
  @ApiResponse({ status: 201, type: CampaignResponseDto })
  createCampaign(@Body() dto: CreateCampaignDto, @CurrentUser('id') userId: number): Promise<CampaignResponseDto> {
    return this.service.createCampaign(dto, userId);
  }

  @Delete(':uid')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a campaign and all its leads - ADMIN required' })
  @ApiResponse({ status: 204 })
  deleteCampaign(@Param('uid') uid: string): Promise<void> {
    return this.service.deleteCampaign(uid);
  }

  // ─── Leads ──────────────────────────────────────────────────────────────────

  @Get(':campaignUid/leads')
  @ApiOperation({ summary: 'List leads for a campaign - ADMIN required' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'channel', required: false })
  @ApiResponse({ status: 200, type: [LeadResponseDto] })
  findLeads(@Param('campaignUid') campaignUid: string, @Query('status') status?: string, @Query('channel') channel?: string): Promise<LeadResponseDto[]> {
    return this.service.findLeads(campaignUid, { status, channel });
  }

  @Post(':campaignUid/leads/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import leads from CSV (Apollo format supported) - ADMIN required' })
  @ApiResponse({ status: 201, type: ImportResultDto })
  importLeads(@Param('campaignUid') campaignUid: string, @UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: number): Promise<ImportResultDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.service.importLeads(campaignUid, file.buffer, userId);
  }

  @Post(':campaignUid/leads/bulk')
  @SkipAuth()
  @UseGuards(WebhookAuthGuard)
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'Bulk create leads via JSON (n8n / webhook) - requires x-api-key header' })
  @ApiResponse({ status: 201, type: ImportResultDto })
  bulkCreateLeads(@Param('campaignUid') campaignUid: string, @Body() body: BulkCreateLeadsDto): Promise<ImportResultDto> {
    return this.service.bulkCreateLeads(campaignUid, body.leads);
  }

  @Patch(':campaignUid/leads/:leadUid')
  @ApiOperation({ summary: 'Update a lead (status, channel, notes) - ADMIN required' })
  @ApiResponse({ status: 200, type: LeadResponseDto })
  updateLead(@Param('campaignUid') campaignUid: string, @Param('leadUid') leadUid: string, @Body() dto: UpdateLeadDto): Promise<LeadResponseDto> {
    return this.service.updateLead(campaignUid, leadUid, dto);
  }

  @Post(':campaignUid/leads/:leadUid/convert')
  @ApiOperation({ summary: 'Convert lead to CRM prospect - ADMIN required' })
  @ApiResponse({ status: 201, type: ConvertResultDto })
  convertLead(
    @Param('campaignUid') campaignUid: string,
    @Param('leadUid') leadUid: string,
    @Body() dto: ConvertLeadDto,
    @CurrentUser('id') userId: number,
  ): Promise<ConvertResultDto> {
    return this.service.convertLead(campaignUid, leadUid, userId, dto);
  }

  @Get(':campaignUid/daily-check')
  @SkipAuth()
  @UseGuards(WebhookAuthGuard)
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'Check if leads were already created today for this campaign (n8n idempotency check)' })
  @ApiResponse({ status: 200, type: DailyCheckResultDto })
  dailyCheck(@Param('campaignUid') campaignUid: string): Promise<DailyCheckResultDto> {
    return this.service.dailyCheck(campaignUid);
  }

  @Post(':campaignUid/leads/:leadUid/send-email')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.HR, RolesType.HR_MANAGER, RolesType.COMPANY_OWNER])
  @ApiOperation({ summary: 'Send outreach email to a lead - HR/ADMIN required' })
  @ApiResponse({ status: 201, type: SendLeadEmailResultDto })
  sendLeadEmail(
    @Param('campaignUid') campaignUid: string,
    @Param('leadUid') leadUid: string,
    @Body() dto: SendLeadEmailDto,
    @CurrentUser() user: { id: number; name: string; companyId: number | null },
  ): Promise<SendLeadEmailResultDto> {
    return this.service.sendLeadEmail(campaignUid, leadUid, dto, user);
  }

  @Get(':campaignUid/leads/:leadUid/preview-email')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.HR, RolesType.HR_MANAGER, RolesType.COMPANY_OWNER])
  @ApiOperation({ summary: 'Preview rendered outreach email for a lead (no send) - HR/ADMIN required' })
  @ApiResponse({ status: 200, type: PreviewEmailResultDto })
  previewLeadEmail(
    @Param('campaignUid') campaignUid: string,
    @Param('leadUid') leadUid: string,
    @CurrentUser() user: { id: number; name: string; companyId: number | null },
  ): Promise<PreviewEmailResultDto> {
    return this.service.previewLeadEmail(campaignUid, leadUid, user);
  }

  // ─── Internal endpoints (x-api-key, no JWT) ─────────────────────────────────

  @Get(':campaignUid/leads-internal')
  @SkipAuth()
  @UseGuards(WebhookAuthGuard)
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'List leads for a campaign - internal x-api-key auth' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'channel', required: false })
  @ApiResponse({ status: 200, type: [LeadResponseDto] })
  findLeadsInternal(@Param('campaignUid') campaignUid: string, @Query('status') status?: string, @Query('channel') channel?: string): Promise<LeadResponseDto[]> {
    return this.service.findLeads(campaignUid, { status, channel });
  }

  @Get(':campaignUid/leads/:leadUid/preview-email-internal')
  @SkipAuth()
  @UseGuards(WebhookAuthGuard)
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'Preview rendered email for a lead - internal x-api-key auth' })
  @ApiResponse({ status: 200, type: PreviewEmailResultDto })
  previewLeadEmailInternal(@Param('campaignUid') campaignUid: string, @Param('leadUid') leadUid: string): Promise<PreviewEmailResultDto> {
    return this.service.previewLeadEmailInternal(campaignUid, leadUid);
  }

  @Post(':campaignUid/leads/:leadUid/convert-internal')
  @SkipAuth()
  @UseGuards(WebhookAuthGuard)
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'Convert lead to CRM prospect - internal x-api-key auth' })
  @ApiResponse({ status: 201, type: ConvertResultDto })
  convertLeadInternal(@Param('campaignUid') campaignUid: string, @Param('leadUid') leadUid: string, @Body() dto: ConvertLeadDto): Promise<ConvertResultDto> {
    return this.service.convertLeadInternal(campaignUid, leadUid, dto);
  }

  @Patch(':campaignUid/leads/:leadUid/set-linkedin-message-internal')
  @SkipAuth()
  @UseGuards(WebhookAuthGuard)
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'Set LinkedIn outreach message for a lead - internal x-api-key auth (called by Claude/n8n)' })
  @ApiResponse({ status: 200, type: LeadResponseDto })
  setLinkedinMessageInternal(@Param('campaignUid') campaignUid: string, @Param('leadUid') leadUid: string, @Body() dto: SetLinkedinMessageDto): Promise<LeadResponseDto> {
    return this.service.setLinkedinMessage(campaignUid, leadUid, dto);
  }

  @Post(':campaignUid/send-test-email')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.HR, RolesType.HR_MANAGER, RolesType.COMPANY_OWNER])
  @ApiOperation({ summary: 'Send a test outreach email to yourself with dummy data - HR/ADMIN required' })
  @ApiResponse({ status: 201, type: SendTestEmailResultDto })
  sendTestEmail(
    @Param('campaignUid') campaignUid: string,
    @Body() dto: SendTestEmailDto,
    @CurrentUser() user: { id: number; name: string; companyId: number | null },
  ): Promise<SendTestEmailResultDto> {
    return this.service.sendTestEmail(campaignUid, dto, user);
  }
}
