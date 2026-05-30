import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApplicationSource } from '@prisma/client';

export class CreatePublicCandidateDto {
  @ApiProperty({ description: 'Candidate full name', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Candidate email address', example: 'jane.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Application source channel', enum: ApplicationSource, example: ApplicationSource.MANUAL })
  @IsEnum(ApplicationSource)
  @IsOptional()
  source?: ApplicationSource;

  @ApiPropertyOptional({ description: 'Additional source details', example: 'LinkedIn campaign Q1' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  sourceDetails?: string;

  @ApiPropertyOptional({ description: 'Source URL', example: 'https://linkedin.com/in/janedoe' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  sourceUrl?: string;
}
