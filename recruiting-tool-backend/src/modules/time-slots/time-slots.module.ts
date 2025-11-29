import { Module } from '@nestjs/common';
import { TimeSlotsController } from './time-slots.controller';
import { TimeSlotsService } from './time-slots.service';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
