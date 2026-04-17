import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../shared/modules/database/database.service';
import { EmailService } from '../email/email.service';
import {
  SystemSettingsResponseDto,
  UpdateSystemSettingsDto,
  TestEmailResponseDto,
  EmailStatsResponseDto,
  EmailStatsPeriodDto,
  EmailLogItemDto,
  PaginatedEmailLogsDto,
} from './dto/system-settings.dto';

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

    const applicationEmailsEnabled = dbOverride !== null ? dbOverride.value === 'true' : this.configService.get<string>('ENABLE_APPLICATION_EMAILS', 'true') === 'true';

    return {
      email: {
        enabled: this.configService.get<string>('SMTP_ENABLED', 'false') === 'true',
        host: this.configService.get<string>('SMTP_HOST', ''),
        port: parseInt(this.configService.get<string>('SMTP_PORT', '465'), 10),
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@borderlessats.com'),
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
        general: {
          ttl: parseInt(this.configService.get<string>('THROTTLE_TTL', '60000'), 10),
          limit: parseInt(this.configService.get<string>('THROTTLE_LIMIT', '100'), 10),
        },
        auth: {
          ttl: parseInt(this.configService.get<string>('THROTTLE_AUTH_TTL', '900000'), 10),
          limit: parseInt(this.configService.get<string>('THROTTLE_AUTH_LIMIT', '5'), 10),
        },
        ai: {
          ttl: parseInt(this.configService.get<string>('THROTTLE_AI_TTL', '60000'), 10),
          limit: parseInt(this.configService.get<string>('THROTTLE_AI_LIMIT', '10'), 10),
        },
      },
      backup: {
        enabled: this.configService.get<string>('BACKUP_ENABLED', 'false') === 'true',
        schedule: this.configService.get<string>('BACKUP_SCHEDULE') ?? null,
        retentionDays: parseInt(this.configService.get<string>('BACKUP_RETENTION_DAYS', '7'), 10),
        lastBackup: null,
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

  async getEmailStats(): Promise<EmailStatsResponseDto> {
    const now = new Date();

    // Current month boundaries
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Last month boundaries
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const buildPeriod = async (start: Date, end: Date, label: string): Promise<EmailStatsPeriodDto> => {
      const rows = await this.databaseService.emailLog.groupBy({
        by: ['status', 'emailType'],
        _count: { id: true },
        where: { sentAt: { gte: start, lt: end } },
      });

      const sent = rows.filter((r) => r.status === 'SENT').reduce((acc, r) => acc + r._count.id, 0);
      const failed = rows.filter((r) => r.status === 'FAILED').reduce((acc, r) => acc + r._count.id, 0);

      // Aggregate by type across all statuses
      const typeMap = new Map<string, number>();
      for (const row of rows) {
        typeMap.set(row.emailType, (typeMap.get(row.emailType) ?? 0) + row._count.id);
      }

      const byType = Array.from(typeMap.entries())
        .map(([emailType, count]) => ({ emailType, count }))
        .sort((a, b) => b.count - a.count);

      return { label, total: sent + failed, sent, failed, byType };
    };

    const [currentMonth, lastMonth] = await Promise.all([
      buildPeriod(currentMonthStart, currentMonthEnd, currentMonthStart.toLocaleString('en-US', { month: 'long', year: 'numeric' })),
      buildPeriod(lastMonthStart, lastMonthEnd, lastMonthStart.toLocaleString('en-US', { month: 'long', year: 'numeric' })),
    ]);

    // All-time totals
    const allTimeRows = await this.databaseService.emailLog.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const allTimeSent = allTimeRows.find((r) => r.status === 'SENT')?._count.id ?? 0;
    const allTimeFailed = allTimeRows.find((r) => r.status === 'FAILED')?._count.id ?? 0;

    return {
      currentMonth,
      lastMonth,
      allTime: {
        total: allTimeSent + allTimeFailed,
        sent: allTimeSent,
        failed: allTimeFailed,
      },
    };
  }

  async getEmailLogs(page: number, limit: number, status?: string, emailType?: string, search?: string): Promise<PaginatedEmailLogsDto> {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (emailType) {
      where.emailType = { contains: emailType, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [{ recipientEmail: { contains: search, mode: 'insensitive' } }, { subject: { contains: search, mode: 'insensitive' } }];
    }

    const [records, total] = await Promise.all([
      this.databaseService.emailLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
        select: {
          uid: true,
          recipientEmail: true,
          subject: true,
          status: true,
          emailType: true,
          sentAt: true,
        },
      }),
      this.databaseService.emailLog.count({ where }),
    ]);

    const data: EmailLogItemDto[] = records.map((r) => ({
      uid: r.uid,
      recipientEmail: r.recipientEmail,
      subject: r.subject,
      status: r.status,
      emailType: r.emailType,
      sentAt: r.sentAt.toISOString(),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
