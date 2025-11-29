import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { BackupHistoryResponseDto, BackupStatusResponseDto, BackupType, BackupStatus, BackupHistoryItemDto } from './dto/backup.dto';

const execAsync = promisify(exec);

interface BackupMetadata {
  type: BackupType;
  status: BackupStatus;
  filename: string;
  size: number;
  createdAt: string;
  error?: string;
  duration?: number;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupPath: string;
  private readonly enabled: boolean;
  private readonly retentionDays: number;
  private readonly cronSchedule: string;
  private isRunning = false;
  private lastBackupTime?: Date;
  private backupHistory: BackupMetadata[] = [];

  constructor() {
    this.enabled = process.env.BACKUP_ENABLED === 'true';
    this.cronSchedule = process.env.BACKUP_CRON || '0 2 * * *';
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
    this.backupPath = process.env.BACKUP_PATH || '/backups';

    this.logger.log(`Backup service initialized:`);
    this.logger.log(`- Enabled: ${this.enabled}`);
    this.logger.log(`- Schedule: ${this.cronSchedule}`);
    this.logger.log(`- Retention: ${this.retentionDays} days`);
    this.logger.log(`- Path: ${this.backupPath}`);

    if (this.enabled) {
      this.ensureBackupDirectory();
      this.loadBackupHistory();
    }
  }

  /**
   * Scheduled backup job (runs automatically based on cron schedule)
   */
  @Cron(process.env.BACKUP_CRON || '0 2 * * *')
  async handleScheduledBackup() {
    if (!this.enabled) {
      this.logger.debug('Scheduled backup skipped - backups are disabled');
      return;
    }

    this.logger.log('Starting scheduled backup...');
    await this.performFullBackup();
  }

  /**
   * Manual backup trigger
   */
  async triggerBackup(type: BackupType = BackupType.FULL): Promise<void> {
    if (this.isRunning) {
      throw new InternalServerErrorException('A backup is already in progress');
    }

    this.logger.log(`Manual backup triggered - Type: ${type}`);

    switch (type) {
      case BackupType.DATABASE:
        await this.performDatabaseBackup();
        break;
      case BackupType.FILES:
        await this.performFilesBackup();
        break;
      case BackupType.FULL:
        await this.performFullBackup();
        break;
    }
  }

  /**
   * Get backup status
   */
  getStatus(): BackupStatusResponseDto {
    const nextBackup = this.getNextBackupTime();

    return {
      enabled: this.enabled,
      schedule: this.cronSchedule,
      retentionDays: this.retentionDays,
      backupPath: this.backupPath,
      lastBackup: this.lastBackupTime?.toISOString(),
      nextBackup: nextBackup?.toISOString(),
      isRunning: this.isRunning,
    };
  }

  /**
   * Get backup history
   */
  async getHistory(): Promise<BackupHistoryResponseDto> {
    await this.loadBackupHistory();

    const totalSize = this.backupHistory.reduce((sum, backup) => sum + backup.size, 0);

    return {
      backups: this.backupHistory.map((backup) => ({
        type: backup.type,
        status: backup.status,
        filename: backup.filename,
        size: backup.size,
        createdAt: backup.createdAt,
        error: backup.error,
        duration: backup.duration,
      })),
      total: this.backupHistory.length,
      totalSize,
    };
  }

  /**
   * Perform full backup (database + files)
   */
  private async performFullBackup(): Promise<void> {
    this.isRunning = true;
    const startTime = Date.now();

    try {
      await this.performDatabaseBackup();
      await this.performFilesBackup();

      this.lastBackupTime = new Date();
      this.logger.log(`Full backup completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.logger.error(`Full backup failed: ${error.message}`);
      throw error;
    } finally {
      this.isRunning = false;
      await this.cleanup();
    }
  }

  /**
   * Backup PostgreSQL database using pg_dump
   */
  private async performDatabaseBackup(): Promise<void> {
    const startTime = Date.now();
    const timestamp = this.getTimestamp();
    const filename = `backup-database-${timestamp}.sql.gz`;
    const filepath = path.join(this.backupPath, filename);

    const metadata: BackupMetadata = {
      type: BackupType.DATABASE,
      status: BackupStatus.IN_PROGRESS,
      filename,
      size: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      this.logger.log(`Starting database backup: ${filename}`);

      // Parse DATABASE_URL to extract connection details
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Extract database credentials from URL
      const url = new URL(dbUrl);
      const dbHost = url.hostname;
      const dbPort = url.port || '5432';
      const dbName = url.pathname.substring(1);
      const dbUser = url.username;
      const dbPassword = url.password;

      // Use pg_dump with gzip compression
      const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-owner --no-acl | gzip > "${filepath}"`;

      await execAsync(pgDumpCommand);

      // Get file size
      const stats = await fs.stat(filepath);
      metadata.size = stats.size;
      metadata.status = BackupStatus.COMPLETED;
      metadata.duration = Date.now() - startTime;

      this.backupHistory.unshift(metadata);
      await this.saveBackupHistory();

      this.logger.log(`Database backup completed: ${filename} (${this.formatBytes(stats.size)})`);
    } catch (error) {
      metadata.status = BackupStatus.FAILED;
      metadata.error = error.message;
      metadata.duration = Date.now() - startTime;
      this.backupHistory.unshift(metadata);
      await this.saveBackupHistory();

      this.logger.error(`Database backup failed: ${error.message}`);
      throw new InternalServerErrorException(`Database backup failed: ${error.message}`);
    }
  }

  /**
   * Backup uploaded files from MinIO/S3
   */
  private async performFilesBackup(): Promise<void> {
    const startTime = Date.now();
    const timestamp = this.getTimestamp();
    const filename = `backup-files-${timestamp}.tar.gz`;
    const filepath = path.join(this.backupPath, filename);

    const metadata: BackupMetadata = {
      type: BackupType.FILES,
      status: BackupStatus.IN_PROGRESS,
      filename,
      size: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      this.logger.log(`Starting files backup: ${filename}`);

      // Get MinIO data path from environment or use default
      const minioDataPath = process.env.MINIO_DATA_PATH || '/data/minio';

      // Check if MinIO data path exists
      try {
        await fs.access(minioDataPath);
      } catch {
        this.logger.warn(`MinIO data path not found: ${minioDataPath}, skipping files backup`);
        metadata.status = BackupStatus.COMPLETED;
        metadata.duration = Date.now() - startTime;
        metadata.size = 0;
        this.backupHistory.unshift(metadata);
        await this.saveBackupHistory();
        return;
      }

      // Create compressed archive of MinIO data
      const tarCommand = `tar -czf "${filepath}" -C "${minioDataPath}" .`;
      await execAsync(tarCommand);

      // Get file size
      const stats = await fs.stat(filepath);
      metadata.size = stats.size;
      metadata.status = BackupStatus.COMPLETED;
      metadata.duration = Date.now() - startTime;

      this.backupHistory.unshift(metadata);
      await this.saveBackupHistory();

      this.logger.log(`Files backup completed: ${filename} (${this.formatBytes(stats.size)})`);
    } catch (error) {
      metadata.status = BackupStatus.FAILED;
      metadata.error = error.message;
      metadata.duration = Date.now() - startTime;
      this.backupHistory.unshift(metadata);
      await this.saveBackupHistory();

      this.logger.error(`Files backup failed: ${error.message}`);
      throw new InternalServerErrorException(`Files backup failed: ${error.message}`);
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  private async cleanup(): Promise<void> {
    try {
      this.logger.log(`Starting backup cleanup (retention: ${this.retentionDays} days)`);

      const files = await fs.readdir(this.backupPath);
      const now = Date.now();
      const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;
      let deletedSize = 0;

      for (const file of files) {
        if (!file.startsWith('backup-')) continue;

        const filepath = path.join(this.backupPath, file);
        const stats = await fs.stat(filepath);
        const age = now - stats.mtimeMs;

        if (age > retentionMs) {
          await fs.unlink(filepath);
          deletedCount++;
          deletedSize += stats.size;
          this.logger.log(`Deleted old backup: ${file} (${this.formatBytes(stats.size)})`);
        }
      }

      if (deletedCount > 0) {
        this.logger.log(`Cleanup completed: ${deletedCount} files deleted (${this.formatBytes(deletedSize)})`);
      } else {
        this.logger.log('Cleanup completed: no old backups to delete');
      }

      // Reload history after cleanup
      await this.loadBackupHistory();
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`);
    }
  }

  /**
   * Ensure backup directory exists
   */
  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.backupPath);
      this.logger.log(`Backup directory exists: ${this.backupPath}`);
    } catch {
      try {
        await fs.mkdir(this.backupPath, { recursive: true });
        this.logger.log(`Created backup directory: ${this.backupPath}`);
      } catch (error) {
        this.logger.error(`Failed to create backup directory: ${error.message}`);
      }
    }
  }

  /**
   * Load backup history from metadata file
   */
  private async loadBackupHistory(): Promise<void> {
    try {
      const metadataPath = path.join(this.backupPath, 'backup-history.json');
      const data = await fs.readFile(metadataPath, 'utf-8');
      this.backupHistory = JSON.parse(data);
    } catch {
      // If file doesn't exist, scan backup directory
      await this.scanBackupDirectory();
    }
  }

  /**
   * Save backup history to metadata file
   */
  private async saveBackupHistory(): Promise<void> {
    try {
      const metadataPath = path.join(this.backupPath, 'backup-history.json');
      await fs.writeFile(metadataPath, JSON.stringify(this.backupHistory, null, 2));
    } catch (error) {
      this.logger.error(`Failed to save backup history: ${error.message}`);
    }
  }

  /**
   * Scan backup directory and build history
   */
  private async scanBackupDirectory(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupPath);
      const backups: BackupMetadata[] = [];

      for (const file of files) {
        if (!file.startsWith('backup-')) continue;

        const filepath = path.join(this.backupPath, file);
        const stats = await fs.stat(filepath);

        let type: BackupType;
        if (file.includes('database')) {
          type = BackupType.DATABASE;
        } else if (file.includes('files')) {
          type = BackupType.FILES;
        } else {
          continue;
        }

        backups.push({
          type,
          status: BackupStatus.COMPLETED,
          filename: file,
          size: stats.size,
          createdAt: stats.mtime.toISOString(),
        });
      }

      // Sort by creation date (newest first)
      this.backupHistory = backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      await this.saveBackupHistory();
    } catch (error) {
      this.logger.error(`Failed to scan backup directory: ${error.message}`);
    }
  }

  /**
   * Get next backup time based on cron schedule
   */
  private getNextBackupTime(): Date | null {
    if (!this.enabled) return null;

    // Simple calculation for daily backups at 2 AM
    const now = new Date();
    const next = new Date(now);
    next.setHours(2, 0, 0, 0);

    if (now.getHours() >= 2) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /**
   * Get timestamp for filename
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '-');
  }

  /**
   * Format bytes to human-readable size
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
