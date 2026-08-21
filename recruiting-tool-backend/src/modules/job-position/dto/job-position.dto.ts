import { ApiProperty } from '@nestjs/swagger';
import { JobPositionStatus, JobType, WorkLocation, SalaryPeriod, ExperienceLevel, JobModerationStatus } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsArray, ValidateNested, IsEnum, IsBoolean, IsInt, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { HiringProcessResponseDto } from 'src/modules/hiring-process/dto/hiring-process.dto';
import { CreateStageDto, StageResponseDto } from 'src/modules/hiring-process/modules/stages/dto/stages.dto';
import { PaginationDto } from 'src/dto/pagination.dto';

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

  @ApiProperty({ description: 'Job category', example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  jobCategory?: string;

  @ApiProperty({ description: 'Job type', enum: JobType, required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ description: 'Work location', enum: WorkLocation, required: false })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiProperty({ description: 'Minimum salary', example: 50000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary', example: 80000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ description: 'Salary currency', example: 'USD', default: 'USD' })
  @IsString()
  salaryCurrency: string;

  @ApiProperty({ description: 'Salary period', enum: SalaryPeriod, required: false })
  @IsOptional()
  @IsEnum(SalaryPeriod)
  salaryPeriod?: SalaryPeriod;

  @ApiProperty({ description: 'Benefits offered', type: [String], example: ['Health Insurance', '401k'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ description: 'Job requirements', type: [String], example: ['5+ years experience', "Bachelor's degree"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ description: 'Job responsibilities', type: [String], example: ['Lead development team', 'Code reviews'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiProperty({ description: 'Experience level', enum: ExperienceLevel, required: false })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ description: 'Education level', example: "Bachelor's degree", required: false })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiProperty({ description: 'Required skills', type: [String], example: ['React', 'TypeScript', 'Node.js'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Application deadline', example: '2025-12-31T23:59:59Z', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applicationDeadline?: Date;

  @ApiProperty({ description: 'Whether this position is urgent', example: false, default: false })
  @IsBoolean()
  isUrgent: boolean;

  @ApiProperty({ description: 'Whether this position is featured', example: false, default: false })
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty({ description: 'City where the job is located', example: 'San Francisco', required: false })
  city?: string;

  @ApiProperty({ description: 'State/province where the job is located', example: 'California', required: false })
  state?: string;

  @ApiProperty({ description: 'Country where the job is located', example: 'United States', required: false })
  country?: string;

  @ApiProperty({ description: 'Whether to show salary information publicly', example: false, default: false })
  @IsBoolean()
  showSalary: boolean;

  @ApiProperty({ description: 'Tags for categorization and search', type: [String], example: ['frontend', 'react', 'typescript'], required: false })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ description: 'Whether this position is highlighted', example: false, default: false })
  @IsBoolean()
  isHighlighted: boolean;

  @ApiProperty({ description: 'Number of views', example: 0, default: 0 })
  @IsInt()
  viewCount: number;

  @ApiProperty({ description: 'Number of applications', example: 0, default: 0 })
  @IsInt()
  applicationCount: number;

  @ApiProperty({ description: 'The source channel where candidates are expected to come from', example: 'LinkedIn', required: false })
  @IsOptional()
  @IsString()
  candidateSource?: string;

  @ApiProperty({
    description: 'UID of the end client this role is being filled for. Null for direct employers and for postings created before clients existed.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  clientUid?: string | null;

  @ApiProperty({ description: 'Name of the end client this role is being filled for', example: 'Acme Corporation', required: false, nullable: true })
  clientName?: string | null;

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
    email?: string | null;
  };

  @ApiProperty({ description: 'The stages of the job position' })
  stages?: Array<StageResponseDto>;

  @ApiProperty({ description: 'The hiring processes of the job position' })
  hiringProcesses?: Array<HiringProcessResponseDto>;

  @ApiProperty({
    description:
      'Platform moderation state of the posting. Independent from `status`. Only APPROVED postings appear on the public careers board. Companies with an active paid subscription are approved automatically on creation.',
    enum: JobModerationStatus,
    example: JobModerationStatus.APPROVED,
  })
  @IsEnum(JobModerationStatus)
  moderationStatus: JobModerationStatus;

  @ApiProperty({ description: 'Reason supplied by the administrator when the posting was rejected', required: false, nullable: true })
  @IsOptional()
  @IsString()
  moderationReason?: string | null;

  @ApiProperty({ description: 'When the posting was approved or rejected', required: false, nullable: true })
  @IsOptional()
  @IsDate()
  moderatedAt?: Date | null;
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

  @ApiProperty({ description: 'Job category', example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  jobCategory?: string;

  @ApiProperty({ description: 'Job type', enum: JobType, required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ description: 'Work location', enum: WorkLocation, required: false })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiProperty({ description: 'Minimum salary', example: 50000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary', example: 80000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ description: 'Salary currency', example: 'USD', required: false })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiProperty({ description: 'Salary period', enum: SalaryPeriod, required: false })
  @IsOptional()
  @IsEnum(SalaryPeriod)
  salaryPeriod?: SalaryPeriod;

  @ApiProperty({ description: 'Benefits offered', type: [String], example: ['Health Insurance', '401k'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ description: 'Job requirements', type: [String], example: ['5+ years experience', "Bachelor's degree"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ description: 'Job responsibilities', type: [String], example: ['Lead development team', 'Code reviews'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiProperty({ description: 'Experience level', enum: ExperienceLevel, required: false })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ description: 'Education level', example: "Bachelor's degree", required: false })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiProperty({ description: 'Required skills', type: [String], example: ['React', 'TypeScript', 'Node.js'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Application deadline', example: '2025-12-31T23:59:59Z', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applicationDeadline?: Date;

  @ApiProperty({ description: 'Whether this position is urgent', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ description: 'Whether this position is featured', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'City where the job is located', example: 'San Francisco', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State/province where the job is located', example: 'California', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Country where the job is located', example: 'United States', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Whether to show salary information publicly', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  showSalary?: boolean;

  @ApiProperty({ description: 'Tags for categorization and search', type: [String], example: ['frontend', 'react', 'typescript'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Whether this position is highlighted', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isHighlighted?: boolean;

  @ApiProperty({ description: 'The source channel where candidates are expected to come from', example: 'LinkedIn', required: false })
  @IsOptional()
  @IsString()
  candidateSource?: string;

  @ApiProperty({
    description: 'UID of the end client this role is being filled for. Omit for a direct-employer role.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientUid?: string;

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

  @ApiProperty({ description: 'Job category', example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  jobCategory?: string;

  @ApiProperty({ description: 'Job type', enum: JobType, required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ description: 'Work location', enum: WorkLocation, required: false })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiProperty({ description: 'Minimum salary', example: 50000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary', example: 80000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ description: 'Salary currency', example: 'USD', required: false })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiProperty({ description: 'Salary period', enum: SalaryPeriod, required: false })
  @IsOptional()
  @IsEnum(SalaryPeriod)
  salaryPeriod?: SalaryPeriod;

  @ApiProperty({ description: 'Benefits offered', type: [String], example: ['Health Insurance', '401k'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ description: 'Job requirements', type: [String], example: ['5+ years experience', "Bachelor's degree"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ description: 'Job responsibilities', type: [String], example: ['Lead development team', 'Code reviews'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiProperty({ description: 'Experience level', enum: ExperienceLevel, required: false })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ description: 'Education level', example: "Bachelor's degree", required: false })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiProperty({ description: 'Required skills', type: [String], example: ['React', 'TypeScript', 'Node.js'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Application deadline', example: '2025-12-31T23:59:59Z', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applicationDeadline?: Date;

  @ApiProperty({ description: 'Whether this position is urgent', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ description: 'Whether this position is featured', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'City where the job is located', example: 'San Francisco', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State/province where the job is located', example: 'California', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Country where the job is located', example: 'United States', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Whether to show salary information publicly', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  showSalary?: boolean;

  @ApiProperty({ description: 'Tags for categorization and search', type: [String], example: ['frontend', 'react', 'typescript'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Whether this position is highlighted', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isHighlighted?: boolean;

  @ApiProperty({ description: 'The source channel where candidates are expected to come from', example: 'LinkedIn', required: false })
  @IsOptional()
  @IsString()
  candidateSource?: string;

  @ApiProperty({
    description: 'UID of the end client this role is being filled for. Send null to detach the role from its client.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  clientUid?: string | null;
}

/**
 * Query parameters accepted by GET /job-position/list.
 *
 * Extends PaginationDto (page / pageSize / search / sortBy / sortOrder / status) with the
 * agency-facing client filter, which is the whole point of P3-6: "show me every open role
 * for Acme".
 */
export class JobPositionListFiltersDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter to roles being filled for this end client (UID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientUid?: string;
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

  @ApiProperty({ description: 'Job category', example: 'Engineering', required: false })
  jobCategory?: string;

  @ApiProperty({ description: 'Job type', enum: JobType, required: false })
  jobType?: JobType;

  @ApiProperty({ description: 'Work location', enum: WorkLocation, required: false })
  workLocation?: WorkLocation;

  @ApiProperty({ description: 'Minimum salary', example: 50000, required: false })
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary', example: 80000, required: false })
  salaryMax?: number;

  @ApiProperty({ description: 'Salary currency', example: 'USD' })
  salaryCurrency: string;

  @ApiProperty({ description: 'Salary period', enum: SalaryPeriod, required: false })
  salaryPeriod?: SalaryPeriod;

  @ApiProperty({ description: 'Benefits offered', type: [String], required: false })
  benefits?: string[];

  @ApiProperty({ description: 'Job requirements', type: [String], required: false })
  requirements?: string[];

  @ApiProperty({ description: 'Job responsibilities', type: [String], required: false })
  responsibilities?: string[];

  @ApiProperty({ description: 'Experience level', enum: ExperienceLevel, required: false })
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ description: 'Education level', example: "Bachelor's degree", required: false })
  educationLevel?: string;

  @ApiProperty({ description: 'Required skills', type: [String], required: false })
  skills?: string[];

  @ApiProperty({ description: 'Application deadline', required: false })
  applicationDeadline?: Date;

  @ApiProperty({ description: 'Whether this position is urgent', example: false })
  isUrgent: boolean;

  @ApiProperty({ description: 'Whether this position is featured', example: false })
  isFeatured: boolean;

  @ApiProperty({ description: 'City where the job is located', example: 'San Francisco', required: false })
  city?: string;

  @ApiProperty({ description: 'State/province where the job is located', example: 'California', required: false })
  state?: string;

  @ApiProperty({ description: 'Country where the job is located', example: 'United States', required: false })
  country?: string;

  @ApiProperty({ description: 'Whether to show salary information publicly', example: false, default: false })
  showSalary: boolean;

  @ApiProperty({ description: 'Tags for categorization and search', type: [String], example: ['frontend', 'react', 'typescript'], required: false })
  tags: string[];

  @ApiProperty({ description: 'Whether this position is highlighted', example: false, default: false })
  isHighlighted: boolean;

  @ApiProperty({ description: 'Number of views', example: 0, default: 0 })
  viewCount: number;

  @ApiProperty({ description: 'Number of applications', example: 0, default: 0 })
  applicationCount: number;

  @ApiProperty({ description: 'The source channel where candidates are expected to come from', example: 'LinkedIn', required: false })
  candidateSource?: string;

  @ApiProperty({ description: 'The company name', example: 'Tech Corp' })
  companyName: string;

  @ApiProperty({ description: 'The company description', example: 'A leading tech company', required: false })
  companyDescription?: string;

  @ApiProperty({ description: 'The company logo URL', example: 'https://example.com/logo.png', required: false })
  companyLogoUrl?: string;

  @ApiProperty({ description: 'The company website URL', example: 'https://techcorp.com', required: false })
  companyWebsite?: string;

  @ApiProperty({ description: 'The company industry', example: 'Technology', required: false })
  companyIndustry?: string;

  @ApiProperty({ description: 'When the job position was created', example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Custom screening questions for this job position', type: [CustomQuestionDto], required: false })
  @IsOptional()
  customQuestions?: CustomQuestionDto[];

  @ApiProperty({ description: 'The stages of the job position', type: [StageResponseDto], required: false })
  stages?: StageResponseDto[];
}

export class JobPositionFiltersDto {
  @ApiProperty({ description: 'Search in title, description', example: 'Senior Developer', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by job category', example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Filter by job type', enum: JobType, required: false })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ description: 'Filter by work location', enum: WorkLocation, required: false })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiProperty({ description: 'Filter by experience level', enum: ExperienceLevel, required: false })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ description: 'Minimum salary filter', example: 50000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary filter', example: 150000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ description: 'Filter by company UID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  companyUid?: string;

  @ApiProperty({ description: 'Filter by city', example: 'San Francisco', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Filter by country', example: 'United States', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Sort by field', example: 'createdAt', enum: ['createdAt', 'salary', 'title'], default: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'salary' | 'title';

  @ApiProperty({ description: 'Sort order', example: 'desc', enum: ['asc', 'desc'], default: 'desc', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Page number (1-indexed)', example: 1, default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 12, default: 12, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class PaginatedPublicJobPositionResponseDto {
  @ApiProperty({ description: 'Array of job positions', type: [PublicJobPositionResponseDto] })
  data: PublicJobPositionResponseDto[];

  @ApiProperty({ description: 'Total number of matching job positions', example: 150 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 12 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 13 })
  totalPages: number;
}
