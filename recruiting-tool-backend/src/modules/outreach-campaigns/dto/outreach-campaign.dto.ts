import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum OutreachLeadChannel {
  EMAIL = 'EMAIL',
  LINKEDIN = 'LINKEDIN',
}

export enum OutreachLeadStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  REPLIED = 'REPLIED',
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
  sent: number;

  @ApiProperty()
  replied: number;

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
