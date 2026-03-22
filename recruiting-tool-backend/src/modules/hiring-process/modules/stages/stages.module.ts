import { Module } from '@nestjs/common';
import { StagesService } from './stages.service';
import { StagesController } from './stages.controller';
import { SseModule } from 'src/modules/sse/sse.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { EmailModule } from 'src/modules/email/email.module';

@Module({
  imports: [SseModule, NotificationsModule, EmailModule],
  controllers: [StagesController],
  providers: [StagesService],
  exports: [StagesService],
})
export class StagesModule {}
