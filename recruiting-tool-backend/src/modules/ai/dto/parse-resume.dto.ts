import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, IsUUID } from 'class-validator';

export class ParseResumeRequestDto {
  @ApiProperty({
    description: 'URL to the uploaded resume file (from MinIO)',
    example: 'http://localhost:9000/recruiting-tool/resumes/abc123.pdf',
  })
  @IsUrl()
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({
    description: 'Optional - UID of existing candidate to link parsed data',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  candidateUid?: string;
}

export class WorkExperienceDto {
  @ApiProperty({ description: 'Company name', example: 'Tech Corp' })
  company: string;

  @ApiProperty({ description: 'Job title', example: 'Senior Developer' })
  title: string;

  @ApiPropertyOptional({ description: 'Start date', example: '2020-01' })
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2023-06' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Job description',
    example: 'Led development team...',
  })
  description?: string;
}

export class EducationDto {
  @ApiProperty({
    description: 'Educational institution',
    example: 'MIT',
  })
  institution: string;

  @ApiProperty({ description: 'Degree obtained', example: 'Bachelor of Science' })
  degree: string;

  @ApiPropertyOptional({
    description: 'Field of study',
    example: 'Computer Science',
  })
  field?: string;

  @ApiPropertyOptional({
    description: 'Graduation date',
    example: '2019-05',
  })
  graduationDate?: string;
}

export class ParsedResumeDataDto {
  @ApiPropertyOptional({ description: 'Full name', example: 'John Doe' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  phone?: string;

  @ApiProperty({
    description: 'List of skills',
    example: ['JavaScript', 'TypeScript', 'React'],
  })
  skills: string[];

  @ApiProperty({
    description: 'Work experience history',
    type: [WorkExperienceDto],
  })
  experience: WorkExperienceDto[];

  @ApiProperty({
    description: 'Education history',
    type: [EducationDto],
  })
  education: EducationDto[];

  @ApiPropertyOptional({
    description: 'Professional summary',
    example: 'Experienced software developer...',
  })
  summary?: string;

  @ApiPropertyOptional({
    description: 'Languages spoken',
    example: ['English', 'Spanish'],
  })
  languages?: string[];

  @ApiPropertyOptional({
    description: 'Certifications',
    example: ['AWS Certified Developer'],
  })
  certifications?: string[];
}

export class ParseResumeResponseDto {
  @ApiProperty({ description: 'Whether parsing was successful' })
  success: boolean;

  @ApiProperty({ description: 'Parsed resume data', type: ParsedResumeDataDto })
  parsedData: ParsedResumeDataDto;

  @ApiProperty({
    description: 'Confidence score of the parsing (0-100)',
    example: 85,
  })
  confidence: number;

  @ApiPropertyOptional({
    description: 'Raw extracted text from the resume',
    example: 'John Doe\nSoftware Developer...',
  })
  rawText?: string;
}
