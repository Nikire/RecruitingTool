import { Global, Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { ActivationEventsService } from './activation-events.service';
import { SharedModule } from '../shared/shared.module';

/**
 * @Global so that ActivationEventsService can be injected by any product
 * service that needs to emit an activation event without every one of those
 * feature modules having to import TrackingModule. Analytics is a
 * cross-cutting concern; threading it through the module graph by hand is how
 * emit sites get skipped and funnels end up with holes.
 */
@Global()
@Module({
  imports: [SharedModule],
  controllers: [TrackingController],
  providers: [TrackingService, ActivationEventsService],
  exports: [TrackingService, ActivationEventsService],
})
export class TrackingModule {}
