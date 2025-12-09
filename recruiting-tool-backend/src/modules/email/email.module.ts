import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { DatabaseModule } from '../shared/modules/database/database.module';

@Module({
  imports: [ConfigModule, NotificationsModule, DatabaseModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
