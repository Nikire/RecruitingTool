import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestDemoBookingDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;
}

export class SelectDemoSlotDto {
  @ApiProperty()
  @IsString()
  slotUid: string;
}

export class DemoBookingResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  bookingUrl: string;

  @ApiProperty()
  expiresAt: Date;
}

export class DemoTimeSlotResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  isAvailable: boolean;
}

export class DemoCalendarSettingsResponseDto {
  @ApiProperty()
  workingDays: number[];

  @ApiProperty()
  advanceBookingDays: number;

  @ApiPropertyOptional()
  blockedDates?: string[];
}
