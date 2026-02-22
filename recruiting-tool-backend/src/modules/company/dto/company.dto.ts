import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

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
