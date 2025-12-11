import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { JobPositionService } from './job-position.service';
import { User } from '@prisma/client';
import {
  CreateJobPositionDto,
  JobPositionResponseDto,
  UpdateJobPositionDto,
  PublicJobPositionResponseDto,
  JobPositionFiltersDto,
  PaginatedPublicJobPositionResponseDto,
} from './dto/job-position.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { CheckQuota } from '../quota/decorators/check-quota.decorator';

@ApiTags('Job Position')
@Controller('job-position')
export class JobPositionController {
  constructor(private readonly jobPositionService: JobPositionService) {}

  @Get('public/all')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000) // Cache for 10 minutes (600 seconds * 1000ms)
  @ApiOperation({ summary: 'Get all open job positions with filtering and pagination (Public - No auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of open job positions',
    type: PaginatedPublicJobPositionResponseDto,
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title, description' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by job category' })
  @ApiQuery({ name: 'jobType', required: false, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'], description: 'Filter by job type' })
  @ApiQuery({ name: 'workLocation', required: false, enum: ['REMOTE', 'HYBRID', 'ONSITE'], description: 'Filter by work location' })
  @ApiQuery({ name: 'experienceLevel', required: false, enum: ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'], description: 'Filter by experience level' })
  @ApiQuery({ name: 'salaryMin', required: false, type: Number, description: 'Minimum salary filter' })
  @ApiQuery({ name: 'salaryMax', required: false, type: Number, description: 'Maximum salary filter' })
  @ApiQuery({ name: 'companyUid', required: false, description: 'Filter by company UID' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'salary', 'title'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-indexed)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findAllPublic(@Query() filters: JobPositionFiltersDto) {
    return this.jobPositionService.findAllPublic(filters);
  }

  @Get('public/:uid')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000) // Cache for 10 minutes
  @ApiOperation({ summary: 'Get single job position details (Public - No auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Returns job position details',
    type: PublicJobPositionResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOnePublic(@Param('uid') uid: string) {
    return this.jobPositionService.findOnePublic(uid);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @CheckQuota('jobPositions')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Post()
  @ApiOperation({ summary: 'Creates a Job position - HR role required' })
  @ApiResponse({
    status: 201,
    description: 'The job position has been successfully created.',
    type: JobPositionResponseDto,
  })
  @ApiResponse({
    status: 402,
    description: 'Payment Required - Quota exceeded for current subscription plan',
  })
  @ApiBody({ type: CreateJobPositionDto })
  create(@CurrentUser() currentUser: User, @Body() createJobPositionDto: CreateJobPositionDto): Promise<JobPositionResponseDto> {
    return this.jobPositionService.create(currentUser.uid, createJobPositionDto);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Get('list')
  @ApiOperation({ summary: 'Get paginated job positions list with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated job positions list',
  })
  list(@Query() paginationDto: PaginationDto, @CurrentUser() currentUser: User): Promise<PaginatedResponse<JobPositionResponseDto>> {
    return this.jobPositionService.list(paginationDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // Cache for 1 minute (internal endpoints need fresher data)
  @ApiOperation({ summary: 'Get job position list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job position details',
    type: [JobPositionResponseDto],
  })
  findAll(@CurrentUser() currentUser: User): Promise<Array<JobPositionResponseDto>> {
    return this.jobPositionService.findAll(currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Get(':uid')
  @ApiOperation({ summary: 'Get job position process' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job position details',
    type: JobPositionResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<JobPositionResponseDto> {
    return this.jobPositionService.findOne(uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Put(':uid')
  @ApiOperation({ summary: 'Update one job position' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated job position details',
    type: JobPositionResponseDto,
  })
  @ApiBody({ type: UpdateJobPositionDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateJobPositionDto: UpdateJobPositionDto, @CurrentUser() currentUser: User): Promise<JobPositionResponseDto> {
    return this.jobPositionService.update(uid, updateJobPositionDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Delete(':uid')
  @ApiOperation({ summary: 'Delete one job position - HR role required' })
  @ApiResponse({
    status: 200,
    description: 'The job position has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  remove(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<MessageResponseDto> {
    return this.jobPositionService.remove(uid, currentUser);
  }
}
