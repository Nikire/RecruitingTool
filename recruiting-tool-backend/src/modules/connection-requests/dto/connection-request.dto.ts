import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { RolesType } from '@prisma/client';

export enum ConnectionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  CANCELLED = 'CANCELLED',
}

/**
 * DTO for creating a connection request (submit request to join a company)
 */
export class CreateConnectionRequestDto {
  @ApiProperty({ description: 'UID of the company to join' })
  @IsString()
  @IsNotEmpty()
  companyUid: string;

  @ApiPropertyOptional({
    description: 'Role being requested',
    enum: RolesType,
    default: RolesType.HR,
  })
  @IsEnum(RolesType)
  @IsOptional()
  requestedRole?: RolesType;

  @ApiPropertyOptional({
    description: 'Optional message from requester',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}

/**
 * DTO for approving a connection request
 */
export class ApproveConnectionRequestDto {
  @ApiPropertyOptional({
    description: 'Optional note from reviewer',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reviewNote?: string;

  @ApiPropertyOptional({
    description: 'Role to assign (defaults to requested role)',
    enum: RolesType,
  })
  @IsEnum(RolesType)
  @IsOptional()
  assignedRole?: RolesType;
}

/**
 * DTO for denying a connection request
 */
export class DenyConnectionRequestDto {
  @ApiProperty({ description: 'Reason for denial' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reviewNote: string;
}

/**
 * Response DTO for connection request
 */
export class ConnectionRequestResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  uid: string;

  @ApiProperty({ description: 'User UID who requested' })
  userUid: string;

  @ApiProperty({ description: 'User name who requested' })
  userName: string;

  @ApiProperty({ description: 'User email who requested' })
  userEmail: string;

  @ApiProperty({ description: 'Company UID' })
  companyUid: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'Requested role', enum: RolesType })
  requestedRole: RolesType;

  @ApiProperty({ description: 'Request status', enum: ConnectionRequestStatus })
  status: ConnectionRequestStatus;

  @ApiPropertyOptional({ description: 'Message from requester' })
  message?: string;

  @ApiPropertyOptional({ description: 'UID of reviewer' })
  reviewedByUid?: string;

  @ApiPropertyOptional({ description: 'Name of reviewer' })
  reviewedByName?: string;

  @ApiPropertyOptional({ description: 'Review timestamp' })
  reviewedAt?: string;

  @ApiPropertyOptional({ description: 'Note from reviewer' })
  reviewNote?: string;

  @ApiProperty({ description: 'Request creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}

/**
 * Query DTO for filtering connection requests
 */
export class GetConnectionRequestsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConnectionRequestStatus,
  })
  @IsEnum(ConnectionRequestStatus)
  @IsOptional()
  status?: ConnectionRequestStatus;

  @ApiPropertyOptional({
    description: 'Number of records to return (default: 50, max: 100)',
    default: 50,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip (for pagination)',
    default: 0,
  })
  @IsOptional()
  skip?: number;
}
