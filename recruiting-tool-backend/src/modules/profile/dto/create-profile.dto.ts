import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Professional bio',
    example: 'Experienced HR professional with 5+ years in recruitment',
    required: false
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1-555-0123',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Location',
    example: 'New York, NY',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'User timezone',
    example: 'America/New_York',
    required: false
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'User preferences as JSON object',
    example: { theme: 'dark', notifications: true },
    required: false
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
