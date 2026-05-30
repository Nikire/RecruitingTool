import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, UseGuards, UseFilters, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';
import { PublicApiExceptionFilter } from '../filters/public-api-exception.filter';
import { PublicCandidatesService } from './public-candidates.service';
import { CreatePublicCandidateDto } from './dto/create-public-candidate.dto';
import { UpdatePublicCandidateDto } from './dto/update-public-candidate.dto';
import { PublicCandidateResponseDto } from './dto/public-candidate-response.dto';
import { PublicCandidatesListResponseDto } from './dto/public-candidates-list-response.dto';

@Controller('v1/candidates')
@UseGuards(ApiKeyAuthGuard, PublicApiThrottlerGuard)
@UseFilters(PublicApiExceptionFilter)
@Throttle({ default: { limit: 1000, ttl: 3600000 } })
@ApiTags('Candidates')
@ApiSecurity('api-key')
export class PublicCandidatesController {
  constructor(private readonly service: PublicCandidatesService) {}

  @Get()
  @ApiOperation({ summary: 'List candidates', description: 'Returns a paginated list of candidates for your company.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page, max 100 (default: 20)' })
  @ApiQuery({ name: 'source', required: false, type: String, description: 'Filter by application source (e.g. MANUAL, LINKEDIN)' })
  @ApiResponse({ status: 200, description: 'Paginated list of candidates', type: PublicCandidatesListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing API key' })
  async findAll(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('source') source?: string,
  ): Promise<PublicCandidatesListResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findAll(companyId, { page, limit, source });
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a candidate', description: 'Returns a single candidate by UID.' })
  @ApiParam({ name: 'uid', description: 'Candidate UID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Candidate found', type: PublicCandidateResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async findOne(@Req() req: Request, @Param('uid') uid: string): Promise<PublicCandidateResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.findOne(uid, companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a candidate', description: 'Creates a new candidate in your company.' })
  @ApiResponse({ status: 201, description: 'Candidate created', type: PublicCandidateResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict – candidate with this email already exists' })
  async create(@Req() req: Request, @Body() dto: CreatePublicCandidateDto): Promise<PublicCandidateResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.create(companyId, dto);
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Update a candidate', description: 'Partially updates a candidate by UID.' })
  @ApiParam({ name: 'uid', description: 'Candidate UID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Candidate updated', type: PublicCandidateResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 409, description: 'Conflict – email already in use' })
  async update(@Req() req: Request, @Param('uid') uid: string, @Body() dto: UpdatePublicCandidateDto): Promise<PublicCandidateResponseDto> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.update(uid, companyId, dto);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a candidate', description: 'Soft-deletes a candidate by UID.' })
  @ApiParam({ name: 'uid', description: 'Candidate UID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Candidate deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async remove(@Req() req: Request, @Param('uid') uid: string): Promise<void> {
    const companyId = (req as any).apiKeyCompany.id as number;
    return this.service.remove(uid, companyId);
  }
}
