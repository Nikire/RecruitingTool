import { Module } from '@nestjs/common';
import { ConnectionRequestsController } from './connection-requests.controller';
import { ConnectionRequestsService } from './connection-requests.service';
import { DatabaseModule } from '../shared/modules/database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [ConnectionRequestsController],
  providers: [ConnectionRequestsService],
  exports: [ConnectionRequestsService],
})
export class ConnectionRequestsModule {}
