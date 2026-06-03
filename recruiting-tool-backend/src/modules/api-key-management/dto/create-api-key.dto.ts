import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Human-readable name for this API key',
    example: 'Production Integration Key',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the API key (ISO 8601 date string). Omit for no expiry.',
    example: '2027-01-01',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'List of permission scopes granted to this key',
    example: ['candidates:read', 'jobs:read'],
    type: [String],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
