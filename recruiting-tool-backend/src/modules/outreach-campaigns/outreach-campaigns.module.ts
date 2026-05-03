import { Module } from '@nestjs/common';
import { OutreachCampaignsController } from './outreach-campaigns.controller';
import { OutreachCampaignsService } from './outreach-campaigns.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [OutreachCampaignsController],
  providers: [OutreachCampaignsService],
})
export class OutreachCampaignsModule {}
