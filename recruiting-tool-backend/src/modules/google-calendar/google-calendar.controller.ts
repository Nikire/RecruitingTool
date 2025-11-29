import { Controller, Get, Post, Put, Delete, Body, Param, Query, Redirect, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto, GetAvailabilityDto, CalendarEventResponseDto, AvailabilityResponseDto } from './dto/calendar.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType, User } from '@prisma/client';

@ApiTags('google-calendar')
@Controller('google-calendar')
@ApiBearerAuth()
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth-url')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get Google Calendar OAuth authorization URL' })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
    schema: {
      properties: {
        authUrl: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  getAuthUrl(@CurrentUser() user: User) {
    const authUrl = this.googleCalendarService.getAuthUrl(user.id);

    return {
      authUrl,
      message: 'Please visit this URL to authorize Google Calendar access',
    };
  }

  @Get('callback')
  @ApiOperation({ summary: 'OAuth callback endpoint (handled by Google)' })
  @ApiQuery({ name: 'code', description: 'Authorization code from Google' })
  @ApiQuery({ name: 'state', description: 'User ID passed in state parameter' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend after successful authorization',
  })
  @Redirect()
  async handleCallback(@Query('code') code: string, @Query('state') state: string) {
    if (!code || !state) {
      throw new BadRequestException('Missing authorization code or state');
    }

    const userId = parseInt(state, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID in state');
    }

    await this.googleCalendarService.handleOAuthCallback(code, userId);

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
      url: `${frontendUrl}/settings/integrations?calendar=connected`,
      statusCode: 302,
    };
  }

  @Get('status')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Check if Google Calendar is connected' })
  @ApiResponse({
    status: 200,
    description: 'Calendar connection status',
    schema: {
      properties: {
        connected: { type: 'boolean' },
      },
    },
  })
  async getConnectionStatus(@CurrentUser() user: User) {
    const connected = await this.googleCalendarService.isCalendarConnected(user.id);

    return { connected };
  }

  @Delete('disconnect')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  @ApiResponse({
    status: 200,
    description: 'Calendar disconnected successfully',
  })
  async disconnect(@CurrentUser() user: User) {
    await this.googleCalendarService.disconnectCalendar(user.id);

    return {
      message: 'Google Calendar disconnected successfully',
    };
  }

  @Post('events')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Create a new calendar event with Google Meet' })
  @ApiResponse({
    status: 201,
    description: 'Calendar event created successfully',
    type: CalendarEventResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User has not connected Google Calendar',
  })
  async createEvent(@CurrentUser() user: User, @Body() dto: CreateCalendarEventDto): Promise<CalendarEventResponseDto> {
    return this.googleCalendarService.createCalendarEvent(user.id, dto);
  }

  @Put('events/:eventId')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Update an existing calendar event' })
  @ApiResponse({
    status: 200,
    description: 'Calendar event updated successfully',
    type: CalendarEventResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User has not connected Google Calendar',
  })
  async updateEvent(@CurrentUser() user: User, @Param('eventId') eventId: string, @Body() dto: UpdateCalendarEventDto): Promise<CalendarEventResponseDto> {
    return this.googleCalendarService.updateCalendarEvent(user.id, eventId, dto);
  }

  @Delete('events/:eventId')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Delete a calendar event' })
  @ApiResponse({
    status: 200,
    description: 'Calendar event deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User has not connected Google Calendar',
  })
  async deleteEvent(@CurrentUser() user: User, @Param('eventId') eventId: string) {
    await this.googleCalendarService.deleteCalendarEvent(user.id, eventId);

    return {
      message: 'Calendar event deleted successfully',
    };
  }

  @Get('availability')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get user availability (free/busy times)' })
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User has not connected Google Calendar',
  })
  async getAvailability(@CurrentUser() user: User, @Query() dto: GetAvailabilityDto): Promise<AvailabilityResponseDto> {
    return this.googleCalendarService.getAvailability(user.id, dto);
  }
}
