import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CalendarProvider } from '@prisma/client';

/**
 * Response DTO for Calendar Connection status
 */
export class CalendarConnectionResponseDto {
  @ApiProperty({ description: 'Calendar connection UID' })
  uid: string;

  @ApiProperty({ enum: CalendarProvider, description: 'Calendar provider (GOOGLE, OUTLOOK)' })
  provider: CalendarProvider;

  @ApiProperty({ description: 'Connected email account' })
  email: string;

  @ApiProperty({ description: 'Connection created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Access token expiry date' })
  tokenExpiry?: Date;
}

/**
 * Response DTO for connection status check
 */
export class ConnectionStatusDto {
  @ApiProperty({ description: 'Whether calendar is connected' })
  connected: boolean;

  @ApiPropertyOptional({ description: 'Connection details if connected' })
  connection?: CalendarConnectionResponseDto;
}
