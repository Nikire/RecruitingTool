import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { DeletedService } from './deleted.service';
import { Auth } from '../../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { DeletedCandidateDto, DeletedJobPositionDto, DeletedApplicationDto, DeletedInterviewDto, PurgeResponseDto } from './dto/deleted.dto';

@ApiTags('Admin - Deleted Records')
@ApiBearerAuth()
@Controller('admin/deleted')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@Auth(['ADMIN'])
export class DeletedController {
  constructor(private readonly deletedService: DeletedService) {}

  // ==================== Candidates ====================

  @Get('candidates')
  @ApiOperation({ summary: 'Get all soft-deleted candidates' })
  @ApiResponse({
    status: 200,
    description: 'List of soft-deleted candidates',
    type: [DeletedCandidateDto],
  })
  async getDeletedCandidates(): Promise<DeletedCandidateDto[]> {
    return this.deletedService.getDeletedCandidates();
  }

  @Post('candidates/:uid/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted candidate' })
  @ApiResponse({
    status: 200,
    description: 'Candidate restored successfully',
    type: DeletedCandidateDto,
  })
  async restoreCandidate(@Param('uid') uid: string): Promise<DeletedCandidateDto> {
    return this.deletedService.restoreCandidate(uid);
  }

  @Delete('candidates/:uid/purge')
  @ApiOperation({ summary: 'Permanently delete a candidate (GDPR compliance)' })
  @ApiResponse({
    status: 200,
    description: 'Candidate permanently deleted',
    type: PurgeResponseDto,
  })
  async purgeCandidate(@Param('uid') uid: string): Promise<PurgeResponseDto> {
    return this.deletedService.purgeCandidate(uid);
  }

  // ==================== Job Positions ====================

  @Get('job-positions')
  @ApiOperation({ summary: 'Get all soft-deleted job positions' })
  @ApiResponse({
    status: 200,
    description: 'List of soft-deleted job positions',
    type: [DeletedJobPositionDto],
  })
  async getDeletedJobPositions(@CurrentUser() user: User): Promise<DeletedJobPositionDto[]> {
    return this.deletedService.getDeletedJobPositions(user.companyId!);
  }

  @Post('job-positions/:uid/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted job position' })
  @ApiResponse({
    status: 200,
    description: 'Job position restored successfully',
    type: DeletedJobPositionDto,
  })
  async restoreJobPosition(@Param('uid') uid: string, @CurrentUser() user: User): Promise<DeletedJobPositionDto> {
    return this.deletedService.restoreJobPosition(uid, user.companyId!);
  }

  @Delete('job-positions/:uid/purge')
  @ApiOperation({ summary: 'Permanently delete a job position (GDPR compliance)' })
  @ApiResponse({
    status: 200,
    description: 'Job position permanently deleted',
    type: PurgeResponseDto,
  })
  async purgeJobPosition(@Param('uid') uid: string, @CurrentUser() user: User): Promise<PurgeResponseDto> {
    return this.deletedService.purgeJobPosition(uid, user.companyId!);
  }

  // ==================== Applications ====================

  @Get('applications')
  @ApiOperation({ summary: 'Get all soft-deleted applications' })
  @ApiResponse({
    status: 200,
    description: 'List of soft-deleted applications',
    type: [DeletedApplicationDto],
  })
  async getDeletedApplications(@CurrentUser() user: User): Promise<DeletedApplicationDto[]> {
    return this.deletedService.getDeletedApplications(user.companyId!);
  }

  @Post('applications/:uid/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted application' })
  @ApiResponse({
    status: 200,
    description: 'Application restored successfully',
    type: DeletedApplicationDto,
  })
  async restoreApplication(@Param('uid') uid: string): Promise<DeletedApplicationDto> {
    return this.deletedService.restoreApplication(uid);
  }

  @Delete('applications/:uid/purge')
  @ApiOperation({ summary: 'Permanently delete an application (GDPR compliance)' })
  @ApiResponse({
    status: 200,
    description: 'Application permanently deleted',
    type: PurgeResponseDto,
  })
  async purgeApplication(@Param('uid') uid: string): Promise<PurgeResponseDto> {
    return this.deletedService.purgeApplication(uid);
  }

  // ==================== Interviews ====================

  @Get('interviews')
  @ApiOperation({ summary: 'Get all soft-deleted interviews' })
  @ApiResponse({
    status: 200,
    description: 'List of soft-deleted interviews',
    type: [DeletedInterviewDto],
  })
  async getDeletedInterviews(@CurrentUser() user: User): Promise<DeletedInterviewDto[]> {
    return this.deletedService.getDeletedInterviews(user.companyId!);
  }

  @Post('interviews/:uid/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted interview' })
  @ApiResponse({
    status: 200,
    description: 'Interview restored successfully',
    type: DeletedInterviewDto,
  })
  async restoreInterview(@Param('uid') uid: string): Promise<DeletedInterviewDto> {
    return this.deletedService.restoreInterview(uid);
  }

  @Delete('interviews/:uid/purge')
  @ApiOperation({ summary: 'Permanently delete an interview (GDPR compliance)' })
  @ApiResponse({
    status: 200,
    description: 'Interview permanently deleted',
    type: PurgeResponseDto,
  })
  async purgeInterview(@Param('uid') uid: string): Promise<PurgeResponseDto> {
    return this.deletedService.purgeInterview(uid);
  }
}
