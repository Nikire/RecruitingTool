import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';
import { PublicApiExceptionFilter } from '../filters/public-api-exception.filter';
import { PublicJobPositionsService } from './public-job-positions.service';
import { CreatePublicJobPositionDto } from './dto/create-public-job-position.dto';
import { UpdatePublicJobPositionDto } from './dto/update-public-job-position.dto';
import { PublicApiJobPositionResponseDto } from './dto/public-job-position-response.dto';
import { PublicJobPositionsListResponseDto } from './dto/public-job-positions-list-response.dto';

@Controller('v1/job-positions')
@UseGuards(ApiKeyAuthGuard, PublicApiThrottlerGuard)
@UseFilters(PublicApiExceptionFilter)
@Throttle({ default: { limit: 1000, ttl: 3600000 } })
@ApiTags('Job Positions')
@ApiSecurity('api-key')
export class PublicJobPositionsController {
  constructor(private readonly service: PublicJobPositionsService) {}

  @Get()
  @ApiOperation({
    summary: 'List job positions',
    description: 'Returns a paginated list of job positions belonging to the authenticated company.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-indexed). Defaults to 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (max 100). Defaults to 20.',
    example: 20,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status. Accepted values: OPEN, CLOSED, CANCELLED.',
    example: 'OPEN',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of job positions',
    type: PublicJobPositionsListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or missing API key' })
  findAll(@Req() req: Request, @Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string): Promise<PublicJobPositionsListResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findAll(companyId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Get a job position by UID',
    description: 'Returns a single job position that belongs to the authenticated company.',
  })
  @ApiParam({
    name: 'uid',
    description: 'The unique identifier (UUID) of the job position',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Job position found',
    type: PublicApiJobPositionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or missing API key' })
  @ApiResponse({ status: 404, description: 'Job position not found' })
  findOne(@Req() req: Request, @Param('uid') uid: string): Promise<PublicApiJobPositionResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findOne(uid, companyId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a job position',
    description: 'Creates a new job position for the authenticated company.',
  })
  @ApiResponse({
    status: 201,
    description: 'Job position created successfully',
    type: PublicApiJobPositionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or missing API key' })
  create(@Req() req: Request, @Body() dto: CreatePublicJobPositionDto): Promise<PublicApiJobPositionResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.create(companyId, dto);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Update a job position',
    description: 'Partially updates an existing job position that belongs to the authenticated company.',
  })
  @ApiParam({
    name: 'uid',
    description: 'The unique identifier (UUID) of the job position to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Job position updated successfully',
    type: PublicApiJobPositionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or missing API key' })
  @ApiResponse({ status: 404, description: 'Job position not found' })
  update(@Req() req: Request, @Param('uid') uid: string, @Body() dto: UpdatePublicJobPositionDto): Promise<PublicApiJobPositionResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.update(uid, companyId, dto);
  }
}
