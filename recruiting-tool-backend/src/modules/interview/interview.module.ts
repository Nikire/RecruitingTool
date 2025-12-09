import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewCalendarService } from './interview-calendar.service';
import { InterviewReminderService } from './interview-reminder.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { EmailModule } from '../email/email.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { SseModule } from '../sse/sse.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    GoogleCalendarModule,
    SseModule,
    AuditLogModule,
    NotificationsModule,
    CacheModule.register(),
  ],
  controllers: [InterviewController],
  providers: [InterviewService, InterviewCalendarService, InterviewReminderService],
  exports: [InterviewService],
})
export class InterviewModule {}
