import { ApiPropertyOptional } from '@nestjs/swagger';
import { HiringProcessStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';

export class HiringProcessFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by hiring process status',
    enum: HiringProcessStatus,
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @IsEnum(HiringProcessStatus)
  status?: HiringProcessStatus;

  @ApiPropertyOptional({
    description: 'Filter by company UID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  companyUid?: string;

  @ApiPropertyOptional({
    description: 'Filter by job position UID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  positionUid?: string;

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
    description: 'Filter by candidate UID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  candidateUid?: string;

  @ApiPropertyOptional({
    description: 'Filter to processes whose job position is being filled for this end client (UID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  clientUid?: string;
}
