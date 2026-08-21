import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';

/**
 * A Client is an agency's END CLIENT — the company a role is actually being filled for.
 *
 * Every DTO here speaks UIDs only. The numeric `Client.id` and the owning
 * `Client.companyId` never cross the API boundary: the owning agency is always
 * the caller's own company, resolved server-side from the JWT.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateClientDto {
  @ApiProperty({ description: 'Client / account name', example: 'Acme Corporation' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'URL-safe short identifier, unique within your company. Lowercase letters, digits and single hyphens.',
    example: 'acme-corp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase alphanumeric words separated by single hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ description: "URL of the client's logo", example: 'https://cdn.example.com/acme.png' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Primary contact name at the client', example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact email at the client', example: 'jane@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Free-form internal notes about the account' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Lifecycle status', enum: ClientStatus, default: ClientStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ description: 'Client / account name', example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'URL-safe short identifier, unique within your company', example: 'acme-corp' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase alphanumeric words separated by single hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ description: "URL of the client's logo" })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Primary contact name at the client' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact email at the client' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Free-form internal notes about the account' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Lifecycle status', enum: ClientStatus })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}

export class ClientFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by lifecycle status', enum: ClientStatus })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}

export class ClientResponseDto {
  @ApiProperty({ description: 'Client UID', example: '550e8400-e29b-41d4-a716-446655440000' })
  uid: string;

  @ApiProperty({ description: 'Client / account name', example: 'Acme Corporation' })
  name: string;

  @ApiPropertyOptional({ description: 'URL-safe short identifier', nullable: true })
  slug: string | null;

  @ApiPropertyOptional({ description: "URL of the client's logo", nullable: true })
  logoUrl: string | null;

  @ApiPropertyOptional({ description: 'Primary contact name', nullable: true })
  contactName: string | null;

  @ApiPropertyOptional({ description: 'Primary contact email', nullable: true })
  contactEmail: string | null;

  @ApiPropertyOptional({ description: 'Internal notes', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Lifecycle status', enum: ClientStatus })
  status: ClientStatus;

  @ApiPropertyOptional({
    description: 'Number of non-deleted job positions currently attributed to this client',
    example: 7,
  })
  jobPositionCount?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
