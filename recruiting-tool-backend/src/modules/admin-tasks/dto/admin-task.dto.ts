import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';

export enum AdminTaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum AdminTaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateAdminTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AdminTaskStatus, required: false })
  @IsOptional()
  @IsEnum(AdminTaskStatus)
  status?: AdminTaskStatus;

  @ApiProperty({ enum: AdminTaskPriority, required: false })
  @IsOptional()
  @IsEnum(AdminTaskPriority)
  priority?: AdminTaskPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedToUid?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkedCompanyUid?: string;
}

export class UpdateAdminTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AdminTaskStatus, required: false })
  @IsOptional()
  @IsEnum(AdminTaskStatus)
  status?: AdminTaskStatus;

  @ApiProperty({ enum: AdminTaskPriority, required: false })
  @IsOptional()
  @IsEnum(AdminTaskPriority)
  priority?: AdminTaskPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedToUid?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkedCompanyUid?: string;
}

export class AdminTaskUserDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class AdminTaskCompanyDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  name: string;
}

export class AdminTaskResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: AdminTaskStatus })
  status: AdminTaskStatus;

  @ApiProperty({ enum: AdminTaskPriority })
  priority: AdminTaskPriority;

  @ApiProperty({ required: false })
  dueDate?: string;

  @ApiProperty({ type: [String] })
  labels: string[];

  @ApiProperty({ type: AdminTaskUserDto, required: false })
  assignedTo?: AdminTaskUserDto;

  @ApiProperty({ type: AdminTaskCompanyDto, required: false })
  linkedCompany?: AdminTaskCompanyDto;

  @ApiProperty({ type: AdminTaskUserDto })
  createdBy: AdminTaskUserDto;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
