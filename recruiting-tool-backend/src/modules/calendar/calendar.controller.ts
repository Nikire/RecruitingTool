import { Controller, Get, Delete, Query, Redirect, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType, User } from '@prisma/client';
import { CalendarConnectionResponseDto, ConnectionStatusDto } from './dto/calendar-connection.dto';

@ApiTags('calendar')
@Controller('calendar')
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('auth/google')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get Google Calendar OAuth authorization URL' })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
    schema: {
      properties: {
        authUrl: { type: 'string', example: 'https://accounts.google.com/o/oauth2/v2/auth?...' },
        message: { type: 'string', example: 'Please visit this URL to authorize Google Calendar access' },
      },
    },
  })
  getGoogleAuthUrl(@CurrentUser() user: User) {
    const authUrl = this.calendarService.getGoogleAuthUrl(user.id);

    return {
      authUrl,
      message: 'Please visit this URL to authorize Google Calendar access',
    };
  }

  @Get('auth/google/callback')
  @ApiOperation({ summary: 'Google OAuth callback endpoint (handled automatically by Google)' })
  @ApiQuery({ name: 'code', description: 'Authorization code from Google', required: true })
  @ApiQuery({ name: 'state', description: 'User ID passed in state parameter', required: true })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend after successful authorization',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing authorization code or state',
  })
  @Redirect()
  async handleGoogleCallback(@Query('code') code: string, @Query('state') state: string) {
    if (!code || !state) {
      throw new BadRequestException('Missing authorization code or state');
    }

    const userId = parseInt(state, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID in state');
    }

    await this.calendarService.handleGoogleCallback(code, userId);

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
      url: `${frontendUrl}/settings/integrations?calendar=connected`,
      statusCode: 302,
    };
  }

  @Get('connection')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get current calendar connection status' })
  @ApiResponse({
    status: 200,
    description: 'Connection status retrieved successfully',
    type: ConnectionStatusDto,
  })
  async getConnectionStatus(@CurrentUser() user: User): Promise<ConnectionStatusDto> {
    return this.calendarService.getConnectionStatus(user.id);
  }

  @Delete('connection')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  @ApiResponse({
    status: 200,
    description: 'Calendar disconnected successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Google Calendar disconnected successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Calendar connection not found',
  })
  async disconnectCalendar(@CurrentUser() user: User) {
    await this.calendarService.disconnectCalendar(user.id);

    return {
      message: 'Google Calendar disconnected successfully',
    };
  }
}
