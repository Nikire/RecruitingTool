import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { HiringProcessResponseDto } from 'src/modules/hiring-process/dto/hiring-process.dto';

export class CreateCandidateDto {
  @ApiProperty({ description: 'Name of the Candidate', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Email of the candidate', example: 'JohnDoe@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UpdateCandidateDto {
  @ApiProperty({ description: 'Name of the Candidate', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Email of the candidate', example: 'JohnDoe@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class CandidateResponseDto {
  @ApiProperty({ description: 'Name of the Candidate', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'UUID of the candidate', example: '123e4567-e89b-12d3-a456-426614174001' })
  uid: string;

  @ApiProperty({ description: 'Email of the candidate', example: 'JohnDoe@example.com' })
  email: string;

  @ApiProperty({ description: 'Hiring process related to this Candidate' })
  hiringProcess?: HiringProcessResponseDto;
}
