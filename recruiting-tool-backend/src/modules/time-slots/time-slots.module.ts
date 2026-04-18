import { Module } from '@nestjs/common';
import { TimeSlotsController } from './time-slots.controller';
import { TimeSlotsService } from './time-slots.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { EmailModule } from '../email/email.module';
import { InterviewModule } from '../interview/interview.module';

@Module({
  imports: [DatabaseModule, EmailModule, InterviewModule],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
