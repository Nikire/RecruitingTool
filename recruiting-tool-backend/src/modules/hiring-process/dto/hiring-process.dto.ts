import { ApiProperty } from '@nestjs/swagger';
import { HiringProcessStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { StageResponseDto } from '../modules/stages/dto/stages.dto';

export class CreateHiringProcessDto {
  @ApiProperty({ description: 'The UID of the candidate', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  candidateUid: string;

  @ApiProperty({ description: 'The UID of the job position related', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  jobPositionUid: string;
}

export class UpdateHiringProcessDto {
  @ApiProperty({ description: 'The title of the hiring process', example: 'Senior Software Engineer Postulation' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: 'The status of the hiring process', example: 'IN_PROGRESS', enum: HiringProcessStatus })
  @IsOptional()
  @IsEnum(HiringProcessStatus)
  status?: HiringProcessStatus;
}

export class HiringProcessResponseDto {
  @ApiProperty({ description: 'The UID of the hiring process', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The title of the hiring process', example: 'Software Engineer Interview' })
  title: string;

  @ApiProperty({ description: 'The status of the hiring process', example: 'IN_PROGRESS', enum: HiringProcessStatus })
  status: HiringProcessStatus;

  @ApiProperty({ description: 'The UID of the related job position', example: '123e4567-e89b-12d3-a456-426614174000' })
  jobPositionUid: string;

  @ApiProperty({ description: 'The title of the related job position', example: 'Software Engineer', required: false })
  jobPositionTitle?: string;

  @ApiProperty({ description: 'The UID of the candidate', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  candidateUid?: string;

  @ApiProperty({ description: 'The name of the candidate', example: 'John Doe', required: false })
  candidateName?: string;

  @ApiProperty({ description: 'The UID of the company', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  companyUid?: string;

  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp', required: false })
  companyName?: string;

  @ApiProperty({ description: 'When the hiring process was created', required: false })
  createdAt?: Date;

  @ApiProperty({ description: 'When the hiring process was last updated', required: false })
  updatedAt?: Date;

  @ApiProperty({ description: 'The stages of the hiring process' })
  stages?: Array<StageResponseDto>;
}

export class HiringProcessFindDto {
  @ApiProperty({ description: 'The UID of the candidate related on the hiring process', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsString()
  candidateUid?: string;
}
