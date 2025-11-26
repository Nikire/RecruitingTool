import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum BackupType {
  DATABASE = 'DATABASE',
  FILES = 'FILES',
  FULL = 'FULL',
}

export enum BackupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class BackupHistoryItemDto {
  @ApiProperty({
    description: 'Backup type',
    enum: BackupType,
    example: BackupType.FULL,
  })
  type: BackupType;

  @ApiProperty({
    description: 'Backup status',
    enum: BackupStatus,
    example: BackupStatus.COMPLETED,
  })
  status: BackupStatus;

  @ApiProperty({
    description: 'Backup file name',
    example: 'backup-database-2025-11-25-14-30-00.sql.gz',
  })
  filename: string;

  @ApiProperty({
    description: 'Backup file size in bytes',
    example: 1048576,
  })
  size: number;

  @ApiProperty({
    description: 'Backup creation timestamp',
    example: '2025-11-25T14:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Error message if backup failed',
    required: false,
    example: 'Connection timeout',
  })
  error?: string;

  @ApiProperty({
    description: 'Duration of backup in milliseconds',
    required: false,
    example: 5000,
  })
  duration?: number;
}

export class BackupHistoryResponseDto {
  @ApiProperty({
    description: 'List of recent backups',
    type: [BackupHistoryItemDto],
  })
  backups: BackupHistoryItemDto[];

  @ApiProperty({
    description: 'Total number of backups',
    example: 15,
  })
  total: number;

  @ApiProperty({
    description: 'Total size of all backups in bytes',
    example: 157286400,
  })
  totalSize: number;
}

export class BackupStatusResponseDto {
  @ApiProperty({
    description: 'Whether backups are enabled',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Backup cron schedule',
    example: '0 2 * * *',
  })
  schedule: string;

  @ApiProperty({
    description: 'Backup retention period in days',
    example: 30,
  })
  retentionDays: number;

  @ApiProperty({
    description: 'Backup storage path',
    example: '/backups',
  })
  backupPath: string;

  @ApiProperty({
    description: 'Last successful backup timestamp',
    required: false,
    example: '2025-11-25T02:00:00.000Z',
  })
  lastBackup?: string;

  @ApiProperty({
    description: 'Next scheduled backup timestamp',
    required: false,
    example: '2025-11-26T02:00:00.000Z',
  })
  nextBackup?: string;

  @ApiProperty({
    description: 'Whether a backup is currently running',
    example: false,
  })
  isRunning: boolean;
}

export class TriggerBackupDto {
  @ApiProperty({
    description: 'Type of backup to trigger',
    enum: BackupType,
    example: BackupType.FULL,
    required: false,
  })
  @IsOptional()
  @IsEnum(BackupType)
  type?: BackupType = BackupType.FULL;
}

export class TriggerBackupResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Backup started successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Backup type',
    enum: BackupType,
    example: BackupType.FULL,
  })
  type: BackupType;

  @ApiProperty({
    description: 'Timestamp when backup was triggered',
    example: '2025-11-25T14:30:00.000Z',
  })
  triggeredAt: string;
}
