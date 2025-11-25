import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from '../storage/storage.module';
import { UserActivityService } from './services/user-activity.service';

@Module({
  imports: [StorageModule],
  controllers: [UsersController],
  providers: [UsersService, UserActivityService],
  exports: [UsersService, UserActivityService],
})
export class UsersModule {}
