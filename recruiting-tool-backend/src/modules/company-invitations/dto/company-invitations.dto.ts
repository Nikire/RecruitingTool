import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RolesType, InvitationStatus } from '@prisma/client';

/**
 * DTO for inviting a user to join a company
 */
export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email of the user to invite',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role to assign to the invited user',
    enum: RolesType,
    default: RolesType.HR,
  })
  @IsEnum(RolesType)
  role: RolesType;
}

/**
 * DTO for accepting an invitation
 */
export class AcceptInvitationDto {
  @ApiProperty({
    description: 'User UID of the accepting user (must match the invited email)',
  })
  @IsUUID()
  userUid: string;
}

/**
 * Response DTO for company invitation
 */
export class CompanyInvitationResponseDto {
  @ApiProperty({ description: 'Invitation UID' })
  uid: string;

  @ApiProperty({ description: 'Company UID' })
  companyUid: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'Email of the invited user' })
  email: string;

  @ApiProperty({
    description: 'Role to be assigned',
    enum: RolesType,
  })
  role: RolesType;

  @ApiProperty({ description: 'User UID who sent the invitation' })
  invitedByUid: string;

  @ApiProperty({ description: 'Name of user who sent the invitation' })
  invitedByName: string;

  @ApiProperty({ description: 'Invitation token' })
  token: string;

  @ApiProperty({ description: 'Expiration date' })
  expiresAt: Date;

  @ApiProperty({
    description: 'Invitation status',
    enum: InvitationStatus,
  })
  status: InvitationStatus;

  @ApiProperty({ description: 'Date invitation was accepted', nullable: true })
  acceptedAt: Date | null;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}

/**
 * Query DTO for filtering invitations
 */
export class GetInvitationsQueryDto {
  @ApiProperty({
    description: 'Filter by status',
    enum: InvitationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;

  @ApiProperty({
    description: 'Limit number of results',
    required: false,
    default: 50,
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({
    description: 'Skip records',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsString()
  skip?: string;
}
