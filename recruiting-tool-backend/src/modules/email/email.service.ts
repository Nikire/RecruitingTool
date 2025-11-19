import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

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

  private async sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@recruiting.com');
    const smtpEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';

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
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      }
    } else {
      // Development mode: log email to console
      this.logger.log(`
========== EMAIL (Development Mode) ==========
To: ${to}
From: ${emailFrom}
Subject: ${subject}
---
${text}
==============================================
      `);
    }
  }
}
