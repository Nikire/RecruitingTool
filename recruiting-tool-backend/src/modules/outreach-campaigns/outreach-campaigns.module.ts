import { Module } from '@nestjs/common';
import { OutreachCampaignsController } from './outreach-campaigns.controller';
import { OutreachCampaignsService } from './outreach-campaigns.service';
import { SharedModule } from '../shared/shared.module';
import { WebhookAuthGuard } from '../webhooks/guards/webhook-auth.guard';

@Module({
  imports: [SharedModule],
  controllers: [OutreachCampaignsController],
  providers: [OutreachCampaignsService, WebhookAuthGuard],
})
export class OutreachCampaignsModule {}
