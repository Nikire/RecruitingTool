import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { EmailService } from '../../email/email.service';

@Injectable()
export class EmailHealthIndicator extends HealthIndicator {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isConfigured = this.emailService.isConfigured();

      if (isConfigured) {
        return this.getStatus(key, true, {
          message: 'Email service is configured',
          smtp_enabled: process.env.SMTP_ENABLED === 'true',
        });
      } else {
        return this.getStatus(key, false, {
          message: 'Email service is not configured',
          smtp_enabled: false,
        });
      }
    } catch (error) {
      return this.getStatus(key, false, {
        message: `Email service check failed: ${error.message}`,
      });
    }
  }
}
