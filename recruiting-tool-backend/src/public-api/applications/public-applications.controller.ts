import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpCode, HttpStatus, UseGuards, UseFilters, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';
import { PublicApiExceptionFilter } from '../filters/public-api-exception.filter';
import { PublicApplicationsService } from './public-applications.service';
import { CreatePublicApplicationDto } from './dto/create-public-application.dto';
import { UpdatePublicApplicationStatusDto } from './dto/update-public-application-status.dto';
import { PublicApplicationResponseDto } from './dto/public-application-response.dto';
import { PublicApplicationsListResponseDto } from './dto/public-applications-list-response.dto';

@Controller('v1/applications')
@UseGuards(ApiKeyAuthGuard, PublicApiThrottlerGuard)
@Throttle({ default: { limit: 1000, ttl: 3600000 } })
@UseFilters(PublicApiExceptionFilter)
@ApiTags('Applications')
@ApiSecurity('api-key')
export class PublicApplicationsController {
  constructor(private readonly service: PublicApplicationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List applications',
    description: 'Returns a paginated list of applications scoped to your company.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page, max 100 (default: 20)' })
  @ApiQuery({ name: 'jobPositionUid', required: false, type: String, description: 'Filter by job position UID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status (e.g. PENDING, REVIEWED, ACCEPTED, REJECTED)' })
  @ApiResponse({ status: 200, description: 'Paginated list of applications', type: PublicApplicationsListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing API key' })
  async findAll(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('jobPositionUid') jobPositionUid?: string,
    @Query('status') status?: string,
  ): Promise<PublicApplicationsListResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findAll(companyId, { page, limit, jobPositionUid, status });
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Get an application',
    description: 'Returns a single application by UID, scoped to your company.',
  })
  @ApiParam({ name: 'uid', description: 'Application UID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Application found', type: PublicApplicationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Req() req: Request, @Param('uid') uid: string): Promise<PublicApplicationResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findOne(uid, companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an application',
    description: 'Creates a new application for a job position in your company.',
  })
  @ApiResponse({ status: 201, description: 'Application created', type: PublicApplicationResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job position not found' })
  @ApiResponse({ status: 409, description: 'Conflict – an application from this email already exists for this position' })
  async create(@Req() req: Request, @Body() dto: CreatePublicApplicationDto): Promise<PublicApplicationResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.create(companyId, dto);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Update application status',
    description: 'Updates the status of an application by UID.',
  })
  @ApiParam({ name: 'uid', description: 'Application UID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Application updated', type: PublicApplicationResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async updateStatus(@Req() req: Request, @Param('uid') uid: string, @Body() dto: UpdatePublicApplicationStatusDto): Promise<PublicApplicationResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.updateStatus(uid, companyId, dto);
  }
}
