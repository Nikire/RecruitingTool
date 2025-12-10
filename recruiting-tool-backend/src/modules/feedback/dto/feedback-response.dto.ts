import { ApiProperty } from '@nestjs/swagger';
import { FeedbackCategory } from '@prisma/client';

export class FeedbackResponseDto {
  @ApiProperty({
    description: 'Feedback UID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uid: string;

  @ApiProperty({
    description: 'Feedback content',
    example: 'I would love to see a feature for bulk candidate import from LinkedIn.',
  })
  content: string;

  @ApiProperty({
    enum: FeedbackCategory,
    description: 'Category of the feedback',
    example: FeedbackCategory.FEATURE_REQUEST,
  })
  category: FeedbackCategory;

  @ApiProperty({
    description: 'Optional rating from 1 to 5',
    example: 5,
    required: false,
  })
  rating?: number;

  @ApiProperty({
    description: 'UID of the user who submitted the feedback',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userUid: string;

  @ApiProperty({
    description: 'Name of the user who submitted the feedback',
    example: 'Alice Johnson',
  })
  userName: string;

  @ApiProperty({
    description: 'UID of the company',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  companyUid: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Innovations Inc',
  })
  companyName: string;

  @ApiProperty({
    description: 'Timestamp when the feedback was submitted',
    example: '2025-12-10T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the feedback was last updated',
    example: '2025-12-10T10:30:00Z',
  })
  updatedAt: Date;
}
