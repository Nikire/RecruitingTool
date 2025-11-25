import { IsInt, IsString, IsBoolean, IsOptional, Min, Max, Matches, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateHRScheduleDto {
  @ApiProperty({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '09:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:mm format',
    example: '17:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format'
  })
  endTime: string;

  @ApiProperty({
    description: 'Whether this is a recurring schedule',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Specific date for one-time availability (ISO format)',
    required: false,
    example: '2025-01-15'
  })
  @IsOptional()
  @IsDateString()
  specificDate?: string;
}

export class UpdateHRScheduleDto extends PartialType(CreateHRScheduleDto) {}

export class HRScheduleResponseDto {
  @ApiProperty({ description: 'Schedule unique identifier' })
  uid: string;

  @ApiProperty({ description: 'User unique identifier' })
  userUid: string;

  @ApiProperty({ description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)' })
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time in HH:mm format' })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:mm format' })
  endTime: string;

  @ApiProperty({ description: 'Whether this is a recurring schedule' })
  isRecurring: boolean;

  @ApiProperty({ description: 'Specific date for one-time availability', required: false })
  specificDate?: string;

  @ApiProperty({ description: 'Whether this slot is available' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
