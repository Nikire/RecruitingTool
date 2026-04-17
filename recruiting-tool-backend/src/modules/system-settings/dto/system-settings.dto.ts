import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class EmailSettingsDto {
  @ApiProperty({ description: 'Whether SMTP is enabled', example: false })
  enabled: boolean;

  @ApiProperty({ description: 'SMTP host', example: 'smtp.resend.com' })
  host: string;

  @ApiProperty({ description: 'SMTP port', example: 465 })
  port: number;

  @ApiProperty({ description: 'Sender email address', example: 'noreply@borderlessats.com' })
  from: string;

  @ApiProperty({ description: 'Whether application emails are enabled', example: true })
  applicationEmailsEnabled: boolean;
}

export class AiSettingsDto {
  @ApiProperty({ description: 'Gemini model name', example: 'gemini-1.5-flash' })
  model: string;

  @ApiProperty({ description: 'Gemini tier', example: 'free' })
  tier: string;
}

export class StorageSettingsDto {
  @ApiProperty({ description: 'Storage type', example: 'minio' })
  type: string;

  @ApiProperty({ description: 'S3/MinIO bucket name', example: 'recruiting-tool' })
  bucket: string;
}

export class RateLimitEndpointDto {
  @ApiProperty({ description: 'Time window in milliseconds', example: 60000 })
  ttl: number;

  @ApiProperty({ description: 'Maximum requests per time window', example: 100 })
  limit: number;
}

export class RateLimitingSettingsDto {
  @ApiProperty({ description: 'General API rate limit configuration', type: RateLimitEndpointDto })
  general: RateLimitEndpointDto;

  @ApiProperty({ description: 'Auth endpoints rate limit configuration', type: RateLimitEndpointDto })
  auth: RateLimitEndpointDto;

  @ApiProperty({ description: 'AI endpoints rate limit configuration', type: RateLimitEndpointDto })
  ai: RateLimitEndpointDto;
}

export class BackupSettingsDto {
  @ApiProperty({ description: 'Whether backups are enabled', example: false })
  enabled: boolean;

  @ApiProperty({ description: 'Backup cron schedule, or null if not configured', example: '0 2 * * *', nullable: true })
  schedule: string | null;

  @ApiProperty({ description: 'Backup retention in days', example: 7 })
  retentionDays: number;

  @ApiProperty({ description: 'Timestamp of the last completed backup, always null (no DB tracking yet)', nullable: true, example: null })
  lastBackup: string | null;
}

export class AppSettingsDto {
  @ApiProperty({ description: 'Node environment', example: 'production' })
  environment: string;

  @ApiProperty({ description: 'Application version', example: '1.0.0' })
  version: string;
}

export class SystemSettingsResponseDto {
  @ApiProperty({ description: 'Email configuration', type: EmailSettingsDto })
  email: EmailSettingsDto;

  @ApiProperty({ description: 'AI configuration', type: AiSettingsDto })
  ai: AiSettingsDto;

  @ApiProperty({ description: 'Storage configuration', type: StorageSettingsDto })
  storage: StorageSettingsDto;

  @ApiProperty({ description: 'Rate limiting configuration', type: RateLimitingSettingsDto })
  rateLimiting: RateLimitingSettingsDto;

  @ApiProperty({ description: 'Backup configuration', type: BackupSettingsDto })
  backup: BackupSettingsDto;

  @ApiProperty({ description: 'Application info', type: AppSettingsDto })
  app: AppSettingsDto;
}

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional({ description: 'Enable or disable application emails', example: true })
  @IsOptional()
  @IsBoolean()
  applicationEmailsEnabled?: boolean;
}

export class TestEmailResponseDto {
  @ApiProperty({ description: 'Whether the test email was sent successfully', example: true })
  success: boolean;

  @ApiProperty({ description: 'Result message', example: 'Test email sent to admin@example.com' })
  message: string;
}

export class EmailStatsByTypeDto {
  @ApiProperty({ description: 'Email type identifier', example: 'INTERVIEW_SCHEDULED' })
  emailType: string;

  @ApiProperty({ description: 'Number of emails of this type', example: 12 })
  count: number;
}

export class EmailStatsPeriodDto {
  @ApiProperty({ description: 'Human-readable period label', example: 'April 2026' })
  label: string;

  @ApiProperty({ description: 'Total emails in this period', example: 45 })
  total: number;

  @ApiProperty({ description: 'Successfully sent emails', example: 43 })
  sent: number;

  @ApiProperty({ description: 'Failed email attempts', example: 2 })
  failed: number;

  @ApiProperty({ description: 'Breakdown by email type, sorted by count descending', type: [EmailStatsByTypeDto] })
  byType: EmailStatsByTypeDto[];
}

export class EmailStatsAllTimeDto {
  @ApiProperty({ description: 'Total all-time emails', example: 300 })
  total: number;

  @ApiProperty({ description: 'Total all-time sent emails', example: 290 })
  sent: number;

  @ApiProperty({ description: 'Total all-time failed emails', example: 10 })
  failed: number;
}

export class EmailStatsResponseDto {
  @ApiProperty({ description: 'Email statistics for the current calendar month', type: EmailStatsPeriodDto })
  currentMonth: EmailStatsPeriodDto;

  @ApiProperty({ description: 'Email statistics for the previous calendar month', type: EmailStatsPeriodDto })
  lastMonth: EmailStatsPeriodDto;

  @ApiProperty({ description: 'All-time aggregate email statistics', type: EmailStatsAllTimeDto })
  allTime: EmailStatsAllTimeDto;
}
