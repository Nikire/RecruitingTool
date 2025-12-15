import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CompareCandidatesDto {
  @ApiProperty({
    description: 'Array of candidate UIDs to compare (2-5 candidates)',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
    minItems: 2,
    maxItems: 5,
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 candidates required for comparison' })
  @ArrayMaxSize(5, { message: 'Maximum 5 candidates allowed for comparison' })
  @IsUUID('4', { each: true, message: 'Each candidate UID must be a valid UUID' })
  candidateUids: string[];

  @ApiProperty({
    description: 'UID of the job position to compare candidates against',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsUUID('4', { message: 'Job position UID must be a valid UUID' })
  jobPositionUid: string;
}

export class CandidateComparisonSummary {
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
    description: 'Overall match score (0-100)',
    example: 87.5,
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
    example: 85.0,
    minimum: 0,
    maximum: 100,
  })
  experienceScore: number;

  @ApiProperty({
    description: 'Education match score (0-100)',
    example: 88.0,
    minimum: 0,
    maximum: 100,
  })
  educationScore: number;

  @ApiProperty({
    description: 'List of key strengths identified by AI',
    example: ['Strong technical skills in React and TypeScript', 'Excellent communication abilities', '5+ years of relevant experience'],
  })
  strengths: string[];

  @ApiProperty({
    description: 'List of potential weaknesses or gaps',
    example: ['Limited experience with cloud infrastructure', 'No formal DevOps training'],
  })
  weaknesses: string[];

  @ApiProperty({
    description: 'Ranking position among compared candidates (1-based)',
    example: 1,
  })
  rank: number;
}

export class ComparisonAnalysis {
  @ApiProperty({
    description: 'Overall comparison summary from AI',
    example:
      'Based on the comparison of these 3 candidates, John Doe stands out as the strongest match for the Senior Full Stack Developer position due to superior technical skills and relevant experience.',
  })
  summary: string;

  @ApiProperty({
    description: 'UID of the top-ranked candidate',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  topCandidateUid: string;

  @ApiProperty({
    description: 'Name of the top-ranked candidate',
    example: 'John Doe',
  })
  topCandidateName: string;

  @ApiProperty({
    description: 'Detailed reasoning for top candidate recommendation',
    example:
      'John Doe demonstrates exceptional proficiency in the required tech stack, with proven experience leading similar projects. His background aligns perfectly with the senior-level responsibilities.',
  })
  recommendationReason: string;

  @ApiProperty({
    description: 'Key differentiating factors between candidates',
    example: [
      'Technical skill depth: John Doe has advanced TypeScript expertise while others have intermediate level',
      'Leadership experience: Only John Doe has managed development teams',
      'Education level: Jane Smith has a Master\'s degree, others have Bachelor\'s',
    ],
  })
  keyDifferentiators: string[];

  @ApiProperty({
    description: 'Final hiring recommendation from AI',
    example:
      'Strong recommendation to proceed with John Doe for final interview round. Consider Jane Smith as backup candidate if John Doe declines offer.',
  })
  finalRecommendation: string;
}

export class CompareCandidatesResponseDto {
  @ApiProperty({
    description: 'UID of the job position',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  jobPositionUid: string;

  @ApiProperty({
    description: 'Title of the job position',
    example: 'Senior Full Stack Developer',
  })
  jobPositionTitle: string;

  @ApiProperty({
    description: 'Total number of candidates compared',
    example: 3,
  })
  totalCandidates: number;

  @ApiProperty({
    description: 'Detailed comparison summary for each candidate',
    type: [CandidateComparisonSummary],
  })
  candidates: CandidateComparisonSummary[];

  @ApiProperty({
    description: 'AI-generated comparative analysis',
    type: ComparisonAnalysis,
  })
  comparisonAnalysis: ComparisonAnalysis;

  @ApiProperty({
    description: 'Timestamp when comparison was performed',
    example: '2025-12-15T10:30:00.000Z',
  })
  comparedAt: Date;
}
