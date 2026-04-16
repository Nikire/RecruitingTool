import { ApiProperty } from '@nestjs/swagger';
import { RolesType } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'The UID of the user to assign the role to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userUid: string;

  @ApiProperty({
    description: 'The roles to assign to the user',
    example: ['HR_MANAGER'],
    enum: RolesType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(RolesType, { each: true })
  roles: RolesType[];
}

export class UpdateRoleDto {
  @ApiProperty({
    description: 'The new roles for the user',
    example: ['HR', 'RECRUITER'],
    enum: RolesType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(RolesType, { each: true })
  roles: RolesType[];
}

export class CompanyMemberResponseDto {
  @ApiProperty({ description: 'The UID of the user' })
  uid: string;

  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({
    description: 'The roles of the user within the company',
    example: ['HR_MANAGER', 'HR'],
  })
  roles: RolesType[];

  @ApiProperty({ description: 'Whether the user is active' })
  isActive: boolean;

  @ApiProperty({ description: 'User position/title', required: false })
  position?: string;

  @ApiProperty({ description: 'User department', required: false })
  department?: string;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  profilePicture?: string;

  @ApiProperty({ description: 'When the user joined the company' })
  createdAt: string;
}
