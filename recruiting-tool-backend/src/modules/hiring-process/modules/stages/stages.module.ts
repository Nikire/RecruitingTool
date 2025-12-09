import { Module } from '@nestjs/common';
import { StagesService } from './stages.service';
import { StagesController } from './stages.controller';
import { SseModule } from 'src/modules/sse/sse.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [SseModule, NotificationsModule],
  controllers: [StagesController],
  providers: [StagesService],
  exports: [StagesService],
})
export class StagesModule {}
