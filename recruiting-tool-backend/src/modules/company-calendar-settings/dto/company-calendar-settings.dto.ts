import { IsBoolean, IsInt, IsArray, IsString, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyCalendarSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBookingEnabled?: boolean;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  workingDays?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workingHoursStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workingHoursEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferMinutes?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedDates?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  advanceBookingDays?: number;
}

export class CompanyCalendarSettingsResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  isBookingEnabled: boolean;

  @ApiProperty({ type: [Number] })
  workingDays: number[];

  @ApiProperty()
  workingHoursStart: string;

  @ApiProperty()
  workingHoursEnd: string;

  @ApiProperty()
  bufferMinutes: number;

  @ApiProperty({ type: [String] })
  blockedDates: string[];

  @ApiProperty()
  advanceBookingDays: number;
}
