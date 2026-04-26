import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsNotEmpty } from 'class-validator';
import { ProspectSource, ProspectStatus, OutreachActivityType, OutreachChannel } from '@prisma/client';

export class CreateProspectCompanyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

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
  companySize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ProspectSource)
  source?: ProspectSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ProspectStatus)
  status?: ProspectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProspectCompanyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

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
  companySize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ProspectSource)
  source?: ProspectSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ProspectStatus)
  status?: ProspectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOutreachContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

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
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateOutreachActivityDto {
  @ApiProperty({ enum: OutreachActivityType })
  @IsEnum(OutreachActivityType)
  type: OutreachActivityType;

  @ApiPropertyOptional({ enum: OutreachChannel })
  @IsOptional()
  @IsEnum(OutreachChannel)
  channel?: OutreachChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateUsed?: string;

  @ApiPropertyOptional({ enum: ProspectStatus })
  @IsOptional()
  @IsEnum(ProspectStatus)
  newStatus?: ProspectStatus;
}

export class OutreachContactResponseDto {
  uid: string;
  name: string;
  role?: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  isPrimary: boolean;
}

export class OutreachActivityResponseDto {
  uid: string;
  type: OutreachActivityType;
  channel?: OutreachChannel;
  notes?: string;
  templateUsed?: string;
  previousStatus?: ProspectStatus;
  newStatus?: ProspectStatus;
  createdAt: string;
  createdBy?: { uid: string; name: string };
}

export class ProspectCompanyResponseDto {
  uid: string;
  name: string;
  website?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  city?: string;
  source: ProspectSource;
  status: ProspectStatus;
  notes?: string;
  contacts?: OutreachContactResponseDto[];
  activities?: OutreachActivityResponseDto[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
}

export class ProspectListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProspectStatus;
  source?: ProspectSource;
}
