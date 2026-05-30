import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../modules/shared/modules/database/database.module';
import { ApiKeyCryptoService } from '../services/api-key-crypto.service';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';

@Module({
  imports: [DatabaseModule],
  providers: [ApiKeyCryptoService, ApiKeyAuthGuard, PublicApiThrottlerGuard],
  exports: [ApiKeyCryptoService, ApiKeyAuthGuard, PublicApiThrottlerGuard],
})
export class ApiKeysModule {}
