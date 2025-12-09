import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../shared/modules/database/database.service';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { CalendarProvider } from '@prisma/client';
import { CalendarConnectionResponseDto, ConnectionStatusDto } from './dto/calendar-connection.dto';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private oauth2Client: OAuth2Client;
  private readonly scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
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

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Generate OAuth2 authorization URL for Google Calendar
   * @param userId - User ID requesting authorization
   * @returns Authorization URL
   */
  getGoogleAuthUrl(userId: number): string {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state: userId.toString(), // Pass userId in state for callback
      prompt: 'consent', // Force consent screen to always get refresh token
    });

    this.logger.log(`Generated Google OAuth URL for user ${userId}`);
    return authUrl;
  }

  /**
   * Handle Google OAuth callback and store connection
   * @param code - Authorization code from Google
   * @param userId - User ID from state parameter
   */
  async handleGoogleCallback(code: string, userId: number): Promise<void> {
    try {
      // Exchange authorization code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.refresh_token) {
        throw new BadRequestException(
          'No refresh token received. User may have already authorized. Please revoke access and try again.',
        );
      }

      // Get user email from Google
      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      if (!userInfo.data.email) {
        throw new BadRequestException('Could not retrieve email from Google');
      }

      // Calculate token expiry (Google tokens expire in 1 hour)
      const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

      // Upsert calendar connection
      await this.databaseService.calendarConnection.upsert({
        where: {
          userId_provider: {
            userId,
            provider: CalendarProvider.GOOGLE,
          },
        },
        update: {
          accessToken: tokens.access_token || null,
          refreshToken: tokens.refresh_token,
          tokenExpiry,
          email: userInfo.data.email,
          updatedAt: new Date(),
        },
        create: {
          userId,
          provider: CalendarProvider.GOOGLE,
          accessToken: tokens.access_token || null,
          refreshToken: tokens.refresh_token,
          tokenExpiry,
          email: userInfo.data.email,
        },
      });

      this.logger.log(`Stored Google Calendar connection for user ${userId}`);
    } catch (error) {
      this.logger.error(`Google OAuth callback error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to complete Google Calendar authorization');
    }
  }

  /**
   * Get valid access token for user (refresh if needed)
   * @param userId - User ID
   * @returns Valid access token
   */
  async getAccessToken(userId: number): Promise<string> {
    const connection = await this.databaseService.calendarConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: CalendarProvider.GOOGLE,
        },
      },
    });

    if (!connection) {
      throw new BadRequestException(
        'User has not connected Google Calendar. Please authorize first.',
      );
    }

    // Check if access token is still valid (with 5 minute buffer)
    const now = new Date();
    const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    if (connection.tokenExpiry && connection.tokenExpiry > expiryBuffer && connection.accessToken) {
      // Token is still valid, return it
      return connection.accessToken;
    }

    // Token expired or about to expire, refresh it
    this.oauth2Client.setCredentials({
      refresh_token: connection.refreshToken,
    });

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      // Update stored tokens
      const newTokenExpiry = credentials.expiry_date ? new Date(credentials.expiry_date) : null;

      await this.databaseService.calendarConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || connection.refreshToken, // Keep old refresh token if new one not provided
          tokenExpiry: newTokenExpiry,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Refreshed access token for user ${userId}`);

      return credentials.access_token;
    } catch (error) {
      this.logger.error(`Failed to refresh access token for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to authenticate with Google Calendar. Please re-authorize.',
      );
    }
  }

  /**
   * Get calendar connection status
   * @param userId - User ID
   * @returns Connection status
   */
  async getConnectionStatus(userId: number): Promise<ConnectionStatusDto> {
    const connection = await this.databaseService.calendarConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: CalendarProvider.GOOGLE,
        },
      },
      select: {
        uid: true,
        provider: true,
        email: true,
        tokenExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!connection) {
      return { connected: false };
    }

    return {
      connected: true,
      connection: {
        uid: connection.uid,
        provider: connection.provider,
        email: connection.email,
        tokenExpiry: connection.tokenExpiry,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      },
    };
  }

  /**
   * Disconnect calendar (delete connection)
   * @param userId - User ID
   */
  async disconnectCalendar(userId: number): Promise<void> {
    const connection = await this.databaseService.calendarConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: CalendarProvider.GOOGLE,
        },
      },
    });

    if (!connection) {
      throw new NotFoundException('Calendar connection not found');
    }

    // Optionally revoke token with Google (best practice)
    try {
      this.oauth2Client.setCredentials({
        refresh_token: connection.refreshToken,
      });
      await this.oauth2Client.revokeCredentials();
      this.logger.log(`Revoked Google credentials for user ${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to revoke Google credentials: ${error.message}`);
      // Continue with deletion even if revoke fails
    }

    // Delete connection from database
    await this.databaseService.calendarConnection.delete({
      where: { id: connection.id },
    });

    this.logger.log(`Disconnected Google Calendar for user ${userId}`);
  }

  /**
   * Check if user has connected Google Calendar
   * @param userId - User ID
   * @returns True if connected
   */
  async isCalendarConnected(userId: number): Promise<boolean> {
    const connection = await this.databaseService.calendarConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: CalendarProvider.GOOGLE,
        },
      },
    });

    return !!connection;
  }
}
