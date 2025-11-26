import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../shared/modules/database/database.service';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  GetAvailabilityDto,
  CalendarEventResponseDto,
  AvailabilityResponseDto,
  AvailabilitySlotDto,
} from './dto/calendar.dto';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private oauth2Client: OAuth2Client;
  private readonly scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.warn('Google Calendar credentials not configured');
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );
  }

  /**
   * Generate OAuth2 authorization URL for user to connect their Google Calendar
   */
  getAuthUrl(userId: number): string {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state: userId.toString(), // Pass userId in state for callback
      prompt: 'consent', // Force consent screen to always get refresh token
    });

    this.logger.log(`Generated auth URL for user ${userId}`);
    return authUrl;
  }

  /**
   * Handle OAuth2 callback and store refresh token
   */
  async handleOAuthCallback(code: string, userId: number): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.refresh_token) {
        throw new BadRequestException(
          'No refresh token received. User may have already authorized.',
        );
      }

      // Store refresh token in database
      await this.databaseService.user.update({
        where: { id: userId },
        data: { googleRefreshToken: tokens.refresh_token },
      });

      this.logger.log(`Stored refresh token for user ${userId}`);
    } catch (error) {
      this.logger.error(`OAuth callback error: ${error.message}`);
      throw new InternalServerErrorException('Failed to complete Google Calendar authorization');
    }
  }

  /**
   * Get valid access token for user (refresh if needed)
   */
  private async getAccessToken(userId: number): Promise<string> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: { googleRefreshToken: true },
    });

    if (!user?.googleRefreshToken) {
      throw new BadRequestException(
        'User has not connected Google Calendar. Please authorize first.',
      );
    }

    this.oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token;
    } catch (error) {
      this.logger.error(`Failed to refresh access token: ${error.message}`);
      throw new InternalServerErrorException('Failed to authenticate with Google Calendar');
    }
  }

  /**
   * Get authenticated calendar client for user
   */
  private async getCalendarClient(userId: number): Promise<calendar_v3.Calendar> {
    await this.getAccessToken(userId);
    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Create calendar event with optional Google Meet link
   */
  async createCalendarEvent(
    userId: number,
    dto: CreateCalendarEventDto,
  ): Promise<CalendarEventResponseDto> {
    try {
      const calendar = await this.getCalendarClient(userId);

      const event: calendar_v3.Schema$Event = {
        summary: dto.summary,
        description: dto.description,
        start: {
          dateTime: dto.startTime,
          timeZone: dto.timeZone || 'UTC',
        },
        end: {
          dateTime: dto.endTime,
          timeZone: dto.timeZone || 'UTC',
        },
        location: dto.location,
        attendees: dto.attendees?.map((attendee) => ({
          email: attendee.email,
          displayName: attendee.displayName,
          optional: attendee.optional || false,
        })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      // Add Google Meet conference if requested
      if (dto.createMeetLink !== false) {
        event.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: dto.createMeetLink !== false ? 1 : 0,
        sendUpdates: dto.sendUpdates !== false ? 'all' : 'none',
      });

      this.logger.log(`Created calendar event ${response.data.id} for user ${userId}`);

      return this.mapEventToDto(response.data);
    } catch (error) {
      this.logger.error(`Failed to create calendar event: ${error.message}`);
      throw new InternalServerErrorException('Failed to create calendar event');
    }
  }

  /**
   * Update existing calendar event
   */
  async updateCalendarEvent(
    userId: number,
    eventId: string,
    dto: UpdateCalendarEventDto,
  ): Promise<CalendarEventResponseDto> {
    try {
      const calendar = await this.getCalendarClient(userId);

      const updateData: calendar_v3.Schema$Event = {};

      if (dto.summary) updateData.summary = dto.summary;
      if (dto.description) updateData.description = dto.description;
      if (dto.location) updateData.location = dto.location;

      if (dto.startTime) {
        updateData.start = {
          dateTime: dto.startTime,
          timeZone: dto.timeZone || 'UTC',
        };
      }

      if (dto.endTime) {
        updateData.end = {
          dateTime: dto.endTime,
          timeZone: dto.timeZone || 'UTC',
        };
      }

      if (dto.attendees) {
        updateData.attendees = dto.attendees.map((attendee) => ({
          email: attendee.email,
          displayName: attendee.displayName,
          optional: attendee.optional || false,
        }));
      }

      const response = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: updateData,
        sendUpdates: dto.sendUpdates !== false ? 'all' : 'none',
      });

      this.logger.log(`Updated calendar event ${eventId} for user ${userId}`);

      return this.mapEventToDto(response.data);
    } catch (error) {
      this.logger.error(`Failed to update calendar event: ${error.message}`);
      throw new InternalServerErrorException('Failed to update calendar event');
    }
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(userId: number, eventId: string): Promise<void> {
    try {
      const calendar = await this.getCalendarClient(userId);

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });

      this.logger.log(`Deleted calendar event ${eventId} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete calendar event: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete calendar event');
    }
  }

  /**
   * Get user availability (free/busy) for a date range
   */
  async getAvailability(
    userId: number,
    dto: GetAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    try {
      const calendar = await this.getCalendarClient(userId);

      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: dto.startDate,
          timeMax: dto.endDate,
          timeZone: dto.timeZone || 'UTC',
          items: [{ id: user.email }],
        },
      });

      const busySlots = response.data.calendars?.[user.email]?.busy || [];

      // Calculate available slots (inverse of busy slots)
      const availableSlots = this.calculateAvailableSlots(
        dto.startDate,
        dto.endDate,
        busySlots,
      );

      return {
        busy: busySlots.length > 0,
        availableSlots,
      };
    } catch (error) {
      this.logger.error(`Failed to get availability: ${error.message}`);
      throw new InternalServerErrorException('Failed to get availability');
    }
  }

  /**
   * Calculate available time slots from busy periods
   */
  private calculateAvailableSlots(
    startDate: string,
    endDate: string,
    busySlots: calendar_v3.Schema$TimePeriod[],
  ): AvailabilitySlotDto[] {
    const available: AvailabilitySlotDto[] = [];
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    if (busySlots.length === 0) {
      return [
        {
          startTime: startDate,
          endTime: endDate,
        },
      ];
    }

    // Sort busy slots by start time
    const sortedBusy = [...busySlots].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    let currentTime = startTime;

    for (const busy of sortedBusy) {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);

      // Add available slot before this busy period
      if (currentTime < busyStart) {
        available.push({
          startTime: currentTime.toISOString(),
          endTime: busyStart.toISOString(),
        });
      }

      currentTime = busyEnd > currentTime ? busyEnd : currentTime;
    }

    // Add final available slot if there's time after last busy period
    if (currentTime < endTime) {
      available.push({
        startTime: currentTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    }

    return available;
  }

  /**
   * Map Google Calendar event to DTO
   */
  private mapEventToDto(event: calendar_v3.Schema$Event): CalendarEventResponseDto {
    return {
      id: event.id,
      summary: event.summary,
      description: event.description,
      startTime: event.start?.dateTime || event.start?.date,
      endTime: event.end?.dateTime || event.end?.date,
      timeZone: event.start?.timeZone,
      meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === 'video',
      )?.uri,
      location: event.location,
      attendees: event.attendees?.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        optional: attendee.optional,
      })),
      status: event.status,
      htmlLink: event.htmlLink,
    };
  }

  /**
   * Check if user has connected Google Calendar
   */
  async isCalendarConnected(userId: number): Promise<boolean> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: { googleRefreshToken: true },
    });

    return !!user?.googleRefreshToken;
  }

  /**
   * Disconnect Google Calendar (remove refresh token)
   */
  async disconnectCalendar(userId: number): Promise<void> {
    await this.databaseService.user.update({
      where: { id: userId },
      data: { googleRefreshToken: null },
    });

    this.logger.log(`Disconnected Google Calendar for user ${userId}`);
  }
}
