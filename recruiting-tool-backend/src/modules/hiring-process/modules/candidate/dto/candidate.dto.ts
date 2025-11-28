import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { HiringProcessResponseDto } from 'src/modules/hiring-process/dto/hiring-process.dto';
import { ApplicationSource } from '@prisma/client';

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

  @ApiProperty({
    description: 'Source of the candidate application',
    enum: ApplicationSource,
    example: 'LINKEDIN',
    required: false,
  })
  @IsEnum(ApplicationSource)
  @IsOptional()
  source?: ApplicationSource;

  @ApiProperty({
    description: 'Additional details about the source (e.g., referrer name)',
    example: 'Referred by Jane Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  sourceDetails?: string;

  @ApiProperty({
    description: 'URL of the source if from online platform',
    example: 'https://www.linkedin.com/jobs/view/123456',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  sourceUrl?: string;
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

  @ApiProperty({
    description: 'Source of the candidate application',
    enum: ApplicationSource,
    example: 'LINKEDIN',
    required: false,
  })
  @IsEnum(ApplicationSource)
  @IsOptional()
  source?: ApplicationSource;

  @ApiProperty({
    description: 'Additional details about the source (e.g., referrer name)',
    example: 'Referred by Jane Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  sourceDetails?: string;

  @ApiProperty({
    description: 'URL of the source if from online platform',
    example: 'https://www.linkedin.com/jobs/view/123456',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  sourceUrl?: string;
}

export class CreateManualCandidateDto {
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

  @ApiProperty({
    description: 'Phone number of the candidate (optional)',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'UID of the job position to link this candidate to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  jobPositionUid: string;

  @ApiProperty({
    description: 'Additional details about the source (e.g., "Phone call", "Referral from Jane Smith")',
    example: 'Referral from Jane Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  sourceDetails?: string;
}

export class CandidateResponseDto {
  @ApiProperty({ description: 'Name of the Candidate', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'UUID of the candidate', example: '123e4567-e89b-12d3-a456-426614174001' })
  uid: string;

  @ApiProperty({ description: 'Email of the candidate', example: 'JohnDoe@example.com' })
  email: string;

  @ApiProperty({
    description: 'Source of the candidate application',
    enum: ApplicationSource,
    example: 'LINKEDIN',
    required: false,
  })
  source?: ApplicationSource;

  @ApiProperty({
    description: 'Additional details about the source',
    example: 'Referred by Jane Smith',
    required: false,
  })
  sourceDetails?: string;

  @ApiProperty({
    description: 'URL of the source if from online platform',
    example: 'https://www.linkedin.com/jobs/view/123456',
    required: false,
  })
  sourceUrl?: string;

  @ApiProperty({ description: 'Hiring process related to this Candidate' })
  hiringProcess?: HiringProcessResponseDto;
}
