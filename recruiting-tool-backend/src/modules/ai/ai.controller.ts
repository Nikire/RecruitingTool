import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
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
import {
  ParseResumeRequestDto,
  ParseResumeResponseDto,
} from './dto/parse-resume.dto';
import {
  ScoreCandidateDto,
  CandidateScoreResponseDto,
  RankedCandidatesResponseDto,
} from './dto/candidate-scoring.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Auth } from '../shared/decorators/auth.decorator';
import { RolesType } from '@prisma/client';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly scoringService: ScoringService,
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
}
