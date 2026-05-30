import { ApiProperty } from '@nestjs/swagger';
import { PublicCandidateResponseDto } from './public-candidate-response.dto';

export class PublicCandidatesListResponseDto {
  @ApiProperty({ type: [PublicCandidateResponseDto], description: 'Array of candidates' })
  data: PublicCandidateResponseDto[];

  @ApiProperty({ description: 'Total number of candidates matching the query', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Whether there are more pages available', example: true })
  hasMore: boolean;
}
