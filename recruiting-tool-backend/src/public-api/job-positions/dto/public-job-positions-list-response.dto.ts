import { ApiProperty } from '@nestjs/swagger';
import { PublicApiJobPositionResponseDto } from './public-job-position-response.dto';

export class PublicJobPositionsListResponseDto {
  @ApiProperty({
    description: 'Array of job positions for the current page',
    type: [PublicApiJobPositionResponseDto],
  })
  data: PublicApiJobPositionResponseDto[];

  @ApiProperty({
    description: 'Total number of job positions matching the query',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number (1-indexed)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Maximum number of items returned per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there are more pages after the current page',
    example: true,
  })
  hasMore: boolean;
}
