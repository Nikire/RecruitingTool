import { Module } from '@nestjs/common';
import { CompanyCalendarSettingsController } from './company-calendar-settings.controller';
import { CompanyCalendarSettingsService } from './company-calendar-settings.service';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyCalendarSettingsController],
  providers: [CompanyCalendarSettingsService],
  exports: [CompanyCalendarSettingsService],
})
export class CompanyCalendarSettingsModule {}
