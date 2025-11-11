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
    description: 'The company ID of the user',
    example: 1,
    required: false,
  })
  companyId?: number;
}

export class UserWithPasswordResponseDto extends UserResponseDto {
  @ApiProperty({
    description: 'The password of the user',
    example: 'Testing123',
  })
  password: string;
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
