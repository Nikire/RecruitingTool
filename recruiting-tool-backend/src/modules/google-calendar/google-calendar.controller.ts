import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Redirect,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  GetAvailabilityDto,
  CalendarEventResponseDto,
  AvailabilityResponseDto,
} from './dto/calendar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesType } from '@prisma/client';
import { Request } from 'express';

@ApiTags('google-calendar')
@Controller('google-calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth-url')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
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
  getAuthUrl(@Req() req: Request) {
    const userId = req.user['id'];
    const authUrl = this.googleCalendarService.getAuthUrl(userId);

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
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
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
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
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
  async getConnectionStatus(@Req() req: Request) {
    const userId = req.user['id'];
    const connected = await this.googleCalendarService.isCalendarConnected(userId);

    return { connected };
  }

  @Delete('disconnect')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  @ApiResponse({
    status: 200,
    description: 'Calendar disconnected successfully',
  })
  async disconnect(@Req() req: Request) {
    const userId = req.user['id'];
    await this.googleCalendarService.disconnectCalendar(userId);

    return {
      message: 'Google Calendar disconnected successfully',
    };
  }

  @Post('events')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
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
  async createEvent(
    @Req() req: Request,
    @Body() dto: CreateCalendarEventDto,
  ): Promise<CalendarEventResponseDto> {
    const userId = req.user['id'];
    return this.googleCalendarService.createCalendarEvent(userId, dto);
  }

  @Put('events/:eventId')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
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
  async updateEvent(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateCalendarEventDto,
  ): Promise<CalendarEventResponseDto> {
    const userId = req.user['id'];
    return this.googleCalendarService.updateCalendarEvent(userId, eventId, dto);
  }

  @Delete('events/:eventId')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a calendar event' })
  @ApiResponse({
    status: 200,
    description: 'Calendar event deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User has not connected Google Calendar',
  })
  async deleteEvent(
    @Req() req: Request,
    @Param('eventId') eventId: string,
  ) {
    const userId = req.user['id'];
    await this.googleCalendarService.deleteCalendarEvent(userId, eventId);

    return {
      message: 'Calendar event deleted successfully',
    };
  }

  @Get('availability')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
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
  async getAvailability(
    @Req() req: Request,
    @Query() dto: GetAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    const userId = req.user['id'];
    return this.googleCalendarService.getAvailability(userId, dto);
  }
}
