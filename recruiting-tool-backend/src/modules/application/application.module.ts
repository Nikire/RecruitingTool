import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { SharedModule } from '../shared/shared.module';
import { EmailModule } from '../email/email.module';
import { SseModule } from '../sse/sse.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [SharedModule, EmailModule, SseModule, AuditLogModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
