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
  /** Backup cron schedule */
  schedule: string;
  /** Backup retention in days */
  retentionDays: number;
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
