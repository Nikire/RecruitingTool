import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsArray,
  IsEnum,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { CandidateScoreResponseDto } from './candidate-scoring.dto';

export enum BatchPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export enum BatchStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class BatchScoreRequestDto {
  @ApiProperty({
    description: 'UID of the job position to score candidates against',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  jobPositionUid: string;

  @ApiPropertyOptional({
    description:
      'Optional array of candidate UIDs to score. If not provided, all candidates for this job position will be scored.',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  candidateUids?: string[];

  @ApiPropertyOptional({
    description: 'Priority level for batch processing',
    example: 'normal',
    enum: BatchPriority,
    default: BatchPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(BatchPriority)
  priority?: BatchPriority;
}

export class BatchScoreStatusDto {
  @ApiProperty({
    description: 'Unique identifier for the batch job',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  batchId: string;

  @ApiProperty({
    description: 'Current status of the batch job',
    example: 'PROCESSING',
    enum: BatchStatusEnum,
  })
  status: BatchStatusEnum;

  @ApiProperty({
    description: 'Total number of candidates in the batch',
    example: 10,
  })
  totalCandidates: number;

  @ApiProperty({
    description: 'Number of candidates successfully processed',
    example: 7,
  })
  processedCandidates: number;

  @ApiProperty({
    description: 'Number of candidates that failed to process',
    example: 1,
  })
  failedCandidates: number;

  @ApiPropertyOptional({
    description: 'Timestamp when the batch job started processing',
    example: '2025-11-25T20:00:00.000Z',
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the batch job completed',
    example: '2025-11-25T20:15:00.000Z',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Array of error messages for failed candidates',
    example: ['Candidate UID abc123 not found', 'OpenAI API rate limit exceeded'],
    type: [String],
  })
  errors?: string[];

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 70,
  })
  progress: number;
}

export class BatchScoreSummaryDto {
  @ApiProperty({
    description: 'Total number of candidates scored',
    example: 10,
  })
  totalScored: number;

  @ApiProperty({
    description: 'Average overall score across all candidates',
    example: 78.5,
  })
  averageScore: number;

  @ApiProperty({
    description: 'Highest score achieved',
    example: 95.0,
  })
  highestScore: number;

  @ApiProperty({
    description: 'Lowest score achieved',
    example: 45.0,
  })
  lowestScore: number;

  @ApiProperty({
    description: 'Average skills score',
    example: 82.0,
  })
  averageSkillsScore: number;

  @ApiProperty({
    description: 'Average experience score',
    example: 75.5,
  })
  averageExperienceScore: number;

  @ApiProperty({
    description: 'Average education score',
    example: 78.0,
  })
  averageEducationScore: number;
}

export class BatchScoreResultDto {
  @ApiProperty({
    description: 'Unique identifier for the batch job',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  batchId: string;

  @ApiProperty({
    description: 'UID of the job position',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  jobPositionUid: string;

  @ApiProperty({
    description: 'Status of the batch job',
    example: 'COMPLETED',
    enum: BatchStatusEnum,
  })
  status: BatchStatusEnum;

  @ApiProperty({
    description: 'Array of candidate score results',
    type: [CandidateScoreResponseDto],
  })
  results: CandidateScoreResponseDto[];

  @ApiProperty({
    description: 'Summary statistics for the batch scoring',
    type: BatchScoreSummaryDto,
  })
  summary: BatchScoreSummaryDto;

  @ApiPropertyOptional({
    description: 'Timestamp when the batch job started',
    example: '2025-11-25T20:00:00.000Z',
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the batch job completed',
    example: '2025-11-25T20:15:00.000Z',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Array of error messages for failed candidates',
    example: ['Candidate UID abc123 not found'],
    type: [String],
  })
  errors?: string[];
}

export class BatchScoreResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the batch job',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  batchId: string;

  @ApiProperty({
    description: 'Initial status of the batch job',
    example: 'PENDING',
    enum: BatchStatusEnum,
  })
  status: BatchStatusEnum;

  @ApiProperty({
    description: 'Total number of candidates to be scored',
    example: 10,
  })
  totalCandidates: number;

  @ApiProperty({
    description: 'Message indicating batch job creation',
    example: 'Batch scoring job created successfully and queued for processing',
  })
  message: string;
}
