import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { SharedModule } from '../shared/shared.module';
import { EmailModule } from '../email/email.module';
import { SseModule } from '../sse/sse.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';

@Module({
  imports: [SharedModule, EmailModule, SseModule, AuditLogModule, NotificationsModule, EmailTemplatesModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
