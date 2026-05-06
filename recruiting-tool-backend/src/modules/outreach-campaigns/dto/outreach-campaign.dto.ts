import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OutreachLeadChannel {
  EMAIL = 'EMAIL',
  LINKEDIN = 'LINKEDIN',
}

export enum OutreachLeadStatus {
  PENDING = 'PENDING',
  CONVERTED = 'CONVERTED',
}

// ─── Campaign DTOs ────────────────────────────────────────────────────────────

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CampaignLeadCountsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  converted: number;
}

export class CampaignResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: CampaignLeadCountsDto })
  leadCounts: CampaignLeadCountsDto;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

// ─── Lead DTOs ────────────────────────────────────────────────────────────────

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: OutreachLeadChannel })
  @IsOptional()
  @IsEnum(OutreachLeadChannel)
  channel?: OutreachLeadChannel;

  @ApiPropertyOptional({ enum: OutreachLeadStatus })
  @IsOptional()
  @IsEnum(OutreachLeadStatus)
  status?: OutreachLeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LeadResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  company: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  linkedinUrl?: string;

  @ApiProperty({ enum: OutreachLeadChannel })
  channel: OutreachLeadChannel;

  @ApiProperty({ enum: OutreachLeadStatus })
  status: OutreachLeadStatus;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  convertedToProspectAt?: string;

  @ApiPropertyOptional()
  prospectUid?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  // Apollo enrichment fields
  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  state?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  industry?: string;

  @ApiProperty({ required: false })
  seniority?: string;

  @ApiProperty({ required: false })
  apolloContactId?: string;

  @ApiProperty({ required: false })
  apolloAccountId?: string;

  @ApiProperty({ required: false })
  secondaryEmail?: string;

  @ApiProperty({ required: false })
  apolloData?: Record<string, unknown>;
}

export class ImportResultDto {
  @ApiProperty()
  imported: number;

  @ApiProperty()
  skipped: number;
}

export class ConvertResultDto {
  @ApiProperty()
  prospectUid: string;
}

// ─── Convert Lead DTO ──────────────────────────────────────────────────────────

export class ConvertLeadDto {
  @ApiPropertyOptional({ type: [String], description: 'Tags to assign to the new CRM prospect' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Source override for the CRM prospect (defaults to APOLLO_CAMPAIGN)' })
  @IsOptional()
  @IsString()
  source?: string;
}

// ─── Bulk Import DTOs ──────────────────────────────────────────────────────────

export class BulkLeadItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  // Apollo enrichment fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seniority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apolloContactId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apolloAccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryEmail?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  apolloData?: Record<string, unknown>;
}

export class BulkCreateLeadsDto {
  @ApiProperty({ type: [BulkLeadItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkLeadItemDto)
  leads: BulkLeadItemDto[];
}

// ─── Send Email DTOs ───────────────────────────────────────────────────────────

export class SendLeadEmailDto {
  @ApiPropertyOptional({ description: 'UID of the email template to use. If omitted, the default OUTREACH template for the company is used.' })
  @IsOptional()
  @IsString()
  templateUid?: string;
}

export class SendLeadEmailResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  emailLogUid: string;
}

// ─── Preview Email DTOs ────────────────────────────────────────────────────────

export class PreviewEmailResultDto {
  @ApiProperty({ description: 'Rendered email subject' })
  subject: string;

  @ApiProperty({ description: 'Rendered email body (may be HTML)' })
  body: string;

  @ApiProperty({ description: 'Name of the email template used' })
  templateName: string;
}

// ─── Send Test Email DTOs ──────────────────────────────────────────────────────

export class SendTestEmailDto {
  @ApiPropertyOptional({ description: 'UID of the email template to use. If omitted, the default OUTREACH template is used.' })
  @IsOptional()
  @IsString()
  templateUid?: string;

  @ApiPropertyOptional({ description: 'Dummy first name for rendering', default: 'John Doe' })
  @IsOptional()
  @IsString()
  dummyName?: string;

  @ApiPropertyOptional({ description: 'Dummy company name for rendering', default: 'Acme Corp' })
  @IsOptional()
  @IsString()
  dummyCompany?: string;
}

export class SendTestEmailResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ description: 'Email address the test was sent to' })
  sentTo: string;
}

// ─── Daily Check DTO ───────────────────────────────────────────────────────────

export class DailyCheckResultDto {
  @ApiProperty({ description: 'Whether leads were already created today for this campaign' })
  alreadyRanToday: boolean;

  @ApiProperty({ description: 'Number of leads created today' })
  count: number;
}
