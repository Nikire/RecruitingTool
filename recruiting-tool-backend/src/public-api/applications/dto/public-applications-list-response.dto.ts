import { ApiProperty } from '@nestjs/swagger';
import { PublicApplicationResponseDto } from './public-application-response.dto';

export class PublicApplicationsListResponseDto {
  @ApiProperty({ type: [PublicApplicationResponseDto], description: 'Array of applications' })
  data: PublicApplicationResponseDto[];

  @ApiProperty({ description: 'Total number of applications matching the query', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Whether there are more pages available', example: true })
  hasMore: boolean;
}
