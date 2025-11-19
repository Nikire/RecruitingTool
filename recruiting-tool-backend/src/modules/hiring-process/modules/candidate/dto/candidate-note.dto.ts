import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCandidateNoteDto {
  @ApiProperty({ description: 'Content of the note', example: 'Great technical skills demonstrated during interview.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ description: 'UID of the candidate this note belongs to', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsString()
  @IsNotEmpty()
  candidateUid: string;
}

export class UpdateCandidateNoteDto {
  @ApiProperty({ description: 'Content of the note', example: 'Great technical skills demonstrated during interview.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

export class CandidateNoteResponseDto {
  @ApiProperty({ description: 'UUID of the note', example: '123e4567-e89b-12d3-a456-426614174001' })
  uid: string;

  @ApiProperty({ description: 'Content of the note', example: 'Great technical skills demonstrated during interview.' })
  content: string;

  @ApiProperty({ description: 'UUID of the candidate', example: '123e4567-e89b-12d3-a456-426614174001' })
  candidateUid: string;

  @ApiProperty({ description: 'UUID of the author (user who created the note)', example: '123e4567-e89b-12d3-a456-426614174001' })
  authorUid: string;

  @ApiProperty({ description: 'Name of the author', example: 'Alice Johnson' })
  authorName: string;

  @ApiProperty({ description: 'Date when the note was created', example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the note was last updated', example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}
