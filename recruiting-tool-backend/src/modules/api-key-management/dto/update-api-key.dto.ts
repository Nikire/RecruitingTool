import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

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
    description: 'Updated expiration date/time (ISO 8601). Pass null to remove expiry.',
    example: '2028-06-01T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expiresAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Enable or disable this API key',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
