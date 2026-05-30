import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '../../modules/shared/modules/database/database.service';
import * as crypto from 'crypto';
import axios from 'axios';

export interface WebhookEvent {
  event: string;
  companyId: number;
  payload: Record<string, unknown>;
}

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);

  constructor(private readonly db: DatabaseService) {}

  @OnEvent('webhook.deliver')
  async handleWebhookEvent(data: WebhookEvent): Promise<void> {
    const endpoints = await this.db.webhookEndpoint.findMany({
      where: {
        companyId: data.companyId,
        isActive: true,
        events: { has: data.event },
      },
    });

    for (const endpoint of endpoints) {
      await this.deliverWithRetry(endpoint, data, 0);
    }
  }

  private async deliverWithRetry(endpoint: { id: number; url: string; secret: string }, data: WebhookEvent, attempt: number): Promise<void> {
    const maxAttempts = 3;
    const messageId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const body = JSON.stringify({
      id: messageId,
      timestamp,
      event: data.event,
      data: data.payload,
    });

    const signature = this.sign(endpoint.secret, messageId, timestamp, body);

    try {
      await axios.post(endpoint.url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Borderless-Signature': signature,
          'X-Borderless-Event': data.event,
          'X-Borderless-Timestamp': timestamp,
          'X-Borderless-Message-Id': messageId,
        },
        timeout: 10000,
      });
      this.logger.log(`Webhook delivered to ${endpoint.url} for event ${data.event}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Webhook delivery failed (attempt ${attempt + 1}) to ${endpoint.url}: ${errMsg}`);
      if (attempt < maxAttempts - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          void this.deliverWithRetry(endpoint, data, attempt + 1);
        }, delay);
      } else {
        this.logger.error(`Webhook delivery permanently failed after ${maxAttempts} attempts to ${endpoint.url}`);
      }
    }
  }

  /**
   * Signature format: v1,<hmac-sha256-hex>
   * The signed string is: <messageId>.<timestamp>.<body>
   *
   * Consumers can verify with:
   *   const expected = 'v1,' + hmac_sha256(secret, `${messageId}.${timestamp}.${rawBody}`)
   *   if (expected === X-Borderless-Signature header) → valid
   */
  private sign(secret: string, messageId: string, timestamp: string, body: string): string {
    const toSign = `${messageId}.${timestamp}.${body}`;
    return 'v1,' + crypto.createHmac('sha256', secret).update(toSign).digest('hex');
  }
}
