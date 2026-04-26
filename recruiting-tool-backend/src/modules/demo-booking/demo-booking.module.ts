import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { EmailModule } from '../email/email.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { DemoBookingController } from './demo-booking.controller';
import { DemoBookingService } from './demo-booking.service';

@Module({
  imports: [DatabaseModule, EmailModule, GoogleCalendarModule],
  controllers: [DemoBookingController],
  providers: [DemoBookingService],
})
export class DemoBookingModule {}
