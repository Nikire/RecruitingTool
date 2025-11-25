import { Module } from '@nestjs/common';
import { HRScheduleController } from './hr-schedule.controller';
import { HRScheduleService } from './hr-schedule.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [HRScheduleController],
  providers: [HRScheduleService],
  exports: [HRScheduleService]
})
export class HRScheduleModule {}
