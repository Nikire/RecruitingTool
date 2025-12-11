import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsArray, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CalendarAttendeeDto {
  @ApiProperty({ description: 'Attendee email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Attendee display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Whether attendee is optional' })
  @IsOptional()
  optional?: boolean;
}

export class CreateCalendarEventDto {
  @ApiProperty({ description: 'Event summary/title' })
  @IsString()
  summary: string;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Event start time (ISO 8601)' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Event end time (ISO 8601)' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Timezone (IANA format)', default: 'UTC' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ description: 'Event location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'List of attendees',
    type: [CalendarAttendeeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalendarAttendeeDto)
  attendees?: CalendarAttendeeDto[];

  @ApiPropertyOptional({
    description: 'Whether to create Google Meet link',
    default: true,
  })
  @IsOptional()
  createMeetLink?: boolean;

  @ApiPropertyOptional({
    description: 'Send email notifications to attendees',
    default: true,
  })
  @IsOptional()
  sendUpdates?: boolean;
}

export class UpdateCalendarEventDto {
  @ApiPropertyOptional({ description: 'Event summary/title' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Event start time (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Event end time (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Timezone (IANA format)' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ description: 'Event location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'List of attendees',
    type: [CalendarAttendeeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalendarAttendeeDto)
  attendees?: CalendarAttendeeDto[];

  @ApiPropertyOptional({
    description: 'Send email notifications to attendees',
    default: true,
  })
  @IsOptional()
  sendUpdates?: boolean;
}

export class GetAvailabilityDto {
  @ApiProperty({ description: 'Start of date range (ISO 8601)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End of date range (ISO 8601)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Timezone (IANA format)', default: 'UTC' })
  @IsOptional()
  @IsString()
  timeZone?: string;
}

export class CalendarEventResponseDto {
  @ApiProperty({ description: 'Google Calendar event ID' })
  id: string;

  @ApiProperty({ description: 'Event summary/title' })
  summary: string;

  @ApiPropertyOptional({ description: 'Event description' })
  description?: string;

  @ApiProperty({ description: 'Event start time' })
  startTime: string;

  @ApiProperty({ description: 'Event end time' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Event timezone' })
  timeZone?: string;

  @ApiPropertyOptional({ description: 'Google Meet link' })
  meetLink?: string;

  @ApiPropertyOptional({ description: 'Event location' })
  location?: string;

  @ApiPropertyOptional({ description: 'List of attendees' })
  attendees?: CalendarAttendeeDto[];

  @ApiProperty({ description: 'Event status' })
  status: string;

  @ApiProperty({ description: 'HTML link to event' })
  htmlLink: string;
}

export class AvailabilitySlotDto {
  @ApiProperty({ description: 'Start time of available slot' })
  startTime: string;

  @ApiProperty({ description: 'End time of available slot' })
  endTime: string;
}

export class AvailabilityResponseDto {
  @ApiProperty({ description: 'Whether user is busy during this time' })
  busy: boolean;

  @ApiProperty({
    description: 'List of available time slots',
    type: [AvailabilitySlotDto],
  })
  availableSlots: AvailabilitySlotDto[];
}
