import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AIQuotaController } from './ai-quota.controller';
import { AIQuotaService } from './ai-quota.service';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  controllers: [AIQuotaController],
  providers: [AIQuotaService],
  exports: [AIQuotaService],
})
export class AIQuotaModule {}
