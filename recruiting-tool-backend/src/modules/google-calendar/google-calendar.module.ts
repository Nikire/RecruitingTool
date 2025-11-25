import { Module } from '@nestjs/common';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
