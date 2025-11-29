import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStageNoteDto {
  @ApiProperty({
    description: 'Content of the note',
    example: 'Candidate showed excellent technical skills during the interview.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Note content must be at least 10 characters' })
  @MaxLength(2000, { message: 'Note content must be less than 2000 characters' })
  content: string;
}

export class UpdateStageNoteDto {
  @ApiProperty({
    description: 'Content of the note',
    example: 'Candidate showed excellent technical skills during the interview.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Note content must be at least 10 characters' })
  @MaxLength(2000, { message: 'Note content must be less than 2000 characters' })
  content: string;
}

export class StageNoteResponseDto {
  @ApiProperty({
    description: 'UUID of the note',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  uid: string;

  @ApiProperty({
    description: 'Content of the note',
    example: 'Candidate showed excellent technical skills during the interview.',
  })
  content: string;

  @ApiProperty({
    description: 'UUID of the stage',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  stageUid: string;

  @ApiProperty({
    description: 'Author information',
    example: {
      uid: '123e4567-e89b-12d3-a456-426614174003',
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
