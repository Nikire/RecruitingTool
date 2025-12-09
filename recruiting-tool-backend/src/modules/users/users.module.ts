import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from '../storage/storage.module';
import { UserActivityService } from './services/user-activity.service';
import { OnboardingService } from './services/onboarding.service';
import { QuotaModule } from '../quota/quota.module';

@Module({
  imports: [StorageModule, QuotaModule],
  controllers: [UsersController],
  providers: [UsersService, UserActivityService, OnboardingService],
  exports: [UsersService, UserActivityService, OnboardingService],
})
export class UsersModule {}
