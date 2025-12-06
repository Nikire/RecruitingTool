import { Injectable, Logger } from '@nestjs/common';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { DatabaseService } from '../shared/modules/database/database.service';
import { Interview, User } from '@prisma/client';

/**
 * Service responsible for syncing interviews with Google Calendar
 * Handles calendar event creation, updates, and deletions
 */
@Injectable()
export class InterviewCalendarService {
  private readonly logger = new Logger(InterviewCalendarService.name);

  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Create Google Calendar event for a new interview
   * @param interview - The interview to create a calendar event for
   * @param scheduledBy - The user who scheduled the interview
   * @returns Object with calendar event ID and Meet link, or null if calendar not connected or creation failed
   */
  async createCalendarEvent(
    interview: Interview & {
      stage: {
        title: string;
        hiringProcess: {
          title: string;
          candidate: {
            name: string;
            email: string;
          };
        };
      };
    },
    scheduledBy: User,
  ): Promise<{ id: string; meetLink?: string } | null> {
    try {
      // Check if user has connected Google Calendar
      const isCalendarConnected = await this.googleCalendarService.isCalendarConnected(scheduledBy.id);

      if (!isCalendarConnected) {
        this.logger.log(`User ${scheduledBy.uid} has not connected Google Calendar, skipping event creation`);
        return null;
      }

      // Only create event if interview is scheduled with date and time
      if (!interview.scheduledDate || !interview.scheduledTime) {
        this.logger.log(`Interview ${interview.uid} not scheduled, skipping calendar event creation`);
        return null;
      }

      // Parse date and time to create ISO datetime strings
      const startDateTime = this.combineDateTime(interview.scheduledDate, interview.scheduledTime);
      const endDateTime = this.calculateEndTime(startDateTime, interview.duration || 60);

      // Get interviewers to add as attendees
      const interviewers = await this.databaseService.interviewInterviewer.findMany({
        where: { interviewId: interview.id },
        include: { user: true },
      });

      const attendees = [
        {
          email: interview.stage.hiringProcess.candidate.email,
          displayName: interview.stage.hiringProcess.candidate.name,
        },
        ...interviewers.map((interviewer) => ({
          email: interviewer.user.email,
          displayName: interviewer.user.name,
        })),
      ];

      // Create calendar event with Google Meet link if no meeting link provided
      const calendarEvent = await this.googleCalendarService.createCalendarEvent(scheduledBy.id, {
        summary: `Interview: ${interview.stage.hiringProcess.title}`,
        description: this.buildEventDescription(interview, interview.stage.hiringProcess.candidate.name, interview.stage.title),
        startTime: startDateTime,
        endTime: endDateTime,
        location: interview.location || undefined,
        attendees,
        createMeetLink: !interview.meetingLink, // Only create Meet link if no meeting link provided
      });

      this.logger.log(`Created Google Calendar event ${calendarEvent.id} for interview ${interview.uid}`);

      // Return both event ID and Meet link (if generated)
      return {
        id: calendarEvent.id,
        meetLink: calendarEvent.meetLink,
      };
    } catch (error) {
      // Log error but don't throw - calendar sync failures should not block interview operations
      this.logger.error(`Failed to create Google Calendar event for interview ${interview.uid}: ${error.message}`);
      return null;
    }
  }

  /**
   * Update existing Google Calendar event
   * @param interview - The updated interview
   * @param scheduledBy - The user who scheduled the interview
   * @returns True if update succeeded, false otherwise
   */
  async updateCalendarEvent(
    interview: Interview & {
      stage: {
        title: string;
        hiringProcess: {
          title: string;
          candidate: {
            name: string;
            email: string;
          };
        };
      };
    },
    scheduledBy: User,
  ): Promise<boolean> {
    try {
      // Skip if no calendar event ID stored
      if (!interview.calendarEventId) {
        this.logger.log(`Interview ${interview.uid} has no calendar event ID, skipping update`);
        return false;
      }

      // Check if user has connected Google Calendar
      const isCalendarConnected = await this.googleCalendarService.isCalendarConnected(scheduledBy.id);

      if (!isCalendarConnected) {
        this.logger.log(`User ${scheduledBy.uid} has not connected Google Calendar, skipping event update`);
        return false;
      }

      // Skip if interview not scheduled
      if (!interview.scheduledDate || !interview.scheduledTime) {
        this.logger.log(`Interview ${interview.uid} not scheduled, skipping calendar event update`);
        return false;
      }

      const startDateTime = this.combineDateTime(interview.scheduledDate, interview.scheduledTime);
      const endDateTime = this.calculateEndTime(startDateTime, interview.duration || 60);

      // Get interviewers to update attendees
      const interviewers = await this.databaseService.interviewInterviewer.findMany({
        where: { interviewId: interview.id },
        include: { user: true },
      });

      const attendees = [
        {
          email: interview.stage.hiringProcess.candidate.email,
          displayName: interview.stage.hiringProcess.candidate.name,
        },
        ...interviewers.map((interviewer) => ({
          email: interviewer.user.email,
          displayName: interviewer.user.name,
        })),
      ];

      await this.googleCalendarService.updateCalendarEvent(scheduledBy.id, interview.calendarEventId, {
        summary: `Interview: ${interview.stage.hiringProcess.title}`,
        description: this.buildEventDescription(interview, interview.stage.hiringProcess.candidate.name, interview.stage.title),
        startTime: startDateTime,
        endTime: endDateTime,
        location: interview.location || undefined,
        attendees,
      });

      this.logger.log(`Updated Google Calendar event ${interview.calendarEventId} for interview ${interview.uid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update Google Calendar event for interview ${interview.uid}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete Google Calendar event for a cancelled interview
   * @param interview - The interview to delete calendar event for
   * @param scheduledBy - The user who scheduled the interview
   * @returns True if deletion succeeded, false otherwise
   */
  async deleteCalendarEvent(interview: Interview, scheduledBy: User): Promise<boolean> {
    try {
      // Skip if no calendar event ID stored
      if (!interview.calendarEventId) {
        this.logger.log(`Interview ${interview.uid} has no calendar event ID, skipping deletion`);
        return false;
      }

      // Check if user has connected Google Calendar
      const isCalendarConnected = await this.googleCalendarService.isCalendarConnected(scheduledBy.id);

      if (!isCalendarConnected) {
        this.logger.log(`User ${scheduledBy.uid} has not connected Google Calendar, skipping event deletion`);
        return false;
      }

      await this.googleCalendarService.deleteCalendarEvent(scheduledBy.id, interview.calendarEventId);

      this.logger.log(`Deleted Google Calendar event ${interview.calendarEventId} for interview ${interview.uid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete Google Calendar event for interview ${interview.uid}: ${error.message}`);
      return false;
    }
  }

  /**
   * Sync attendees when interviewers are added/removed
   * @param interview - The interview to sync attendees for
   * @param scheduledBy - The user who scheduled the interview
   * @returns True if sync succeeded, false otherwise
   */
  async syncAttendees(
    interview: Interview & {
      stage: {
        title: string;
        hiringProcess: {
          title: string;
          candidate: {
            name: string;
            email: string;
          };
        };
      };
    },
    scheduledBy: User,
  ): Promise<boolean> {
    // Attendee sync is handled by updateCalendarEvent
    return this.updateCalendarEvent(interview, scheduledBy);
  }

  /**
   * Build event description with interview details
   */
  private buildEventDescription(interview: Interview, candidateName: string, stageTitle: string): string {
    const parts = [
      `Interview with ${candidateName}`,
      `Stage: ${stageTitle}`,
    ];

    if (interview.notes) {
      parts.push('', `Notes: ${interview.notes}`);
    }

    return parts.join('\n');
  }

  /**
   * Combine date and time strings into ISO datetime
   */
  private combineDateTime(date: Date | string, time: string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return dateObj.toISOString();
  }

  /**
   * Calculate end time by adding duration minutes
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const endDate = new Date(startTime);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    return endDate.toISOString();
  }
}
