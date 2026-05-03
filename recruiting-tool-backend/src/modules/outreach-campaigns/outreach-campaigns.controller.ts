import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import { OutreachCampaignsService } from './outreach-campaigns.service';
import { CreateCampaignDto, UpdateLeadDto, CampaignResponseDto, LeadResponseDto, ImportResultDto, ConvertResultDto, BulkCreateLeadsDto } from './dto/outreach-campaign.dto';
import { WebhookAuthGuard } from '../webhooks/guards/webhook-auth.guard';

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
  findAll(@CurrentUser('id') userId: number): Promise<CampaignResponseDto[]> {
    return this.service.findAllCampaigns(userId);
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
  @ApiOperation({ summary: 'Import leads from CSV - ADMIN required' })
  @ApiResponse({ status: 201, type: ImportResultDto })
  importLeads(@Param('campaignUid') campaignUid: string, @UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: number): Promise<ImportResultDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.service.importLeads(campaignUid, file.buffer, userId);
  }

  @Post(':campaignUid/leads/bulk')
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
  updateLead(
    @Param('campaignUid') campaignUid: string,
    @Param('leadUid') leadUid: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser('id') userId: number,
  ): Promise<LeadResponseDto> {
    return this.service.updateLead(campaignUid, leadUid, dto, userId);
  }

  @Post(':campaignUid/leads/:leadUid/convert')
  @ApiOperation({ summary: 'Convert lead to CRM prospect - ADMIN required' })
  @ApiResponse({ status: 201, type: ConvertResultDto })
  convertLead(@Param('campaignUid') campaignUid: string, @Param('leadUid') leadUid: string, @CurrentUser('id') userId: number): Promise<ConvertResultDto> {
    return this.service.convertLead(campaignUid, leadUid, userId);
  }
}
