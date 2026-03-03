import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, NotificationType } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import {
  interviewScheduledTemplate,
  InterviewScheduledData,
  interviewReminderTemplate,
  InterviewReminderData,
  interviewCancelledTemplate,
  InterviewCancelledData,
  interviewRescheduledTemplate,
  InterviewRescheduledData,
  applicationReceivedTemplate,
  ApplicationReceivedData,
  applicationStatusUpdateTemplate,
  ApplicationStatusUpdateData,
  passwordResetTemplate,
  PasswordResetData,
  welcomeTemplate,
  WelcomeData,
  teamInvitationTemplate,
  TeamInvitationData,
} from './templates';
import { NotificationsService } from '../notifications/notifications.service';
import { DatabaseService } from '../shared/modules/database/database.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private prisma = new PrismaClient();

  // Email type to notification type mapping
  private readonly emailToNotificationTypeMap: Record<string, NotificationType> = {
    APPLICATION_CONFIRMATION: NotificationType.APPLICATION_SUBMITTED,
    HR_NOTIFICATION: NotificationType.APPLICATION_RECEIVED,
    APPLICATION_ACCEPTED: NotificationType.APPLICATION_ACCEPTED,
    APPLICATION_RECEIVED: NotificationType.APPLICATION_RECEIVED,
    STATUS_CHANGE: NotificationType.APPLICATION_STATUS,
    INTERVIEW_SCHEDULED: NotificationType.INTERVIEW_SCHEDULED,
    INTERVIEW_CANCELLED: NotificationType.INTERVIEW_CANCELLED,
    INTERVIEW_REMINDER: NotificationType.INTERVIEW_REMINDER_24H,
    INTERVIEW_RESCHEDULED: NotificationType.INTERVIEW_RESCHEDULED,
    PASSWORD_RESET: NotificationType.ACCOUNT_PASSWORD_CHANGED,
    WELCOME: NotificationType.ACCOUNT_WELCOME,
    TEAM_INVITATION: NotificationType.TEAM_INVITATION_SENT,
  };

  constructor(
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private databaseService: DatabaseService,
  ) {
    const smtpEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';

    if (smtpEnabled) {
      const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      });
    }
  }

  async sendApplicationConfirmation(applicantEmail: string, applicantName: string, jobTitle: string, applicationUid: string, companyName?: string): Promise<void> {
    const emailsEnabled = this.configService.get<string>('ENABLE_APPLICATION_EMAILS', 'true') === 'true';

    if (!emailsEnabled) {
      this.logger.log(`Application emails disabled - skipping confirmation email for ${applicantEmail}`);
      return;
    }

    const teamName = companyName ? `${companyName} Team` : 'The Borderless Team';

    const subject = `Application Received: ${jobTitle}`;
    const text = `
Dear ${applicantName},

Thank you for applying for the position of ${jobTitle}${companyName ? ` at ${companyName}` : ''}.

We have successfully received your application (Reference: ${applicationUid}).

Our team will review your application and get back to you soon.

Best regards,
${teamName}
    `.trim();

    const html = `
      <h2>Application Received</h2>
      <p>Dear ${applicantName},</p>
      <p>Thank you for applying for the position of <strong>${jobTitle}</strong>${companyName ? ` at <strong>${companyName}</strong>` : ''}.</p>
      <p>We have successfully received your application.<br/>
      Reference: <code>${applicationUid}</code></p>
      <p>Our team will review your application and get back to you soon.</p>
      <br/>
      <p>Best regards,<br/>
      ${teamName}</p>
    `;

    this.logger.log(`Sending application confirmation email to ${applicantEmail} for ${jobTitle}`);
    await this.sendEmail(applicantEmail, subject, text, html, 'APPLICATION_CONFIRMATION', applicationUid);
  }

  async sendNewApplicationNotification(hrEmail: string, applicantName: string, jobTitle: string, applicationUid: string): Promise<void> {
    const emailsEnabled = this.configService.get<string>('ENABLE_APPLICATION_EMAILS', 'true') === 'true';

    if (!emailsEnabled) {
      this.logger.log(`Application emails disabled - skipping HR notification for ${hrEmail}`);
      return;
    }

    const subject = `New Application: ${jobTitle}`;
    const text = `
New Application Received

Applicant: ${applicantName}
Position: ${jobTitle}
Application Reference: ${applicationUid}

Please log in to the admin panel to review this application.
    `.trim();

    const html = `
      <h2>New Application Received</h2>
      <p><strong>Applicant:</strong> ${applicantName}</p>
      <p><strong>Position:</strong> ${jobTitle}</p>
      <p><strong>Application Reference:</strong> <code>${applicationUid}</code></p>
      <br/>
      <p>Please log in to the admin panel to review this application.</p>
    `;

    this.logger.log(`Sending HR notification to ${hrEmail} for new application by ${applicantName}`);
    await this.sendEmail(hrEmail, subject, text, html, 'HR_NOTIFICATION', applicationUid);
  }

  async sendApplicationAcceptance(applicantEmail: string, applicantName: string, jobTitle: string): Promise<void> {
    const emailsEnabled = this.configService.get<string>('ENABLE_APPLICATION_EMAILS', 'true') === 'true';

    if (!emailsEnabled) {
      this.logger.log(`Application emails disabled - skipping acceptance email for ${applicantEmail}`);
      return;
    }

    const subject = `Congratulations: Your Application for ${jobTitle} Has Been Accepted`;
    const text = `
Dear ${applicantName},

Congratulations! We are pleased to inform you that your application for the position of ${jobTitle} has been accepted.

Our team will be in touch with you shortly with next steps.

Best regards,
The Borderless Team
    `.trim();

    const html = `
      <h2>Congratulations!</h2>
      <p>Dear ${applicantName},</p>
      <p>We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>accepted</strong>.</p>
      <p>Our team will be in touch with you shortly with next steps.</p>
      <br/>
      <p>Best regards,<br/>
      The Borderless Team</p>
    `;

    this.logger.log(`Sending acceptance email to ${applicantEmail} for ${jobTitle}`);
    await this.sendEmail(applicantEmail, subject, text, html, 'APPLICATION_ACCEPTED');
  }

  async sendApplicationUnderReview(applicantEmail: string, applicantName: string, jobTitle: string, applicationUid: string): Promise<void> {
    const emailsEnabled = this.configService.get<string>('ENABLE_APPLICATION_EMAILS', 'true') === 'true';

    if (!emailsEnabled) {
      this.logger.log(`Application emails disabled - skipping review email for ${applicantEmail}`);
      return;
    }

    const subject = `Your Application for ${jobTitle} is Under Review`;
    const text = `
Dear ${applicantName},

Thank you for applying to ${jobTitle}. We wanted to let you know that your application is now under review by our team.

We appreciate your interest and patience. You will hear from us soon with an update on your application status.

Reference: ${applicationUid}

Best regards,
The Borderless Team
    `.trim();

    const html = `
      <h2>Application Under Review</h2>
      <p>Dear ${applicantName},</p>
      <p>Thank you for applying to <strong>${jobTitle}</strong>.</p>
      <p>We wanted to let you know that your application is now <strong>under review</strong> by our team.</p>
      <p>We appreciate your interest and patience. You will hear from us soon with an update on your application status.</p>
      <p><small>Reference: <code>${applicationUid}</code></small></p>
      <br/>
      <p>Best regards,<br/>
      The Borderless Team</p>
    `;

    this.logger.log(`Sending review notification to ${applicantEmail} for ${jobTitle}`);
    await this.sendEmail(applicantEmail, subject, text, html, 'STATUS_CHANGE', applicationUid);
  }

  async sendApplicationRejection(applicantEmail: string, applicantName: string, jobTitle: string, applicationUid: string): Promise<void> {
    const emailsEnabled = this.configService.get<string>('ENABLE_APPLICATION_EMAILS', 'true') === 'true';

    if (!emailsEnabled) {
      this.logger.log(`Application emails disabled - skipping rejection email for ${applicantEmail}`);
      return;
    }

    const subject = `Update on Your Application for ${jobTitle}`;
    const text = `
Dear ${applicantName},

Thank you for applying to the position of ${jobTitle}. We have carefully reviewed your application and have decided to move forward with other candidates at this time.

We appreciate the time you invested in our application process and encourage you to apply for other positions that may be a better match for your skills and experience.

Reference: ${applicationUid}

Best regards,
The Borderless Team
    `.trim();

    const html = `
      <h2>Application Update</h2>
      <p>Dear ${applicantName},</p>
      <p>Thank you for applying to the position of <strong>${jobTitle}</strong>.</p>
      <p>We have carefully reviewed your application and have decided to move forward with other candidates at this time.</p>
      <p>We appreciate the time you invested in our application process and encourage you to apply for other positions that may be a better match for your skills and experience.</p>
      <p><small>Reference: <code>${applicationUid}</code></small></p>
      <br/>
      <p>Best regards,<br/>
      The Borderless Team</p>
    `;

    this.logger.log(`Sending rejection notification to ${applicantEmail} for ${jobTitle}`);
    await this.sendEmail(applicantEmail, subject, text, html, 'STATUS_CHANGE', applicationUid);
  }

  async sendInterviewScheduled(candidate: any, hr: any, interview: any): Promise<void> {
    const templateData: InterviewScheduledData = {
      candidateName: candidate.name,
      jobPosition: interview.jobPosition || 'Position',
      date: interview.scheduledDate || new Date(),
      time: interview.scheduledTime || 'TBD',
      duration: interview.duration,
      location: interview.location,
      meetingLink: interview.meetingLink,
      interviewers: hr.name ? [hr.name] : [],
      notes: interview.notes,
      hrName: hr.name,
    };

    const { subject, text, html } = interviewScheduledTemplate(templateData);
    await this.sendEmail(candidate.email, subject, text, html, 'INTERVIEW_SCHEDULED', interview.uid);
  }

  async sendInterviewCancelled(candidate: any, hr: any, interview: any, reason?: string): Promise<void> {
    const templateData: InterviewCancelledData = {
      candidateName: candidate.name,
      jobPosition: interview.jobPosition || 'Position',
      date: interview.scheduledDate || new Date(),
      time: interview.scheduledTime || 'TBD',
      reason,
      hrName: hr.name,
      willReschedule: true,
    };

    const { subject, text, html } = interviewCancelledTemplate(templateData);
    await this.sendEmail(candidate.email, subject, text, html, 'INTERVIEW_CANCELLED', interview.uid);
  }

  async sendInterviewReminder(candidate: any, hr: any, interview: any, reminderType: 'tomorrow' | 'today' | '1hour' = 'tomorrow'): Promise<void> {
    const templateData: InterviewReminderData = {
      candidateName: candidate.name,
      jobPosition: interview.jobPosition || 'Position',
      date: interview.scheduledDate || new Date(),
      time: interview.scheduledTime || 'TBD',
      duration: interview.duration,
      location: interview.location,
      meetingLink: interview.meetingLink,
      interviewers: hr.name ? [hr.name] : [],
      notes: interview.notes,
      reminderType,
    };

    const { subject, text, html } = interviewReminderTemplate(templateData);
    await this.sendEmail(candidate.email, subject, text, html, 'INTERVIEW_REMINDER', interview.uid);
  }

  private async sendEmail(to: string, subject: string, text: string, html: string, emailType: string = 'GENERAL', relatedEntityId?: string): Promise<void> {
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@borderlessats.com');
    const smtpEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';
    let status = 'SENT';

    if (smtpEnabled && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: emailFrom,
          to,
          subject,
          text,
          html,
        });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } catch (error) {
        status = 'FAILED';
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      }
    } else {
      // Development mode: log email to console
      this.logger.log(`
========== EMAIL (Development Mode) ==========
To: ${to}
From: ${emailFrom}
Subject: ${subject}
Email Type: ${emailType}
---
${text}
==============================================
      `);
    }

    // Log the email to database
    try {
      await this.prisma.emailLog.create({
        data: {
          recipientEmail: to,
          recipientName: 'Unknown',
          subject,
          template: html,
          status,
          emailType,
          relatedEntity: 'Application',
          relatedEntityId: relatedEntityId || null,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to log email to database: ${error.message}`);
    }

    // Mirror email as notification if recipient is a registered user
    await this.mirrorEmailAsNotification(to, subject, text, emailType, relatedEntityId);
  }

  /**
   * Create a notification for a user if they have an account
   * This mirrors important emails as in-app notifications
   */
  private async mirrorEmailAsNotification(recipientEmail: string, subject: string, message: string, emailType: string, relatedEntityId?: string): Promise<void> {
    try {
      // Check if the recipient email belongs to a user account
      // Use findFirst since email is not unique alone (email + companyId is unique)
      const user = await this.databaseService.user.findFirst({
        where: { email: recipientEmail, isActive: true },
      });

      if (!user) {
        // No user account found, skip notification creation
        this.logger.debug(`No user account found for ${recipientEmail}, skipping notification`);
        return;
      }

      // Map email type to notification type
      const notificationType = this.emailToNotificationTypeMap[emailType];

      if (!notificationType) {
        this.logger.debug(`No notification type mapping for email type: ${emailType}`);
        return;
      }

      // Create notification metadata with relatedEntityId for navigation
      const metadata: any = {};
      if (relatedEntityId) {
        metadata.relatedEntityId = relatedEntityId;
      }

      // Create the notification
      await this.notificationsService.create({
        userUid: user.uid,
        type: notificationType,
        title: subject,
        message: message.replace(/\n/g, ' ').substring(0, 500), // Clean message and limit length
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });

      this.logger.log(`Notification created for user ${user.uid} (${recipientEmail}) - Type: ${notificationType}`);
    } catch (error) {
      // Don't fail email sending if notification creation fails
      this.logger.warn(`Failed to create notification for ${recipientEmail}: ${error.message}`);
    }
  }

  /**
   * Send interview rescheduled notification
   */
  async sendInterviewRescheduled(candidateEmail: string, data: InterviewRescheduledData, interviewUid: string): Promise<void> {
    const { subject, text, html } = interviewRescheduledTemplate(data);
    await this.sendEmail(candidateEmail, subject, text, html, 'INTERVIEW_RESCHEDULED', interviewUid);
  }

  /**
   * Send application received confirmation (template-based version)
   */
  async sendApplicationReceivedV2(candidateEmail: string, data: ApplicationReceivedData): Promise<void> {
    const { subject, text, html } = applicationReceivedTemplate(data);
    await this.sendEmail(candidateEmail, subject, text, html, 'APPLICATION_RECEIVED', data.applicationUid);
  }

  /**
   * Send application status update notification
   */
  async sendApplicationStatusUpdateV2(candidateEmail: string, data: ApplicationStatusUpdateData): Promise<void> {
    const { subject, text, html } = applicationStatusUpdateTemplate(data);
    await this.sendEmail(candidateEmail, subject, text, html, 'STATUS_CHANGE', data.applicationUid);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(userEmail: string, data: PasswordResetData): Promise<void> {
    const { subject, text, html } = passwordResetTemplate(data);
    await this.sendEmail(userEmail, subject, text, html, 'PASSWORD_RESET');
  }

  /**
   * Send email verification email with verification link
   */
  async sendVerificationEmail(to: string, verificationLink: string): Promise<void> {
    const subject = 'Verify your email address';
    const text = `
Please verify your email address

Click the link below to verify your email address:
${verificationLink}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Verify your email address</h2>
        <p>Thank you for registering. Please click the button below to verify your email address.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationLink}"
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationLink}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(to, subject, text, html, 'EMAIL_VERIFICATION');
  }

  /**
   * Send password reset email with reset link
   */
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const data: PasswordResetData = {
      userName: to,
      resetLink,
      expirationTime: '1 hour',
    };
    const { subject, text, html } = passwordResetTemplate(data);
    await this.sendEmail(to, subject, text, html, 'PASSWORD_RESET');
  }

  /**
   * Send welcome email for new users
   */
  async sendWelcomeEmail(userEmail: string, data: WelcomeData): Promise<void> {
    const { subject, text, html } = welcomeTemplate(data);
    await this.sendEmail(userEmail, subject, text, html, 'WELCOME');
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitation(recipientEmail: string, data: TeamInvitationData): Promise<void> {
    const { subject, text, html } = teamInvitationTemplate(data);
    await this.sendEmail(recipientEmail, subject, text, html, 'TEAM_INVITATION');
    this.logger.log(`Team invitation sent to ${recipientEmail} for ${data.companyName}`);
  }

  /**
   * Send email using a template from database
   * Renders the template with provided variables using Handlebars
   */
  async sendEmailFromTemplate(recipientEmail: string, recipientName: string, templateUid: string, variables: Record<string, any>, relatedEntityId?: string): Promise<void> {
    // Fetch the email template from database
    const emailTemplate = await this.prisma.emailTemplate.findUnique({
      where: { uid: templateUid },
    });

    if (!emailTemplate) {
      throw new NotFoundException(`Email template ${templateUid} not found`);
    }

    // Render subject and body with Handlebars
    const subjectTemplate = Handlebars.compile(emailTemplate.subject);
    const bodyTemplate = Handlebars.compile(emailTemplate.body);

    const renderedSubject = subjectTemplate(variables);
    const renderedBody = bodyTemplate(variables);

    // Convert rendered body to HTML (preserve line breaks)
    const htmlBody = renderedBody.replace(/\n/g, '<br>');

    await this.sendEmail(recipientEmail, renderedSubject, renderedBody, htmlBody, 'TEMPLATE_EMAIL', relatedEntityId);

    this.logger.log(`Email sent using template "${emailTemplate.name}" to ${recipientEmail}`);
  }

  /**
   * Send a test connection email to the given address
   * Used by system settings to verify SMTP is working
   */
  async sendTestConnectionEmail(recipientEmail: string): Promise<void> {
    const subject = 'Borderless Admin — Test Email Connection';
    const text = `
This is a test email from the Borderless admin panel.

If you received this, your email configuration is working correctly.
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Test Email Connection</h2>
        <p>This is a test email from the <strong>Borderless</strong> admin panel.</p>
        <p>If you received this, your email configuration is working correctly.</p>
        <p style="color: #999; font-size: 12px; margin-top: 32px;">Sent from Borderless System Settings</p>
      </div>
    `;

    await this.sendEmail(recipientEmail, subject, text, html, 'SYSTEM_TEST');
  }

  /**
   * Check if email service is properly configured
   * Used by health check endpoints to verify email service availability
   * @returns boolean - true if email service is configured
   */
  isConfigured(): boolean {
    const smtpEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';

    if (smtpEnabled) {
      // Check if SMTP configuration is complete
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      const smtpPort = this.configService.get<number>('SMTP_PORT');
      const smtpUser = this.configService.get<string>('SMTP_USER');
      const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

      return !!(smtpHost && smtpPort && smtpUser && smtpPassword);
    }

    // Email service works in development mode (logs to console)
    return true;
  }
}
