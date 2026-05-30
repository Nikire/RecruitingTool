import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../modules/shared/modules/database/database.module';
import { PublicJobPositionsController } from './public-job-positions.controller';
import { PublicJobPositionsService } from './public-job-positions.service';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { ApiKeyCryptoService } from '../services/api-key-crypto.service';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [PublicJobPositionsController],
  providers: [PublicJobPositionsService, ApiKeyAuthGuard, ApiKeyCryptoService, PublicApiThrottlerGuard],
})
export class PublicJobPositionsModule {}
