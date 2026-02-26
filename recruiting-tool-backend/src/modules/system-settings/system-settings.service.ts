import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../shared/modules/database/database.service';
import { EmailService } from '../email/email.service';
import { SystemSettingsResponseDto, UpdateSystemSettingsDto, TestEmailResponseDto } from './dto/system-settings.dto';

const APP_VERSION = '1.0.0';
const APPLICATION_EMAILS_KEY = 'email.applicationEmailsEnabled';

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async getSettings(): Promise<SystemSettingsResponseDto> {
    // Read applicationEmailsEnabled from DB override if present, fallback to env
    const dbOverride = await this.databaseService.systemConfig.findUnique({
      where: { key: APPLICATION_EMAILS_KEY },
    });

    const applicationEmailsEnabled =
      dbOverride !== null
        ? dbOverride.value === 'true'
        : this.configService.get<string>('ENABLE_APPLICATION_EMAILS', 'true') === 'true';

    return {
      email: {
        enabled: this.configService.get<string>('SMTP_ENABLED', 'false') === 'true',
        host: this.configService.get<string>('SMTP_HOST', ''),
        port: parseInt(this.configService.get<string>('SMTP_PORT', '465'), 10),
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@borderless.app'),
        applicationEmailsEnabled,
      },
      ai: {
        model: this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-flash'),
        tier: this.configService.get<string>('GEMINI_TIER', 'free'),
      },
      storage: {
        type: this.configService.get<string>('STORAGE_TYPE', 'minio'),
        bucket: this.configService.get<string>('S3_BUCKET_NAME', 'recruiting-tool'),
      },
      rateLimiting: {
        generalTtl: parseInt(this.configService.get<string>('THROTTLE_TTL', '60000'), 10),
        generalLimit: parseInt(this.configService.get<string>('THROTTLE_LIMIT', '100'), 10),
        authLimit: parseInt(this.configService.get<string>('THROTTLE_AUTH_LIMIT', '5'), 10),
        aiLimit: parseInt(this.configService.get<string>('THROTTLE_AI_LIMIT', '10'), 10),
      },
      backup: {
        enabled: this.configService.get<string>('BACKUP_ENABLED', 'false') === 'true',
        schedule: this.configService.get<string>('BACKUP_CRON', '0 2 * * *'),
        retentionDays: parseInt(this.configService.get<string>('BACKUP_RETENTION_DAYS', '30'), 10),
      },
      app: {
        environment: this.configService.get<string>('NODE_ENV', 'development'),
        version: APP_VERSION,
      },
    };
  }

  async updateSettings(dto: UpdateSystemSettingsDto): Promise<SystemSettingsResponseDto> {
    if (dto.applicationEmailsEnabled !== undefined) {
      await this.databaseService.systemConfig.upsert({
        where: { key: APPLICATION_EMAILS_KEY },
        update: { value: String(dto.applicationEmailsEnabled) },
        create: { key: APPLICATION_EMAILS_KEY, value: String(dto.applicationEmailsEnabled) },
      });
      this.logger.log(`System setting updated: ${APPLICATION_EMAILS_KEY} = ${dto.applicationEmailsEnabled}`);
    }

    return this.getSettings();
  }

  async testEmailConnection(superAdminEmail: string): Promise<TestEmailResponseDto> {
    try {
      const smtpEnabled = this.configService.get<string>('SMTP_ENABLED', 'false') === 'true';

      await this.emailService.sendTestConnectionEmail(superAdminEmail);

      if (!smtpEnabled) {
        return {
          success: true,
          message: `Test email logged to console (SMTP is disabled). Target: ${superAdminEmail}`,
        };
      }

      return {
        success: true,
        message: `Test email sent to ${superAdminEmail}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error.message}`);
      throw new InternalServerErrorException(`Failed to send test email: ${error.message}`);
    }
  }
}
