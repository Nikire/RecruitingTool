import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../../modules/shared/modules/database/database.module';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { ApiKeyCryptoService } from '../services/api-key-crypto.service';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';
import { PublicApplicationsController } from './public-applications.controller';
import { PublicApplicationsService } from './public-applications.service';

@Module({
  imports: [DatabaseModule, EventEmitterModule],
  controllers: [PublicApplicationsController],
  providers: [PublicApplicationsService, ApiKeyAuthGuard, ApiKeyCryptoService, PublicApiThrottlerGuard],
})
export class PublicApplicationsModule {}
