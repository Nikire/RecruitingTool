import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the API key',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uid: string;

  @ApiProperty({
    description: 'Human-readable name for this API key',
    example: 'Production Integration Key',
  })
  name: string;

  @ApiProperty({
    description: 'First 16 characters of the raw key (safe to display)',
    example: 'blss_live_a1b2c3',
  })
  keyPrefix: string;

  @ApiProperty({
    description: 'Whether this API key is currently active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Permission scopes granted to this key',
    example: ['candidates:read', 'jobs:read'],
    type: [String],
  })
  scopes: string[];

  @ApiPropertyOptional({
    description: 'Timestamp when this key was last used to authenticate a request',
    example: '2026-05-15T10:30:00.000Z',
    nullable: true,
  })
  lastUsedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Expiration date/time for this key. Null means no expiry.',
    example: '2027-01-01T00:00:00.000Z',
    nullable: true,
  })
  expiresAt: Date | null;

  @ApiProperty({
    description: 'Timestamp when the API key was created',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The raw (plaintext) API key — ONLY returned once at creation time. Store it securely; it cannot be retrieved again.',
    example: 'blss_live_a1b2c3d4e5f6g7h8',
  })
  rawKey?: string;
}
