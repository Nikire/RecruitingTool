import { ApiProperty } from '@nestjs/swagger';
import { ExperienceLevel, JobPositionStatus, JobType, SalaryPeriod, WorkLocation } from '@prisma/client';

export class PublicApiJobPositionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the job position',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uid: string;

  @ApiProperty({
    description: 'Title of the job position',
    example: 'Senior Software Engineer',
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the job position',
    example: 'We are looking for a talented software engineer...',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Current status of the job position',
    enum: JobPositionStatus,
    example: JobPositionStatus.OPEN,
  })
  status: JobPositionStatus;

  @ApiProperty({
    description: 'Job category',
    example: 'Engineering',
    required: false,
    nullable: true,
  })
  jobCategory?: string | null;

  @ApiProperty({
    description: 'Type of employment',
    enum: JobType,
    required: false,
    nullable: true,
  })
  jobType?: JobType | null;

  @ApiProperty({
    description: 'Work location type',
    enum: WorkLocation,
    required: false,
    nullable: true,
  })
  workLocation?: WorkLocation | null;

  @ApiProperty({
    description: 'Minimum salary',
    example: 60000,
    required: false,
    nullable: true,
  })
  salaryMin?: number | null;

  @ApiProperty({
    description: 'Maximum salary',
    example: 100000,
    required: false,
    nullable: true,
  })
  salaryMax?: number | null;

  @ApiProperty({
    description: 'Currency for salary values',
    example: 'USD',
  })
  salaryCurrency: string;

  @ApiProperty({
    description: 'Period for salary (hourly, monthly, yearly)',
    enum: SalaryPeriod,
    required: false,
    nullable: true,
  })
  salaryPeriod?: SalaryPeriod | null;

  @ApiProperty({
    description: 'Whether salary information is publicly shown',
    example: false,
  })
  showSalary: boolean;

  @ApiProperty({
    description: 'Experience level required',
    enum: ExperienceLevel,
    required: false,
    nullable: true,
  })
  experienceLevel?: ExperienceLevel | null;

  @ApiProperty({
    description: 'Education level required',
    example: "Bachelor's degree",
    required: false,
    nullable: true,
  })
  educationLevel?: string | null;

  @ApiProperty({
    description: 'Required skills',
    type: [String],
    example: ['TypeScript', 'React', 'Node.js'],
  })
  skills: string[];

  @ApiProperty({
    description: 'Job requirements',
    type: [String],
    example: ['5+ years experience', "Bachelor's degree"],
  })
  requirements: string[];

  @ApiProperty({
    description: 'Job responsibilities',
    type: [String],
    example: ['Lead development team', 'Code reviews'],
  })
  responsibilities: string[];

  @ApiProperty({
    description: 'Benefits offered',
    type: [String],
    example: ['Health Insurance', '401k'],
  })
  benefits: string[];

  @ApiProperty({
    description: 'Tags for categorization and search',
    type: [String],
    example: ['frontend', 'react', 'remote'],
  })
  tags: string[];

  @ApiProperty({
    description: 'City where the job is located',
    example: 'San Francisco',
    required: false,
    nullable: true,
  })
  city?: string | null;

  @ApiProperty({
    description: 'State/province where the job is located',
    example: 'California',
    required: false,
    nullable: true,
  })
  state?: string | null;

  @ApiProperty({
    description: 'Country where the job is located',
    example: 'United States',
    required: false,
    nullable: true,
  })
  country?: string | null;

  @ApiProperty({
    description: 'Whether this position is featured',
    example: false,
  })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Whether this position is urgent',
    example: false,
  })
  isUrgent: boolean;

  @ApiProperty({
    description: 'Whether this position is highlighted',
    example: false,
  })
  isHighlighted: boolean;

  @ApiProperty({
    description: 'Application deadline',
    example: '2025-12-31T23:59:59Z',
    required: false,
    nullable: true,
  })
  applicationDeadline?: Date | null;

  @ApiProperty({
    description: 'Number of applications received',
    example: 42,
  })
  applicationCount: number;

  @ApiProperty({
    description: 'Number of times the position has been viewed',
    example: 1200,
  })
  viewCount: number;

  @ApiProperty({
    description: 'Expected candidate source channel',
    example: 'LinkedIn',
    required: false,
    nullable: true,
  })
  candidateSource?: string | null;

  @ApiProperty({
    description: 'When the job position was created',
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the job position was last updated',
    example: '2025-06-01T08:00:00Z',
  })
  updatedAt: Date;
}
