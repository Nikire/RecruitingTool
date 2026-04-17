/**
 * System Settings types matching the backend SystemSettingsResponseDto
 */

export interface EmailSettings {
  /** Whether SMTP is configured and enabled */
  enabled: boolean;
  /** SMTP host address */
  host: string;
  /** SMTP port number */
  port: number;
  /** Sender email address */
  from: string;
  /** Whether application emails (e.g. candidate notifications) are enabled */
  applicationEmailsEnabled: boolean;
}

export interface AiSettings {
  /** AI model name (e.g. 'gemini-1.5-flash') */
  model: string;
  /** AI service tier (e.g. 'free', 'paid') */
  tier: string;
}

export interface StorageSettings {
  /** Storage backend type (e.g. 'minio', 's3') */
  type: string;
  /** Storage bucket name */
  bucket: string;
}

export interface RateLimitEndpoint {
  /** Time window in milliseconds */
  ttl: number;
  /** Maximum requests per time window */
  limit: number;
}

export interface RateLimitingSettings {
  /** General API rate limit configuration */
  general: RateLimitEndpoint;
  /** Auth endpoints rate limit configuration */
  auth: RateLimitEndpoint;
  /** AI endpoints rate limit configuration */
  ai: RateLimitEndpoint;
}

export interface BackupSettings {
  /** Whether automated backups are enabled */
  enabled: boolean;
  /** Backup cron schedule, or null if not configured */
  schedule: string | null;
  /** Backup retention in days */
  retentionDays: number;
  /** Timestamp of the last completed backup, null if never run */
  lastBackup: string | null;
}

export interface AppSettings {
  /** Node environment (e.g. 'production', 'development') */
  environment: string;
  /** Application version */
  version: string;
}

export interface SystemSettingsResponse {
  email: EmailSettings;
  ai: AiSettings;
  storage: StorageSettings;
  rateLimiting: RateLimitingSettings;
  backup: BackupSettings;
  app: AppSettings;
}

export interface UpdateSystemSettingsDto {
  /** Enable or disable application emails */
  applicationEmailsEnabled?: boolean;
}

export interface TestEmailResponse {
  /** Whether the test email was sent successfully */
  success: boolean;
  /** Result message */
  message: string;
}

export interface EmailStatsByType {
  /** Email type identifier, e.g. "INTERVIEW_SCHEDULED" */
  emailType: string;
  /** Number of emails of this type */
  count: number;
}

export interface EmailStatsPeriod {
  /** Human-readable period label, e.g. "April 2026" */
  label: string;
  /** Total emails in this period */
  total: number;
  /** Successfully sent emails */
  sent: number;
  /** Failed email attempts */
  failed: number;
  /** Breakdown by email type, sorted by count descending */
  byType: EmailStatsByType[];
}

export interface EmailStatsResponse {
  currentMonth: EmailStatsPeriod;
  lastMonth: EmailStatsPeriod;
  allTime: { total: number; sent: number; failed: number };
}
