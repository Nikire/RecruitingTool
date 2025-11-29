import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { EmailModule } from '../email/email.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { SseModule } from '../sse/sse.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [DatabaseModule, EmailModule, GoogleCalendarModule, SseModule, AuditLogModule],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
