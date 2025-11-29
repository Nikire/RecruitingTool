import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ScoreCandidateDto {
  @ApiProperty({
    description: 'UID of the candidate to score',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  candidateUid: string;

  @ApiProperty({
    description: 'UID of the job position to score against',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  jobPositionUid: string;
}

export class ScoreAnalysisDto {
  @ApiPropertyOptional({
    description: 'Detailed analysis of skills match',
    example: 'The candidate has strong proficiency in TypeScript and React...',
  })
  skillsAnalysis?: string;

  @ApiPropertyOptional({
    description: 'Detailed analysis of experience match',
    example: '5+ years of relevant experience in full-stack development...',
  })
  experienceAnalysis?: string;

  @ApiPropertyOptional({
    description: 'Detailed analysis of education match',
    example: "Bachelor's degree in Computer Science from a reputable institution...",
  })
  educationAnalysis?: string;

  @ApiPropertyOptional({
    description: 'Overall recommendation and summary',
    example: 'Strong candidate with excellent technical skills and relevant experience...',
  })
  recommendation?: string;

  @ApiPropertyOptional({
    description: 'List of strengths identified',
    example: ['Strong technical skills', 'Leadership experience', 'Cultural fit'],
  })
  strengths?: string[];

  @ApiPropertyOptional({
    description: 'List of potential concerns or gaps',
    example: ['Limited experience with AWS', 'No formal DevOps training'],
  })
  concerns?: string[];
}

export class CandidateScoreResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the score record',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  uid: string;

  @ApiProperty({
    description: 'UID of the candidate',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  candidateUid: string;

  @ApiProperty({
    description: 'UID of the job position',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  jobPositionUid: string;

  @ApiProperty({
    description: 'Overall match score (0-100)',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  overallScore: number;

  @ApiProperty({
    description: 'Skills match score (0-100)',
    example: 90.0,
    minimum: 0,
    maximum: 100,
  })
  skillsScore: number;

  @ApiProperty({
    description: 'Experience match score (0-100)',
    example: 82.5,
    minimum: 0,
    maximum: 100,
  })
  experienceScore: number;

  @ApiProperty({
    description: 'Education match score (0-100)',
    example: 85.0,
    minimum: 0,
    maximum: 100,
  })
  educationScore: number;

  @ApiPropertyOptional({
    description: 'Detailed AI-generated analysis',
    type: ScoreAnalysisDto,
  })
  analysis?: ScoreAnalysisDto;

  @ApiProperty({
    description: 'Timestamp when the candidate was scored',
    example: '2025-11-25T20:00:00.000Z',
  })
  scoredAt: Date;

  @ApiProperty({
    description: 'Timestamp when the record was created',
    example: '2025-11-25T20:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the record was last updated',
    example: '2025-11-25T20:00:00.000Z',
  })
  updatedAt: Date;
}

export class RankedCandidateDto {
  @ApiProperty({
    description: 'Candidate UID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  candidateUid: string;

  @ApiProperty({
    description: 'Candidate name',
    example: 'John Doe',
  })
  candidateName: string;

  @ApiProperty({
    description: 'Candidate email',
    example: 'john.doe@example.com',
  })
  candidateEmail: string;

  @ApiProperty({
    description: 'Overall match score (0-100)',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  overallScore: number;

  @ApiProperty({
    description: 'Skills match score (0-100)',
    example: 90.0,
    minimum: 0,
    maximum: 100,
  })
  skillsScore: number;

  @ApiProperty({
    description: 'Experience match score (0-100)',
    example: 82.5,
    minimum: 0,
    maximum: 100,
  })
  experienceScore: number;

  @ApiProperty({
    description: 'Education match score (0-100)',
    example: 85.0,
    minimum: 0,
    maximum: 100,
  })
  educationScore: number;

  @ApiProperty({
    description: 'Ranking position (1-based)',
    example: 1,
  })
  rank: number;

  @ApiProperty({
    description: 'Score UID for reference',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  scoreUid: string;

  @ApiProperty({
    description: 'Timestamp when the candidate was scored',
    example: '2025-11-25T20:00:00.000Z',
  })
  scoredAt: Date;
}

export class RankedCandidatesResponseDto {
  @ApiProperty({
    description: 'Job position UID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  jobPositionUid: string;

  @ApiProperty({
    description: 'Job position title',
    example: 'Senior Full Stack Developer',
  })
  jobPositionTitle: string;

  @ApiProperty({
    description: 'Total number of scored candidates',
    example: 15,
  })
  totalCandidates: number;

  @ApiProperty({
    description: 'List of candidates ranked by overall score',
    type: [RankedCandidateDto],
  })
  rankedCandidates: RankedCandidateDto[];
}
