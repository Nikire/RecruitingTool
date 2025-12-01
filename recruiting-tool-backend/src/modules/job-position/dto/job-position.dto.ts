import { ApiProperty } from '@nestjs/swagger';
import { JobPositionStatus } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsArray, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { HiringProcessResponseDto } from 'src/modules/hiring-process/dto/hiring-process.dto';
import { CreateStageDto, StageResponseDto } from 'src/modules/hiring-process/modules/stages/dto/stages.dto';

export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOX = 'CHECKBOX',
}

export class CustomQuestionDto {
  @ApiProperty({ description: 'Unique question ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Question type', enum: QuestionType, example: 'TEXT' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ description: 'Question text', example: 'Years of experience with React?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @ApiProperty({ description: 'Whether question is required', example: true })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ description: 'Options for multiple choice or checkbox questions', example: ['Option 1', 'Option 2'], required: false })
  @IsOptional()
  @IsArray()
  options?: string[];
}

export class JobPositionResponseDto {
  @ApiProperty({ description: 'The title of the Job position', example: 'Software Engineer Interview' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'The UID of the job position', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The status of the job position', example: 'OPEN', enum: JobPositionStatus })
  status: JobPositionStatus;

  @ApiProperty({ description: 'The description of the job position', example: 'Looking for a talented software engineer', required: false })
  description?: string;

  @ApiProperty({ description: 'Custom screening questions for this job position', type: [CustomQuestionDto], required: false })
  @IsOptional()
  customQuestions?: CustomQuestionDto[];

  @ApiProperty({ description: 'The company UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  companyUid: string;

  @ApiProperty({ description: 'The company name', example: 'Tech Corp' })
  companyName?: string;

  @ApiProperty({ description: 'When the job position was posted/created', example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'The user who created this job position', required: false })
  createdBy?: {
    uid: string;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'The stages of the job position' })
  stages?: Array<StageResponseDto>;

  @ApiProperty({ description: 'The hiring processes of the job position' })
  hiringProcesses?: Array<HiringProcessResponseDto>;
}

export class CreateJobPositionDto {
  @ApiProperty({ description: 'The title of the Job position', example: 'Software Engineer Interview' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'The description of the job position', example: 'Looking for a talented software engineer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Custom screening questions for the job position', type: [CustomQuestionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomQuestionDto)
  customQuestions?: CustomQuestionDto[];

  @ApiProperty({ description: 'The stages of the job position', type: [CreateStageDto] })
  stages?: Array<CreateStageDto>;
}

export class UpdateJobPositionDto {
  @ApiProperty({ description: 'The title of the Job position', example: 'Software Engineer Interview', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: 'The description of the job position', example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Custom screening questions for the job position', type: [CustomQuestionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomQuestionDto)
  customQuestions?: CustomQuestionDto[];
}

export class PublicJobPositionResponseDto {
  @ApiProperty({ description: 'The UID of the job position', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The title of the Job position', example: 'Senior Software Engineer' })
  title: string;

  @ApiProperty({ description: 'The description of the job position', example: 'Looking for a talented software engineer', required: false })
  description?: string;

  @ApiProperty({ description: 'The status of the job position', example: 'OPEN', enum: JobPositionStatus })
  status: JobPositionStatus;

  @ApiProperty({ description: 'The company name', example: 'Tech Corp' })
  companyName: string;

  @ApiProperty({ description: 'The company description', example: 'A leading tech company', required: false })
  companyDescription?: string;

  @ApiProperty({ description: 'When the job position was created', example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Custom screening questions for this job position', type: [CustomQuestionDto], required: false })
  @IsOptional()
  customQuestions?: CustomQuestionDto[];

  @ApiProperty({ description: 'The stages of the job position', type: [StageResponseDto], required: false })
  stages?: StageResponseDto[];
}
