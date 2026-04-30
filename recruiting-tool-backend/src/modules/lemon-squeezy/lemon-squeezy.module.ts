import { Module } from '@nestjs/common';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { LemonSqueezyController } from './lemon-squeezy.controller';
import { SharedModule } from '../shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SharedModule, NotificationsModule],
  controllers: [LemonSqueezyController],
  providers: [LemonSqueezyService],
  exports: [LemonSqueezyService],
})
export class LemonSqueezyModule {}
