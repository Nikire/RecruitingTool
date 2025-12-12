import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { SharedModule } from '../shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionGuard } from './guards/subscription.guard';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';

@Module({
  imports: [SharedModule, NotificationsModule],
  controllers: [StripeController],
  providers: [StripeService, SubscriptionGuard, SubscriptionSchedulerService],
  exports: [StripeService, SubscriptionGuard],
})
export class StripeModule {}
