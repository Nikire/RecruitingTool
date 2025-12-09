import { Module } from '@nestjs/common';
import { CompanyInvitationsController } from './company-invitations.controller';
import { CompanyInvitationsService } from './company-invitations.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, EmailModule, NotificationsModule],
  controllers: [CompanyInvitationsController],
  providers: [CompanyInvitationsService],
  exports: [CompanyInvitationsService],
})
export class CompanyInvitationsModule {}
