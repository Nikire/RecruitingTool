import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}

export enum ExportEntity {
  CANDIDATES = 'candidates',
  COMPANIES = 'companies',
  JOB_POSITIONS = 'job-positions',
  HIRING_PROCESSES = 'hiring-processes',
}

export class DateRangeDto {
  @ApiProperty({
    description: 'Start date for filtering',
    example: '2024-01-01',
  })
  @IsDateString()
  start: string;

  @ApiProperty({
    description: 'End date for filtering',
    example: '2024-12-31',
  })
  @IsDateString()
  end: string;
}

export class ExportFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by status values',
    example: ['ACTIVE', 'PENDING'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @ApiPropertyOptional({
    description: 'Date range filter',
    type: DateRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({
    description: 'Company UID filter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  companyUid?: string;
}

export class ExportRequestDto {
  @ApiProperty({
    description: 'Export format',
    enum: ExportFormat,
    example: ExportFormat.CSV,
  })
  @IsEnum(ExportFormat)
  type: ExportFormat;

  @ApiProperty({
    description: 'Entity to export',
    enum: ExportEntity,
    example: ExportEntity.CANDIDATES,
  })
  @IsEnum(ExportEntity)
  entity: ExportEntity;

  @ApiPropertyOptional({
    description: 'Filters to apply to the export',
    type: ExportFiltersDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExportFiltersDto)
  filters?: ExportFiltersDto;

  @ApiPropertyOptional({
    description: 'Specific columns to include in export (if not provided, all columns will be exported)',
    example: ['name', 'email', 'status'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];
}
