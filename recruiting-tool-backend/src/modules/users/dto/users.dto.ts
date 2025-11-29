import { ApiProperty } from '@nestjs/swagger';
import { RolesType } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'jhondoe@hotmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Testing123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  password: string;

  @ApiProperty({ description: 'The UID of the company', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyUid?: string;
}
export class UpdateUserDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe 2' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'jhondoe2@hotmail.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Testing1234',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  password?: string;

  @ApiProperty({ description: 'The UID of the company', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyUid?: string;

  @ApiProperty({ description: 'Profile picture URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ description: 'Phone number', example: '+1-555-0123', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Job position/title', example: 'Senior HR Manager', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: 'Department', example: 'Human Resources', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'Professional bio', example: 'Experienced HR professional...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'LinkedIn profile URL', example: 'https://linkedin.com/in/johndoe', required: false })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiProperty({ description: 'User timezone', example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'The uid of the user' })
  uid: string;
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  name: string;
  @ApiProperty({
    description: 'The email of the user',
    example: 'jhondoe@hotmail.com',
  })
  email: string;
  @ApiProperty({
    description: 'The date the user was created',
    example: '2021-08-01T00:00:00.000Z',
  })
  createdAt?: string;
  @ApiProperty({
    description: 'The date the user was last updated',
    example: '2021-08-01T00:00:00.000Z',
  })
  updatedAt?: string;
  @ApiProperty({
    description: 'The roles of the user',
    example: ['USER', 'ADMIN'],
  })
  roles?: Array<RolesType>;
  @ApiProperty({
    description: 'The company UID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  companyUid?: string;
  @ApiProperty({ description: 'Profile picture URL', required: false })
  profilePicture?: string;
  @ApiProperty({ description: 'Phone number', required: false })
  phoneNumber?: string;
  @ApiProperty({ description: 'Job position/title', required: false })
  position?: string;
  @ApiProperty({ description: 'Department', required: false })
  department?: string;
  @ApiProperty({ description: 'Professional bio', required: false })
  bio?: string;
  @ApiProperty({ description: 'LinkedIn profile URL', required: false })
  linkedinUrl?: string;
  @ApiProperty({ description: 'User timezone', required: false })
  timezone?: string;
  @ApiProperty({ description: 'Whether the user is active', example: true })
  isActive?: boolean;
  @ApiProperty({ description: 'When the user was deactivated', required: false })
  deactivatedAt?: string;
  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: string;
}

export class UserWithPasswordResponseDto extends UserResponseDto {
  @ApiProperty({
    description: 'The password of the user',
    example: 'Testing123',
  })
  password: string;

  // Internal fields (not exposed in API, used internally only)
  id?: number;
  companyId?: number;
}

export class CreateUserInternalDto extends CreateUserDto {
  @ApiProperty({
    description: 'The roles of the user',
    example: ['USER', 'ADMIN'],
  })
  @IsString()
  @IsNotEmpty()
  roles: Array<RolesType>;
}

export class UserActivityLogResponseDto {
  @ApiProperty({ description: 'The UID of the activity log entry' })
  uid: string;

  @ApiProperty({ description: 'The UID of the user who performed the action' })
  userUid: string;

  @ApiProperty({ description: 'The action performed', example: 'LOGIN' })
  action: string;

  @ApiProperty({ description: 'IP address', example: '192.168.1.1', required: false })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string', required: false })
  userAgent?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: any;

  @ApiProperty({ description: 'When the action occurred' })
  createdAt: string;
}

export class CreateUserActivityLogDto {
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  metadata?: any;
}
