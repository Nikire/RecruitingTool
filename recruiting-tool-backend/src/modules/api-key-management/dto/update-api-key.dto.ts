import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateApiKeyDto {
  @ApiPropertyOptional({
    description: 'Updated human-readable name for this API key',
    example: 'Staging Integration Key',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated expiration date (ISO 8601 date string). Pass null to remove expiry.',
    example: '2028-06-01',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiPropertyOptional({
    description: 'Enable or disable this API key',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
