import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private prisma = new PrismaClient();

  constructor(private configService: ConfigService) {
    const smtpEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';

    if (smtpEnabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      });
    }
  }

  async sendApplicationConfirmation(applicantEmail: string, applicantName: string, jobTitle: string, applicationUid: string): Promise<void> {
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@recruiting.com');

    const subject = `Application Received: ${jobTitle}`;
    const text = `
Dear ${applicantName},

Thank you for applying for the position of ${jobTitle}.

We have successfully received your application (Reference: ${applicationUid}).

Our team will review your application and get back to you soon.

Best regards,
The Recruiting Team
    `.trim();

    const html = `
      <h2>Application Received</h2>
      <p>Dear ${applicantName},</p>
      <p>Thank you for applying for the position of <strong>${jobTitle}</strong>.</p>
      <p>We have successfully received your application.<br/>
      Reference: <code>${applicationUid}</code></p>
      <p>Our team will review your application and get back to you soon.</p>
      <br/>
      <p>Best regards,<br/>
      The Recruiting Team</p>
    `;

    await this.sendEmail(applicantEmail, subject, text, html);
  }

  async sendNewApplicationNotification(hrEmail: string, applicantName: string, jobTitle: string, applicationUid: string): Promise<void> {
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@recruiting.com');

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

    await this.sendEmail(hrEmail, subject, text, html);
  }

  async sendApplicationAcceptance(applicantEmail: string, applicantName: string, jobTitle: string): Promise<void> {
    const subject = `Congratulations: Your Application for ${jobTitle} Has Been Accepted`;
    const text = `
Dear ${applicantName},

Congratulations! We are pleased to inform you that your application for the position of ${jobTitle} has been accepted.

Our team will be in touch with you shortly with next steps.

Best regards,
The Recruiting Team
    `.trim();

    const html = `
      <h2>Congratulations!</h2>
      <p>Dear ${applicantName},</p>
      <p>We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>accepted</strong>.</p>
      <p>Our team will be in touch with you shortly with next steps.</p>
      <br/>
      <p>Best regards,<br/>
      The Recruiting Team</p>
    `;

    await this.sendEmail(applicantEmail, subject, text, html);
  }

  async sendApplicationUnderReview(applicantEmail: string, applicantName: string, jobTitle: string, applicationUid: string): Promise<void> {
    const subject = `Your Application for ${jobTitle} is Under Review`;
    const text = `
Dear ${applicantName},

Thank you for applying to ${jobTitle}. We wanted to let you know that your application is now under review by our team.

We appreciate your interest and patience. You will hear from us soon with an update on your application status.

Reference: ${applicationUid}

Best regards,
The Recruiting Team
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
      The Recruiting Team</p>
    `;

    await this.sendEmail(applicantEmail, subject, text, html, 'STATUS_CHANGE', applicationUid);
  }

  async sendApplicationRejection(applicantEmail: string, applicantName: string, jobTitle: string, applicationUid: string): Promise<void> {
    const subject = `Update on Your Application for ${jobTitle}`;
    const text = `
Dear ${applicantName},

Thank you for applying to the position of ${jobTitle}. We have carefully reviewed your application and have decided to move forward with other candidates at this time.

We appreciate the time you invested in our application process and encourage you to apply for other positions that may be a better match for your skills and experience.

Reference: ${applicationUid}

Best regards,
The Recruiting Team
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
      The Recruiting Team</p>
    `;

    await this.sendEmail(applicantEmail, subject, text, html, 'STATUS_CHANGE', applicationUid);
  }

  private async sendEmail(to: string, subject: string, text: string, html: string, emailType: string = 'GENERAL', relatedEntityId?: string): Promise<void> {
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@recruiting.com');
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
  }
}
