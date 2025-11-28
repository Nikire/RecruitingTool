import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, IsDateString, IsArray, ArrayMinSize } from 'class-validator';

export class GenerateTimeSlotsDto {
  @ApiProperty({
    description: 'The UID of the interview',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  interviewUid: string;

  @ApiProperty({
    description: 'The UID of the HR schedule to use for generating slots',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  hrScheduleUid: string;

  @ApiProperty({
    description: 'Duration of each slot in minutes',
    example: 60,
    minimum: 15,
  })
  @IsInt()
  @Min(15)
  duration: number;

  @ApiProperty({
    description: 'Date range to generate slots (ISO 8601 format)',
    example: '2025-12-15T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for slot generation (ISO 8601 format)',
    example: '2025-12-20T00:00:00.000Z',
  })
  @IsDateString()
  endDate: string;
}

export class GenerateCustomTimeSlotsDto {
  @ApiProperty({
    description: 'The UID of the interview',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  interviewUid: string;

  @ApiProperty({
    description: 'Array of custom time slot ranges',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        startTime: { type: 'string', format: 'date-time', example: '2025-12-15T14:00:00.000Z' },
        endTime: { type: 'string', format: 'date-time', example: '2025-12-15T15:00:00.000Z' },
      },
    },
  })
  @IsArray()
  @ArrayMinSize(1)
  slots: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export class SelectTimeSlotDto {
  @ApiProperty({
    description: 'The UID of the time slot to select',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsString()
  @IsNotEmpty()
  slotUid: string;
}

export class TimeSlotResponseDto {
  @ApiProperty({
    description: 'The UID of the time slot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uid: string;

  @ApiProperty({
    description: 'The UID of the interview',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  interviewUid: string;

  @ApiProperty({
    description: 'Start time of the slot',
    example: '2025-12-15T14:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'End time of the slot',
    example: '2025-12-15T15:00:00.000Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Whether the slot is available',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'When the slot was selected (if applicable)',
    example: '2025-12-10T10:00:00.000Z',
    nullable: true,
  })
  selectedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-01T10:00:00.000Z',
  })
  createdAt: Date;
}

export class BookingTokenResponseDto {
  @ApiProperty({
    description: 'The UID of the booking token',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uid: string;

  @ApiProperty({
    description: 'The unique booking token',
    example: 'bk_1234567890abcdef',
  })
  token: string;

  @ApiProperty({
    description: 'The UID of the interview',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  interviewUid: string;

  @ApiProperty({
    description: 'When the token expires',
    example: '2025-12-20T00:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'When the token was used (if applicable)',
    example: '2025-12-15T10:00:00.000Z',
    nullable: true,
  })
  usedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Booking page URL for the candidate',
    example: 'http://localhost:3000/book-interview/bk_1234567890abcdef',
  })
  bookingUrl: string;
}
