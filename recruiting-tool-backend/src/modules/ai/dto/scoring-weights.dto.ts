import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateScoringWeightsDto {
  @ApiProperty({ description: 'Skills weight percentage (0-100)', minimum: 0, maximum: 100, example: 40 })
  @IsInt()
  @Min(0)
  @Max(100)
  skillsWeight: number;

  @ApiProperty({ description: 'Experience weight percentage (0-100)', minimum: 0, maximum: 100, example: 35 })
  @IsInt()
  @Min(0)
  @Max(100)
  experienceWeight: number;

  @ApiProperty({ description: 'Education weight percentage (0-100)', minimum: 0, maximum: 100, example: 25 })
  @IsInt()
  @Min(0)
  @Max(100)
  educationWeight: number;
}

export class ScoringWeightsResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  uid: string;

  @ApiProperty({ description: 'Skills weight percentage' })
  skillsWeight: number;

  @ApiProperty({ description: 'Experience weight percentage' })
  experienceWeight: number;

  @ApiProperty({ description: 'Education weight percentage' })
  educationWeight: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;
}
