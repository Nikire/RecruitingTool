import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { FeedbackCategory } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Feedback content',
    example: 'I would love to see a feature for bulk candidate import from LinkedIn.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    enum: FeedbackCategory,
    description: 'Category of the feedback',
    example: FeedbackCategory.FEATURE_REQUEST,
  })
  @IsEnum(FeedbackCategory)
  @IsNotEmpty()
  category: FeedbackCategory;

  @ApiProperty({
    description: 'Optional rating from 1 to 5',
    example: 5,
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
