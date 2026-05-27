import { Module } from '@nestjs/common';
import { DodoPaymentsService } from './dodo-payments.service';
import { DodoPaymentsController } from './dodo-payments.controller';
import { SharedModule } from '../shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SharedModule, NotificationsModule],
  controllers: [DodoPaymentsController],
  providers: [DodoPaymentsService],
  exports: [DodoPaymentsService],
})
export class DodoPaymentsModule {}
