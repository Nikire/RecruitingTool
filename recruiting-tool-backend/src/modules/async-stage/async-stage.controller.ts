import { Controller, Get, Post, Patch, Delete, Body, Param, UploadedFiles, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { AsyncStageService } from './async-stage.service';
import {
  SendAsyncInvitationDto,
  ReviewSubmissionDto,
  AsyncStageTokenResponseDto,
  AsyncStageSubmissionResponseDto,
  AsyncStageStatusResponseDto,
  PublicAsyncStageInfoDto,
} from './dto/async-stage.dto';

// ─── Protected Routes (HR) ────────────────────────────────────────────────────

@ApiTags('Async Stage')
@ApiBearerAuth()
@Controller('async-stage')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Bearer is missing / expired / insufficient permissions' })
export class AsyncStageController {
  constructor(private readonly asyncStageService: AsyncStageService) {}

  @Post('send')
  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiOperation({ summary: 'Send an async stage invitation to a candidate - HR role required' })
  @ApiResponse({ status: 201, type: AsyncStageTokenResponseDto })
  async sendInvitation(@Body() dto: SendAsyncInvitationDto, @CurrentUser() user: User): Promise<AsyncStageTokenResponseDto> {
    return this.asyncStageService.sendInvitation(dto, user.id);
  }

  @Get('stage/:stageUid/process/:processUid')
  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiOperation({ summary: 'Get async stage status (token + submission) for a given stage and hiring process' })
  @ApiResponse({ status: 200, type: AsyncStageStatusResponseDto })
  @ApiParam({ name: 'stageUid', description: 'Stage UID' })
  @ApiParam({ name: 'processUid', description: 'Hiring Process UID' })
  async getStageStatus(@Param('stageUid') stageUid: string, @Param('processUid') processUid: string): Promise<AsyncStageStatusResponseDto> {
    return this.asyncStageService.getStageStatus(stageUid, processUid);
  }

  @Get('submission/:submissionUid')
  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiOperation({ summary: 'Get a specific async stage submission by UID' })
  @ApiResponse({ status: 200, type: AsyncStageSubmissionResponseDto })
  @ApiParam({ name: 'submissionUid', description: 'Submission UID' })
  async getSubmission(@Param('submissionUid') submissionUid: string): Promise<AsyncStageSubmissionResponseDto> {
    return this.asyncStageService.getSubmission(submissionUid);
  }

  @Patch('submission/:submissionUid/review')
  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiOperation({ summary: 'Mark a submission as reviewed and add an optional HR note' })
  @ApiResponse({ status: 200, type: AsyncStageSubmissionResponseDto })
  @ApiParam({ name: 'submissionUid', description: 'Submission UID' })
  async reviewSubmission(@Param('submissionUid') submissionUid: string, @Body() dto: ReviewSubmissionDto, @CurrentUser() user: User): Promise<AsyncStageSubmissionResponseDto> {
    return this.asyncStageService.reviewSubmission(submissionUid, dto, user.id);
  }

  @Delete('token/:tokenUid')
  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an async stage token by UID' })
  @ApiResponse({ status: 200, schema: { properties: { message: { type: 'string' } } } })
  @ApiParam({ name: 'tokenUid', description: 'Token UID' })
  async revokeToken(@Param('tokenUid') tokenUid: string): Promise<{ message: string }> {
    return this.asyncStageService.revokeToken(tokenUid);
  }
}

// ─── Public Routes ────────────────────────────────────────────────────────────

@ApiTags('Async Stage (Public)')
@Controller('public/async-stage')
export class PublicAsyncStageController {
  constructor(private readonly asyncStageService: AsyncStageService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Validate an async stage token and get stage info (public)' })
  @ApiResponse({ status: 200, type: PublicAsyncStageInfoDto })
  @ApiResponse({ status: 401, description: 'Token invalid or revoked' })
  @ApiResponse({ status: 410, description: 'Token has expired' })
  @ApiParam({ name: 'token', description: 'Submission token' })
  async validateToken(@Param('token') token: string): Promise<PublicAsyncStageInfoDto> {
    return this.asyncStageService.validateToken(token);
  }

  @Post(':token/submit')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 104_857_600 } }))
  @ApiOperation({ summary: 'Submit async stage content using a public token (public)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        textContent: { type: 'string', description: 'Text response from candidate' },
        files: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Up to 10 files, max 100MB each' },
      },
    },
  })
  @ApiResponse({ status: 201, schema: { properties: { message: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Token invalid or revoked' })
  @ApiResponse({ status: 409, description: 'Already submitted' })
  @ApiResponse({ status: 410, description: 'Token has expired' })
  async submitStage(
    @Param('token') token: string,
    @Body('textContent') textContent: string | undefined,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ message: string }> {
    return this.asyncStageService.submitStage(token, textContent, files ?? []);
  }

  @Get(':token/files/:fileUid/download')
  @ApiOperation({ summary: 'Get a signed download URL for a submission file (public)' })
  @ApiResponse({ status: 200, schema: { properties: { url: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Token invalid or revoked' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'token', description: 'Submission token' })
  @ApiParam({ name: 'fileUid', description: 'File UID' })
  async getPublicFileDownload(@Param('token') token: string, @Param('fileUid') fileUid: string): Promise<{ url: string }> {
    const url = await this.asyncStageService.getPublicFileDownload(token, fileUid);
    return { url };
  }
}
