import { Module } from '@nestjs/common';
import { ProspectTrackingController } from './prospect-tracking.controller';
import { ProspectTrackingService } from './prospect-tracking.service';

@Module({
  controllers: [ProspectTrackingController],
  providers: [ProspectTrackingService],
})
export class ProspectTrackingModule {}
