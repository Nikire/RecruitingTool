import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from '../admin/admin.module';
import { EmailModule } from '../email/email.module';
import { InternalController } from './internal.controller';
import { InternalService } from './internal.service';
import { CompanyHealthService } from './company-health.service';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';

@Module({
  // ScheduleModule.forRoot() is already called in AppModule; repeating it here matches
  // the convention used by AIQuotaModule and BackupModule and keeps this module usable
  // standalone in a test bed. AdminModule exports AdminService, whose
  // collectCompanyHealthSignals() the nightly snapshot job reuses instead of
  // reimplementing the scorer. DatabaseModule is @Global so DatabaseService needs no
  // explicit import.
  imports: [ConfigModule, ScheduleModule.forRoot(), EmailModule, AdminModule],
  controllers: [InternalController],
  providers: [InternalService, CompanyHealthService, InternalApiKeyGuard],
  exports: [CompanyHealthService],
})
export class InternalModule {}
