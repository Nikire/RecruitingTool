import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationSource } from '@prisma/client';

export class PublicCandidateResponseDto {
  @ApiProperty({ description: 'Unique identifier (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  uid: string;

  @ApiProperty({ description: 'Candidate full name', example: 'Jane Doe' })
  name: string;

  @ApiProperty({ description: 'Candidate email address', example: 'jane.doe@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'Application source channel', enum: ApplicationSource, example: ApplicationSource.MANUAL })
  source: ApplicationSource | null;

  @ApiPropertyOptional({ description: 'Additional source details', example: 'LinkedIn campaign Q1' })
  sourceDetails: string | null;

  @ApiPropertyOptional({ description: 'Source URL', example: 'https://linkedin.com/in/janedoe' })
  sourceUrl: string | null;

  @ApiProperty({ description: 'Timestamp when the candidate was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the candidate was last updated' })
  updatedAt: Date;
}
