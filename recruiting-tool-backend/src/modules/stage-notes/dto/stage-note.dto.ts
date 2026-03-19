import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertStageNoteDto {
  @ApiProperty({
    description: 'Content of the stage note',
    example: 'Candidate demonstrated strong problem-solving skills and clear communication.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Note content must be at least 10 characters' })
  @MaxLength(2000, { message: 'Note content must be less than 2000 characters' })
  content: string;

  @ApiProperty({
    description: 'Rating for this stage (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;
}

export class StageNoteResponseDto {
  @ApiProperty({
    description: 'UUID of the note',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  uid: string;

  @ApiProperty({
    description: 'Content of the note',
    example: 'Candidate demonstrated strong problem-solving skills and clear communication.',
  })
  content: string;

  @ApiProperty({
    description: 'Rating for this stage (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'UUID of the stage',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  stageUid: string;

  @ApiProperty({
    description: 'UUID of the hiring process',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  hiringProcessUid: string;

  @ApiProperty({
    description: 'Author information',
    example: {
      uid: '123e4567-e89b-12d3-a456-426614174004',
      name: 'Alice Johnson',
      email: 'alice@example.com',
    },
  })
  author: {
    uid: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    description: 'Date when the note was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the note was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class CandidateStageNotesResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  uid: string;

  @ApiProperty({ example: 'Candidate demonstrated strong problem-solving skills.' })
  content: string;

  @ApiProperty({ example: 4 })
  rating: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  stageUid: string;

  @ApiProperty({ example: 'Technical Interview' })
  stageTitle: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  hiringProcessUid: string;

  @ApiProperty({ example: 'Senior Frontend Developer' })
  hiringProcessTitle: string;

  @ApiProperty({
    example: { uid: '123e4567-e89b-12d3-a456-426614174004', name: 'Alice Johnson', email: 'alice@example.com' },
  })
  author: {
    uid: string;
    name: string;
    email: string;
  };

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @Type(() => Date)
  updatedAt: Date;
}
