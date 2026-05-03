import { Module } from '@nestjs/common';
import { OutreachCampaignsController } from './outreach-campaigns.controller';
import { OutreachCampaignsService } from './outreach-campaigns.service';
import { SharedModule } from '../shared/shared.module';
import { WebhookAuthGuard } from '../webhooks/guards/webhook-auth.guard';
import { EmailModule } from '../email/email.module';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';
import { UnsubscribeModule } from '../unsubscribe/unsubscribe.module';

@Module({
  imports: [SharedModule, EmailModule, EmailTemplatesModule, UnsubscribeModule],
  controllers: [OutreachCampaignsController],
  providers: [OutreachCampaignsService, WebhookAuthGuard],
})
export class OutreachCampaignsModule {}
