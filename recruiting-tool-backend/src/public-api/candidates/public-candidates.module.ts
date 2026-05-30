import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../../modules/shared/modules/database/database.module';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { ApiKeyCryptoService } from '../services/api-key-crypto.service';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';
import { PublicCandidatesController } from './public-candidates.controller';
import { PublicCandidatesService } from './public-candidates.service';

@Module({
  imports: [DatabaseModule, EventEmitterModule],
  controllers: [PublicCandidatesController],
  providers: [PublicCandidatesService, ApiKeyAuthGuard, ApiKeyCryptoService, PublicApiThrottlerGuard],
})
export class PublicCandidatesModule {}
