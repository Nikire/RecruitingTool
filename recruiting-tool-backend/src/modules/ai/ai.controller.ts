import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ScoringService } from './scoring.service';
import { BatchScoringService } from './batch-scoring.service';
import {
  ParseResumeRequestDto,
  ParseResumeResponseDto,
} from './dto/parse-resume.dto';
import {
  ScoreCandidateDto,
  CandidateScoreResponseDto,
  RankedCandidatesResponseDto,
} from './dto/candidate-scoring.dto';
import {
  BatchScoreRequestDto,
  BatchScoreResponseDto,
  BatchScoreStatusDto,
  BatchScoreResultDto,
} from './dto/batch-scoring.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';

@ApiTags('AI')
@Controller('ai')
@ApiBearerAuth()
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly scoringService: ScoringService,
    private readonly batchScoringService: BatchScoringService,
  ) {}

  @Post('parse-resume')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parse resume using AI',
    description:
      'Upload a resume file URL and extract structured data using OpenAI. Supports PDF, DOCX, and TXT formats.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resume parsed successfully',
    type: ParseResumeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file URL or unsupported file format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - OpenAI API error or configuration issue',
  })
  async parseResume(
    @Body() parseResumeDto: ParseResumeRequestDto,
  ): Promise<ParseResumeResponseDto> {
    return this.aiService.parseResume(parseResumeDto.fileUrl);
  }

  @Post('score-candidate')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Score a candidate for a job position using AI',
    description:
      'Analyze a candidate against job requirements and generate scores for skills, experience, and education match. Includes detailed AI analysis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Candidate scored successfully',
    type: CandidateScoreResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid candidate or job position UID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Candidate or job position not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - OpenAI API error or configuration issue',
  })
  async scoreCandidate(
    @Body() scoreCandidateDto: ScoreCandidateDto,
  ): Promise<CandidateScoreResponseDto> {
    return this.scoringService.scoreCandidate(
      scoreCandidateDto.candidateUid,
      scoreCandidateDto.jobPositionUid,
    );
  }

  @Get('score/:candidateUid/:jobPositionUid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get existing score and analysis for a candidate',
    description:
      'Retrieve previously calculated score and detailed analysis for a specific candidate and job position combination.',
  })
  @ApiParam({
    name: 'candidateUid',
    description: 'UID of the candidate',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'jobPositionUid',
    description: 'UID of the job position',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Score retrieved successfully',
    type: CandidateScoreResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Score not found for this candidate and job position',
  })
  async getScoreAnalysis(
    @Param('candidateUid') candidateUid: string,
    @Param('jobPositionUid') jobPositionUid: string,
  ): Promise<CandidateScoreResponseDto> {
    return this.scoringService.getScoreAnalysis(candidateUid, jobPositionUid);
  }

  @Get('rankings/:jobPositionUid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get ranked list of candidates for a job position',
    description:
      'Retrieve all scored candidates for a job position, ranked by overall score in descending order.',
  })
  @ApiParam({
    name: 'jobPositionUid',
    description: 'UID of the job position',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranked candidates retrieved successfully',
    type: RankedCandidatesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Job position not found',
  })
  async getRankedCandidates(
    @Param('jobPositionUid') jobPositionUid: string,
  ): Promise<RankedCandidatesResponseDto> {
    return this.scoringService.getRankedCandidates(jobPositionUid);
  }

  @Post('batch-score')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Start batch scoring for multiple candidates',
    description:
      'Create a batch job to score multiple candidates for a job position. If candidateUids are not provided, all candidates for the job position will be scored. The job runs asynchronously in the background.',
  })
  @ApiResponse({
    status: 202,
    description: 'Batch scoring job created and queued successfully',
    type: BatchScoreResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or AI quota exceeded',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Job position not found',
  })
  async startBatchScoring(
    @Body() batchScoreDto: BatchScoreRequestDto,
    @CurrentUser() user: any,
  ): Promise<BatchScoreResponseDto> {
    return this.batchScoringService.startBatchScoring(
      batchScoreDto,
      user.companyId,
      user.id,
    );
  }

  @Get('batch-score/:batchId/status')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get batch scoring job status',
    description:
      'Check the current status and progress of a batch scoring job.',
  })
  @ApiParam({
    name: 'batchId',
    description: 'UID of the batch scoring job',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch job status retrieved successfully',
    type: BatchScoreStatusDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch job not found',
  })
  async getBatchStatus(
    @Param('batchId') batchId: string,
  ): Promise<BatchScoreStatusDto> {
    return this.batchScoringService.getBatchStatus(batchId);
  }

  @Get('batch-score/:batchId/results')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get batch scoring job results',
    description:
      'Retrieve the complete results of a completed batch scoring job, including all candidate scores and summary statistics. Only available once the batch job is completed.',
  })
  @ApiParam({
    name: 'batchId',
    description: 'UID of the batch scoring job',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch job results retrieved successfully',
    type: BatchScoreResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Batch job is still processing',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch job not found',
  })
  async getBatchResults(
    @Param('batchId') batchId: string,
  ): Promise<BatchScoreResultDto> {
    return this.batchScoringService.getBatchResults(batchId);
  }

  @Delete('batch-score/:batchId')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a batch scoring job',
    description:
      'Cancel a pending or processing batch scoring job. Already completed jobs cannot be cancelled.',
  })
  @ApiParam({
    name: 'batchId',
    description: 'UID of the batch scoring job to cancel',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch job cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Batch job cancelled successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Batch job is already completed or cancelled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Batch job not found',
  })
  async cancelBatch(
    @Param('batchId') batchId: string,
  ): Promise<{ message: string }> {
    return this.batchScoringService.cancelBatch(batchId);
  }
}
