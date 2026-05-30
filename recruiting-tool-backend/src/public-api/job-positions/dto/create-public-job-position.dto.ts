import { ApiProperty } from '@nestjs/swagger';
import { ExperienceLevel, JobPositionStatus, JobType, SalaryPeriod, WorkLocation } from '@prisma/client';
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePublicJobPositionDto {
  @ApiProperty({
    description: 'Title of the job position',
    example: 'Senior Software Engineer',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the job position',
    example: 'We are looking for a talented software engineer...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Current status of the job position',
    enum: JobPositionStatus,
    default: JobPositionStatus.OPEN,
    required: false,
  })
  @IsOptional()
  @IsEnum(JobPositionStatus)
  status?: JobPositionStatus;

  @ApiProperty({
    description: 'Job category',
    example: 'Engineering',
    required: false,
  })
  @IsOptional()
  @IsString()
  jobCategory?: string;

  @ApiProperty({
    description: 'Type of employment',
    enum: JobType,
    required: false,
  })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({
    description: 'Work location type',
    enum: WorkLocation,
    required: false,
  })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiProperty({
    description: 'Minimum salary',
    example: 60000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({
    description: 'Maximum salary',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({
    description: 'Currency for salary values',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiProperty({
    description: 'Period for salary (hourly, monthly, yearly)',
    enum: SalaryPeriod,
    required: false,
  })
  @IsOptional()
  @IsEnum(SalaryPeriod)
  salaryPeriod?: SalaryPeriod;

  @ApiProperty({
    description: 'Whether salary information is publicly shown',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showSalary?: boolean;

  @ApiProperty({
    description: 'Experience level required',
    enum: ExperienceLevel,
    required: false,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({
    description: 'Education level required',
    example: "Bachelor's degree",
    required: false,
  })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiProperty({
    description: 'Required skills',
    type: [String],
    example: ['TypeScript', 'React', 'Node.js'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({
    description: 'Job requirements',
    type: [String],
    example: ['5+ years experience', "Bachelor's degree"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({
    description: 'Job responsibilities',
    type: [String],
    example: ['Lead development team', 'Code reviews'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiProperty({
    description: 'Benefits offered',
    type: [String],
    example: ['Health Insurance', '401k'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({
    description: 'Tags for categorization and search',
    type: [String],
    example: ['frontend', 'react', 'remote'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'City where the job is located',
    example: 'San Francisco',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'State/province where the job is located',
    example: 'California',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'Country where the job is located',
    example: 'United States',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Whether this position is featured',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Whether this position is urgent',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({
    description: 'Whether this position is highlighted',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isHighlighted?: boolean;

  @ApiProperty({
    description: 'Application deadline',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applicationDeadline?: Date;

  @ApiProperty({
    description: 'Expected candidate source channel',
    example: 'LinkedIn',
    required: false,
  })
  @IsOptional()
  @IsString()
  candidateSource?: string;
}
