import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../../modules/shared/modules/database/database.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { ApiKeyCryptoService } from '../services/api-key-crypto.service';
import { PublicApiThrottlerGuard } from '../guards/public-api-throttler.guard';

@Module({
  imports: [DatabaseModule, EventEmitterModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookDeliveryService, ApiKeyAuthGuard, ApiKeyCryptoService, PublicApiThrottlerGuard],
  exports: [WebhooksService],
})
export class PublicWebhooksModule {}
