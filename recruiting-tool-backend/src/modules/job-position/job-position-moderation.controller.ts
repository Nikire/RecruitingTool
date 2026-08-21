import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { JobPositionModerationService } from './job-position-moderation.service';
import { ApproveJobPositionDto, JobModerationQueryDto, JobModerationStatsDto, ModerationJobPositionItemDto, RejectJobPositionDto } from './dto/job-position-moderation.dto';
import { PaginatedResponse } from 'src/dto/pagination.dto';

/**
 * Platform-level job posting moderation (anti-spam).
 * SUPER_ADMIN only — these routes span every company on the platform.
 */
@ApiTags('Admin - Job Moderation')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@Auth(['SUPER_ADMIN'])
@Controller('admin/job-moderation')
export class JobPositionModerationController {
  constructor(private readonly moderationService: JobPositionModerationService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Job posting moderation counters - SUPER_ADMIN required',
    description: 'Returns how many postings are pending, approved and rejected across the whole platform.',
  })
  @ApiResponse({ status: 200, description: 'Moderation counters', type: JobModerationStatsDto })
  getStats(): Promise<JobModerationStatsDto> {
    return this.moderationService.getStats();
  }

  @Get('pending')
  @ApiOperation({
    summary: 'List job postings awaiting moderation - SUPER_ADMIN required',
    description:
      'Paginated moderation queue across every company. Defaults to moderationStatus=PENDING_APPROVAL; pass moderationStatus=APPROVED or REJECTED to review past decisions. Supports search (title or company name), companyUid, page, pageSize, sortBy (createdAt|title|moderatedAt) and sortOrder.',
  })
  @ApiResponse({ status: 200, description: 'Paginated moderation queue', type: [ModerationJobPositionItemDto] })
  listPending(@Query() query: JobModerationQueryDto): Promise<PaginatedResponse<ModerationJobPositionItemDto>> {
    return this.moderationService.list(query);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get one job posting with its moderation context - SUPER_ADMIN required' })
  @ApiParam({ name: 'uid', required: true, description: 'Job position UID' })
  @ApiResponse({ status: 200, description: 'Job posting moderation detail', type: ModerationJobPositionItemDto })
  findOne(@Param('uid') uid: string): Promise<ModerationJobPositionItemDto> {
    return this.moderationService.findOne(uid);
  }

  @Post(':uid/approve')
  @ApiOperation({
    summary: 'Approve a job posting - SUPER_ADMIN required',
    description: 'Marks the posting APPROVED so it becomes visible on the public careers board, and notifies the user who created it.',
  })
  @ApiParam({ name: 'uid', required: true, description: 'Job position UID' })
  @ApiBody({ type: ApproveJobPositionDto, required: false })
  @ApiResponse({ status: 201, description: 'The approved job posting', type: ModerationJobPositionItemDto })
  @ApiResponse({ status: 400, description: 'The posting is already APPROVED' })
  @ApiResponse({ status: 404, description: 'Job posting not found' })
  approve(@Param('uid') uid: string, @Body() dto: ApproveJobPositionDto, @CurrentUser() currentUser: User): Promise<ModerationJobPositionItemDto> {
    return this.moderationService.approve(uid, dto ?? {}, currentUser);
  }

  @Post(':uid/reject')
  @ApiOperation({
    summary: 'Reject a job posting - SUPER_ADMIN required',
    description: 'Marks the posting REJECTED with a mandatory reason, keeps it off the public careers board, and notifies the user who created it.',
  })
  @ApiParam({ name: 'uid', required: true, description: 'Job position UID' })
  @ApiBody({ type: RejectJobPositionDto })
  @ApiResponse({ status: 201, description: 'The rejected job posting', type: ModerationJobPositionItemDto })
  @ApiResponse({ status: 400, description: 'Missing reason, or the posting is already REJECTED' })
  @ApiResponse({ status: 404, description: 'Job posting not found' })
  reject(@Param('uid') uid: string, @Body() dto: RejectJobPositionDto, @CurrentUser() currentUser: User): Promise<ModerationJobPositionItemDto> {
    return this.moderationService.reject(uid, dto, currentUser);
  }
}
