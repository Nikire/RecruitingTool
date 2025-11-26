import { Controller, Get, Post, Body } from '@nestjs/common';
import { BackupService } from './backup.service';
import {
  BackupHistoryResponseDto,
  BackupStatusResponseDto,
  TriggerBackupDto,
  TriggerBackupResponseDto,
} from './dto/backup.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Backup')
@ApiBearerAuth()
@Controller('backup')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiForbiddenResponse({
  description: 'Forbidden - SUPER_ADMIN role required',
})
@Auth(['SUPER_ADMIN'])
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('trigger')
  @ApiOperation({
    summary: 'Manually trigger a backup - SUPER_ADMIN role required',
    description: 'Triggers an immediate backup (DATABASE, FILES, or FULL). Only one backup can run at a time.',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup triggered successfully',
    type: TriggerBackupResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - backup failed or already running',
  })
  async triggerBackup(@Body() dto: TriggerBackupDto): Promise<TriggerBackupResponseDto> {
    const type = dto.type;
    const triggeredAt = new Date().toISOString();

    // Start backup asynchronously (don't await to avoid timeout)
    this.backupService.triggerBackup(type).catch((error) => {
      console.error('Backup failed:', error);
    });

    return {
      message: 'Backup started successfully',
      type,
      triggeredAt,
    };
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get backup history - SUPER_ADMIN role required',
    description: 'Returns list of recent backups with details (status, size, duration, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns backup history',
    type: BackupHistoryResponseDto,
  })
  async getHistory(): Promise<BackupHistoryResponseDto> {
    return this.backupService.getHistory();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get backup configuration and status - SUPER_ADMIN role required',
    description: 'Returns backup configuration (enabled, schedule, retention) and current status',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns backup status',
    type: BackupStatusResponseDto,
  })
  getStatus(): BackupStatusResponseDto {
    return this.backupService.getStatus();
  }
}
