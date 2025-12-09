import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../shared/modules/database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, InterviewStatus } from '@prisma/client';

@Injectable()
export class InterviewReminderService {
  private readonly logger = new Logger(InterviewReminderService.name);

  // Track sent reminders to avoid duplicates (in-memory cache)
  // In production, this should be stored in a distributed cache (Redis)
  private sentReminders24h = new Set<number>();
  private sentReminders1h = new Set<number>();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Check for interviews needing reminders
   * Runs every 15 minutes
   */
  @Cron('0 */15 * * * *', {
    name: 'interview-reminders',
    timeZone: 'UTC',
  })
  async checkInterviewReminders(): Promise<void> {
    this.logger.log('Running interview reminder check...');

    try {
      await this.send24HourReminders();
      await this.send1HourReminders();
    } catch (error) {
      this.logger.error(`Error checking interview reminders: ${error.message}`, error.stack);
    }
  }

  /**
   * Send 24-hour reminders
   * Find interviews happening in 24-25 hours
   */
  private async send24HourReminders(): Promise<void> {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Find scheduled interviews in the 24-25 hour window
    const interviews = await this.databaseService.interview.findMany({
      where: {
        status: InterviewStatus.SCHEDULED,
        scheduledDate: {
          gte: in24Hours,
          lt: in25Hours,
        },
        deletedAt: null,
      },
      include: {
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: true,
                jobPosition: true,
              },
            },
          },
        },
        scheduledBy: true,
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Found ${interviews.length} interviews for 24-hour reminders`);

    for (const interview of interviews) {
      // Skip if already sent
      if (this.sentReminders24h.has(interview.id)) {
        continue;
      }

      try {
        const candidate = interview.stage.hiringProcess?.candidate;
        const jobPosition = interview.stage.hiringProcess?.jobPosition;

        if (!candidate || !jobPosition) {
          this.logger.warn(`Interview ${interview.uid} missing candidate or job position`);
          continue;
        }

        // Format date and time for notification
        const interviewDate = new Date(interview.scheduledDate!);
        const formattedDate = interviewDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Note: Candidates receive email reminders separately
        // This notification system is only for internal users (interviewers and schedulers)

        // Send notifications to all interviewers
        for (const interviewer of interview.interviewers) {
          await this.notificationsService.create({
            userUid: interviewer.user.uid,
            type: NotificationType.INTERVIEW_REMINDER_24H,
            title: 'Interview Tomorrow',
            message: `Reminder: Interview with ${candidate.name} for ${jobPosition.title} tomorrow at ${interview.scheduledTime}`,
            metadata: {
              interviewUid: interview.uid,
              candidateUid: candidate.uid,
              candidateName: candidate.name,
              jobPositionUid: jobPosition.uid,
              jobPositionTitle: jobPosition.title,
              scheduledDate: interview.scheduledDate?.toISOString(),
              scheduledTime: interview.scheduledTime,
              location: interview.location,
              meetingLink: interview.meetingLink,
              formattedDate,
            },
          });
          this.logger.log(`24h reminder sent to interviewer ${interviewer.user.name} for interview ${interview.uid}`);
        }

        // Send notification to the person who scheduled it
        if (interview.scheduledBy) {
          await this.notificationsService.create({
            userUid: interview.scheduledBy.uid,
            type: NotificationType.INTERVIEW_REMINDER_24H,
            title: 'Interview Tomorrow',
            message: `Reminder: Interview with ${candidate.name} for ${jobPosition.title} tomorrow at ${interview.scheduledTime}`,
            metadata: {
              interviewUid: interview.uid,
              candidateUid: candidate.uid,
              candidateName: candidate.name,
              jobPositionUid: jobPosition.uid,
              jobPositionTitle: jobPosition.title,
              scheduledDate: interview.scheduledDate?.toISOString(),
              scheduledTime: interview.scheduledTime,
              location: interview.location,
              meetingLink: interview.meetingLink,
              formattedDate,
            },
          });
          this.logger.log(`24h reminder sent to scheduler ${interview.scheduledBy.name} for interview ${interview.uid}`);
        }

        // Mark as sent
        this.sentReminders24h.add(interview.id);
      } catch (error) {
        this.logger.error(`Failed to send 24h reminder for interview ${interview.uid}: ${error.message}`);
      }
    }
  }

  /**
   * Send 1-hour reminders
   * Find interviews happening in 1-2 hours
   */
  private async send1HourReminders(): Promise<void> {
    const now = new Date();
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Find scheduled interviews in the 1-2 hour window
    const interviews = await this.databaseService.interview.findMany({
      where: {
        status: InterviewStatus.SCHEDULED,
        scheduledDate: {
          gte: in1Hour,
          lt: in2Hours,
        },
        deletedAt: null,
      },
      include: {
        stage: {
          include: {
            hiringProcess: {
              include: {
                candidate: true,
                jobPosition: true,
              },
            },
          },
        },
        scheduledBy: true,
        interviewers: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Found ${interviews.length} interviews for 1-hour reminders`);

    for (const interview of interviews) {
      // Skip if already sent
      if (this.sentReminders1h.has(interview.id)) {
        continue;
      }

      try {
        const candidate = interview.stage.hiringProcess?.candidate;
        const jobPosition = interview.stage.hiringProcess?.jobPosition;

        if (!candidate || !jobPosition) {
          this.logger.warn(`Interview ${interview.uid} missing candidate or job position`);
          continue;
        }

        // Note: Candidates receive email reminders separately
        // This notification system is only for internal users (interviewers and schedulers)

        // Send notifications to all interviewers
        for (const interviewer of interview.interviewers) {
          await this.notificationsService.create({
            userUid: interviewer.user.uid,
            type: NotificationType.INTERVIEW_REMINDER_1H,
            title: 'Interview Starting Soon',
            message: `Starting soon: Interview with ${candidate.name} for ${jobPosition.title} begins in 1 hour`,
            metadata: {
              interviewUid: interview.uid,
              candidateUid: candidate.uid,
              candidateName: candidate.name,
              jobPositionUid: jobPosition.uid,
              jobPositionTitle: jobPosition.title,
              scheduledDate: interview.scheduledDate?.toISOString(),
              scheduledTime: interview.scheduledTime,
              location: interview.location,
              meetingLink: interview.meetingLink,
            },
          });
          this.logger.log(`1h reminder sent to interviewer ${interviewer.user.name} for interview ${interview.uid}`);
        }

        // Send notification to the person who scheduled it
        if (interview.scheduledBy) {
          await this.notificationsService.create({
            userUid: interview.scheduledBy.uid,
            type: NotificationType.INTERVIEW_REMINDER_1H,
            title: 'Interview Starting Soon',
            message: `Starting soon: Interview with ${candidate.name} for ${jobPosition.title} begins in 1 hour`,
            metadata: {
              interviewUid: interview.uid,
              candidateUid: candidate.uid,
              candidateName: candidate.name,
              jobPositionUid: jobPosition.uid,
              jobPositionTitle: jobPosition.title,
              scheduledDate: interview.scheduledDate?.toISOString(),
              scheduledTime: interview.scheduledTime,
              location: interview.location,
              meetingLink: interview.meetingLink,
            },
          });
          this.logger.log(`1h reminder sent to scheduler ${interview.scheduledBy.name} for interview ${interview.uid}`);
        }

        // Mark as sent
        this.sentReminders1h.add(interview.id);
      } catch (error) {
        this.logger.error(`Failed to send 1h reminder for interview ${interview.uid}: ${error.message}`);
      }
    }
  }

  /**
   * Clean up old reminder tracking data (runs daily at midnight)
   * Prevents memory leaks from the in-memory sets
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanup-reminder-cache',
    timeZone: 'UTC',
  })
  async cleanupReminderCache(): Promise<void> {
    this.logger.log('Cleaning up reminder cache...');
    this.sentReminders24h.clear();
    this.sentReminders1h.clear();
    this.logger.log('Reminder cache cleared');
  }
}
