import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsBoolean, IsInt, IsUrl, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'The description of the company', example: 'A leading technology company', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'The logo URL of the company', example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class UpdateCompanyDto {
  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp Updated', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'The description of the company', example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'The logo URL of the company', example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class UpdateCompanyProfileDto {
  @ApiProperty({ description: 'Company name', example: 'Tech Corp', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Short company description shown on careers page', example: 'We build great software', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Company website URL', example: 'https://techcorp.com', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @ApiProperty({ description: 'Industry the company operates in', example: 'Technology', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiProperty({ description: 'Number of employees range', example: '51-200', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companySize?: string;

  @ApiProperty({ description: 'Year the company was founded', example: 2020, required: false })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @Type(() => Number)
  foundedYear?: number;

  @ApiProperty({ description: 'Primary company location', example: 'Buenos Aires, Argentina', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ description: 'LinkedIn profile URL', example: 'https://linkedin.com/company/techcorp', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkedinUrl?: string;

  @ApiProperty({ description: 'Twitter/X profile URL', example: 'https://twitter.com/techcorp', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  twitterUrl?: string;

  @ApiProperty({ description: 'Instagram profile URL', example: 'https://instagram.com/techcorp', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instagramUrl?: string;

  @ApiProperty({ description: 'Whether careers page is enabled', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  careersEnabled?: boolean;

  @ApiProperty({ description: 'Headline shown on careers page', example: 'Join our growing team!', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  careersHeadline?: string;
}

export class CompanyResponseDto {
  @ApiProperty({ description: 'The UID of the company', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  name: string;

  @ApiProperty({ description: 'The description of the company', example: 'A leading technology company', required: false })
  description?: string;

  @ApiProperty({ description: 'The logo URL of the company', example: 'https://example.com/logo.png', required: false })
  logoUrl?: string;

  @ApiProperty({ description: 'Number of users in the company', example: 5, required: false })
  userCount?: number;

  @ApiProperty({ description: 'Number of job positions', example: 10, required: false })
  jobPositionCount?: number;
}

export class CompanyProfileResponseDto {
  @ApiProperty({ description: 'The UID of the company' })
  uid: string;

  @ApiProperty({ description: 'Company name' })
  name: string;

  @ApiProperty({ description: 'Company description', required: false })
  description?: string;

  @ApiProperty({ description: 'Company logo URL', required: false })
  logoUrl?: string;

  @ApiProperty({ description: 'Company website URL', required: false })
  website?: string;

  @ApiProperty({ description: 'Industry', required: false })
  industry?: string;

  @ApiProperty({ description: 'Employee count range', required: false })
  companySize?: string;

  @ApiProperty({ description: 'Founded year', required: false })
  foundedYear?: number;

  @ApiProperty({ description: 'Primary location', required: false })
  location?: string;

  @ApiProperty({ description: 'LinkedIn URL', required: false })
  linkedinUrl?: string;

  @ApiProperty({ description: 'Twitter/X URL', required: false })
  twitterUrl?: string;

  @ApiProperty({ description: 'Instagram URL', required: false })
  instagramUrl?: string;

  @ApiProperty({ description: 'Whether careers page is enabled' })
  careersEnabled: boolean;

  @ApiProperty({ description: 'Careers page headline', required: false })
  careersHeadline?: string;
}

export class PublicCompanyResponseDto {
  @ApiProperty({ description: 'The UID of the company', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  name: string;

  @ApiProperty({ description: 'The logo URL of the company', example: 'https://example.com/logo.png', required: false })
  logoUrl?: string;
}

export class CompanyUserResponseDto {
  @ApiProperty({ description: 'The UID of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'The email of the user', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'The roles of the user', example: ['HR'] })
  roles: string[];

  @ApiProperty({ description: 'Whether the user is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'The position/job title of the user', example: 'HR Manager', required: false })
  position?: string;

  @ApiProperty({ description: 'The department of the user', example: 'Human Resources', required: false })
  department?: string;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class TransferOwnershipDto {
  @ApiProperty({ description: 'The UID of the new owner', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  newOwnerUid: string;
}

export class ForceJoinDto {
  @ApiProperty({ description: 'The UID of the user to join the company', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  userUid: string;

  @ApiProperty({ description: 'The role to assign (defaults to HR)', example: 'HR', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
