import { ApiProperty } from '@nestjs/swagger';

export class StageTimeLogResponseDto {
  @ApiProperty({ description: 'The UID of the time log', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The UID of the stage', example: '123e4567-e89b-12d3-a456-426614174001' })
  stageUid: string;

  @ApiProperty({ description: 'The UID of the candidate', example: '123e4567-e89b-12d3-a456-426614174002' })
  candidateUid: string;

  @ApiProperty({ description: 'When the candidate entered this stage' })
  enteredAt: Date;

  @ApiProperty({ description: 'When the candidate exited this stage (null if still in stage)', required: false })
  exitedAt?: Date | null;

  @ApiProperty({ description: 'Duration in minutes (calculated on exit)', required: false })
  duration?: number | null;
}

export class StageMetricsResponseDto {
  @ApiProperty({ description: 'The UID of the stage', example: '123e4567-e89b-12d3-a456-426614174000' })
  stageUid: string;

  @ApiProperty({ description: 'The title of the stage', example: 'Technical Interview' })
  stageTitle: string;

  @ApiProperty({ description: 'Total number of candidates who have completed this stage' })
  totalCandidates: number;

  @ApiProperty({ description: 'Average time spent in this stage (minutes)', required: false })
  averageTimeMinutes?: number | null;

  @ApiProperty({ description: 'Minimum time spent in this stage (minutes)', required: false })
  minTimeMinutes?: number | null;

  @ApiProperty({ description: 'Maximum time spent in this stage (minutes)', required: false })
  maxTimeMinutes?: number | null;

  @ApiProperty({ description: 'Number of candidates currently in this stage' })
  candidatesInStage: number;
}

export class CandidateJourneyStepDto {
  @ApiProperty({ description: 'The UID of the stage', example: '123e4567-e89b-12d3-a456-426614174000' })
  stageUid: string;

  @ApiProperty({ description: 'The title of the stage', example: 'Technical Interview' })
  stageTitle: string;

  @ApiProperty({ description: 'The position of the stage in sequence', example: 0 })
  stagePosition: number;

  @ApiProperty({ description: 'When the candidate entered this stage' })
  enteredAt: Date;

  @ApiProperty({ description: 'When the candidate exited this stage (null if still in stage)', required: false })
  exitedAt?: Date | null;

  @ApiProperty({ description: 'Duration in minutes (calculated on exit)', required: false })
  durationMinutes?: number | null;

  @ApiProperty({ description: 'Whether the candidate is currently in this stage' })
  isCurrent: boolean;
}

export class CandidateJourneyResponseDto {
  @ApiProperty({ description: 'The UID of the candidate', example: '123e4567-e89b-12d3-a456-426614174000' })
  candidateUid: string;

  @ApiProperty({ description: 'The name of the candidate', example: 'John Doe' })
  candidateName: string;

  @ApiProperty({ description: 'The UID of the hiring process', example: '123e4567-e89b-12d3-a456-426614174001' })
  hiringProcessUid: string;

  @ApiProperty({ description: 'The title of the hiring process', example: 'Software Engineer - John Doe' })
  hiringProcessTitle: string;

  @ApiProperty({ description: 'Total time spent across all stages (minutes)', required: false })
  totalTimeMinutes?: number | null;

  @ApiProperty({ description: 'Array of stage journey steps', type: [CandidateJourneyStepDto] })
  stages: CandidateJourneyStepDto[];
}
