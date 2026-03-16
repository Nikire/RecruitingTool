import { Module } from '@nestjs/common';
import { CompanyInvitationsController } from './company-invitations.controller';
import { CompanyInvitationsService } from './company-invitations.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QuotaModule } from '../quota/quota.module';

@Module({
  imports: [DatabaseModule, EmailModule, NotificationsModule, QuotaModule],
  controllers: [CompanyInvitationsController],
  providers: [CompanyInvitationsService],
  exports: [CompanyInvitationsService],
})
export class CompanyInvitationsModule {}
