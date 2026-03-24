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

export class HiringProcessGroupedFilterDto {
  @ApiProperty({ description: 'Filter by status', enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED', 'REJECTED'], required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Page number (1-indexed), paginates job position groups', example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Number of job position groups per page', example: 10, required: false })
  @IsOptional()
  limit?: number;
}

export class HiringProcessGroupedResponseDto {
  @ApiProperty({ description: 'Job position UID (null for processes without a position)', nullable: true })
  jobPositionUid: string | null;

  @ApiProperty({ description: 'Job position title' })
  jobPositionTitle: string;

  @ApiProperty({ description: 'All hiring processes for this job position', type: [HiringProcessResponseDto] })
  processes: HiringProcessResponseDto[];
}

export class PaginatedHiringProcessGroupsResponseDto {
  @ApiProperty({ type: [HiringProcessGroupedResponseDto] })
  data: HiringProcessGroupedResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class GenerateAccessCodeDto {
  @ApiProperty({ description: 'The UID of the hiring process', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  hiringProcessUid: string;
}

export class AccessCodeResponseDto {
  @ApiProperty({ description: 'The generated access code', example: 'A1B2C3D4' })
  accessCode: string;

  @ApiProperty({ description: 'When the access code expires' })
  expiresAt: Date;
}

export class PublicStatusResponseDto {
  @ApiProperty({ description: 'The first name of the candidate for privacy', example: 'John' })
  candidateName: string;

  @ApiProperty({ description: 'The title of the job position', example: 'Senior Software Engineer' })
  positionTitle: string;

  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  companyName: string;

  @ApiProperty({ description: 'The current stage title', example: 'Technical Interview', required: false })
  currentStage?: string;

  @ApiProperty({ description: 'The status of the hiring process', example: 'IN_PROGRESS', enum: HiringProcessStatus })
  status: HiringProcessStatus;

  @ApiProperty({ description: 'When the hiring process was last updated' })
  lastUpdated: Date;
}

export class PublicStageDto {
  @ApiProperty({ description: 'The UID of the stage' })
  uid: string;

  @ApiProperty({ description: 'The title of the stage', example: 'Technical Interview' })
  title: string;

  @ApiProperty({ description: 'The type of the stage', example: 'INTERVIEW' })
  type: string;

  @ApiProperty({ description: 'The position in the sequence', example: 0 })
  position: number;

  @ApiProperty({ description: 'Stage status from candidate perspective: COMPLETED | CURRENT | PENDING', example: 'CURRENT' })
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
}

export class PublicHiringProcessTrackingDto {
  @ApiProperty({ description: 'The UID of the hiring process' })
  uid: string;

  @ApiProperty({ description: 'The full name of the candidate', example: 'Jane Smith' })
  candidateName: string;

  @ApiProperty({ description: 'The title of the job position', example: 'Senior Software Engineer' })
  positionTitle: string;

  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  companyName: string;

  @ApiProperty({ description: 'The overall status of the hiring process', enum: HiringProcessStatus })
  status: HiringProcessStatus;

  @ApiProperty({ description: 'Ordered list of recruitment stages', type: [PublicStageDto] })
  stages: PublicStageDto[];

  @ApiProperty({ description: 'When the hiring process was last updated' })
  lastUpdated: Date;
}
