import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { StorageModule } from '../storage/storage.module';
import { EmailModule } from '../email/email.module';
import { QuotaModule } from '../quota/quota.module';
import { AsyncStageService } from './async-stage.service';
import { AsyncStageController, PublicAsyncStageController } from './async-stage.controller';
import { AsyncStageReminderService } from './async-stage-reminder.service';

@Module({
  imports: [DatabaseModule, StorageModule, ConfigModule, EmailModule, QuotaModule],
  controllers: [AsyncStageController, PublicAsyncStageController],
  providers: [AsyncStageService, AsyncStageReminderService],
  exports: [AsyncStageService],
})
export class AsyncStageModule {}
