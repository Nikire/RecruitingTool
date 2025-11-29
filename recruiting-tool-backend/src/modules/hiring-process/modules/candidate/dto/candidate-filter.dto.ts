import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationSource } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';

export class CandidateFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by application source',
    enum: ApplicationSource,
    example: 'LINKEDIN',
  })
  @IsOptional()
  @IsEnum(ApplicationSource)
  source?: ApplicationSource;

  @ApiPropertyOptional({
    description: 'Filter by skills (comma-separated or array)',
    example: ['JavaScript', 'TypeScript'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Filter by creation date start (ISO 8601 format)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date end (ISO 8601 format)',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by hiring process status (candidates with active/closed processes)',
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
