import { ApiProperty } from '@nestjs/swagger';
import { CandidateActivityType } from '@prisma/client';

export class CandidateActivityResponseDto {
  @ApiProperty({
    description: 'UUID of the activity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uid: string;

  @ApiProperty({
    description: 'UUID of the candidate',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  candidateUid: string;

  @ApiProperty({
    description: 'Type of activity',
    enum: CandidateActivityType,
    example: 'CREATED',
  })
  type: CandidateActivityType;

  @ApiProperty({
    description: 'Description of the activity',
    example: 'Candidate profile created',
  })
  description: string;

  @ApiProperty({
    description: 'Additional metadata for the activity (JSON)',
    required: false,
    example: { source: 'LINKEDIN', jobPositionUid: '123e4567-e89b-12d3-a456-426614174002' },
  })
  metadata?: any;

  @ApiProperty({
    description: 'UUID of the user who performed the activity (nullable for system events)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  userUid?: string;

  @ApiProperty({
    description: 'Name of the user who performed the activity',
    required: false,
    example: 'John Doe',
  })
  userName?: string;

  @ApiProperty({
    description: 'When the activity occurred',
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date | string;
}
