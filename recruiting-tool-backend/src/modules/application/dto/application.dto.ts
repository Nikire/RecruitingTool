import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsEnum, IsUUID, IsObject } from 'class-validator';

export class ApplicationResponseDto {
  @ApiProperty({ description: 'The UID of the application', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'Job position UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  jobPositionUid: string;

  @ApiProperty({ description: 'Job position title', example: 'Senior Software Engineer' })
  jobPositionTitle: string;

  @ApiProperty({ description: 'Company name', example: 'Tech Corp' })
  companyName?: string;

  @ApiProperty({ description: 'Applicant name', example: 'John Doe' })
  applicantName: string;

  @ApiProperty({ description: 'Applicant email', example: 'john.doe@example.com' })
  applicantEmail: string;

  @ApiProperty({ description: 'Applicant phone', example: '+1234567890' })
  applicantPhone: string;

  @ApiProperty({ description: 'Resume file UID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  resumeFileUid?: string;

  @ApiProperty({ description: 'Resume file name', example: 'john_doe_resume.pdf', required: false })
  resumeFileName?: string;

  @ApiProperty({ description: 'Cover letter', example: 'I am very interested in this position...', required: false })
  coverLetter?: string;

  @ApiProperty({ description: 'Answers to custom screening questions', example: { q1: 'answer 1', q2: 'answer 2' }, required: false })
  customAnswers?: Record<string, any>;

  @ApiProperty({ description: 'Application status', example: 'PENDING', enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiProperty({ description: 'Date applied', example: '2025-11-18T22:00:00.000Z' })
  appliedAt: Date;

  @ApiProperty({ description: 'Date reviewed', example: '2025-11-19T10:00:00.000Z', required: false })
  reviewedAt?: Date;

  @ApiProperty({ description: 'Reviewer UID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  reviewedByUid?: string;

  @ApiProperty({ description: 'Reviewer name', example: 'Jane Smith', required: false })
  reviewedByName?: string;

  @ApiProperty({ description: 'Internal notes (HR only)', example: 'Strong candidate, proceed to interview', required: false })
  notes?: string;

  @ApiProperty({ description: 'Created at timestamp', example: '2025-11-18T22:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp', example: '2025-11-18T22:00:00.000Z' })
  updatedAt: Date;
}

export class CreateApplicationDto {
  @ApiProperty({ description: 'Job position UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  jobPositionUid: string;

  @ApiProperty({ description: 'Applicant full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  applicantName: string;

  @ApiProperty({ description: 'Applicant email address', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  applicantEmail: string;

  @ApiProperty({ description: 'Applicant phone number', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  applicantPhone: string;

  @ApiProperty({ description: 'Resume file UID (optional)', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  resumeFileUid?: string;

  @ApiProperty({ description: 'Cover letter text (optional)', example: 'I am very interested in this position...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  coverLetter?: string;

  @ApiProperty({ description: 'Answers to custom screening questions', example: { q1: 'answer 1', q2: ['option 1', 'option 2'] }, required: false })
  @IsOptional()
  @IsObject()
  customAnswers?: Record<string, any>;
}

export class UpdateApplicationDto {
  @ApiProperty({ description: 'Application status', example: 'REVIEWED', enum: ApplicationStatus, required: false })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({ description: 'Internal notes (HR/ADMIN only)', example: 'Strong candidate, moving to next stage', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class ApplicationFilterDto {
  @ApiProperty({ description: 'Filter by job position UID', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  jobPositionUid?: string;

  @ApiProperty({ description: 'Filter by status', enum: ApplicationStatus, required: false })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 10, required: false })
  @IsOptional()
  limit?: number;
}
