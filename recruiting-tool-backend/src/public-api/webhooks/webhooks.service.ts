import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../modules/shared/modules/database/database.service';
import * as crypto from 'crypto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';
import type { WebhookEndpoint } from '@prisma/client';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: number, dto: CreateWebhookDto): Promise<WebhookResponseDto> {
    const secret = crypto.randomBytes(32).toString('hex');

    const endpoint = await this.db.webhookEndpoint.create({
      data: {
        url: dto.url,
        events: dto.events,
        secret,
        companyId,
      },
    });

    return this.toResponseDto(endpoint, true);
  }

  async findAll(companyId: number): Promise<WebhookResponseDto[]> {
    const endpoints = await this.db.webhookEndpoint.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return endpoints.map((e) => this.toResponseDto(e, false));
  }

  async findOne(uid: string, companyId: number): Promise<WebhookResponseDto> {
    const endpoint = await this.db.webhookEndpoint.findFirst({
      where: { uid, companyId },
    });

    if (!endpoint) {
      throw new NotFoundException(`Webhook endpoint with uid "${uid}" not found`);
    }

    return this.toResponseDto(endpoint, false);
  }

  async update(uid: string, companyId: number, dto: UpdateWebhookDto): Promise<WebhookResponseDto> {
    const endpoint = await this.db.webhookEndpoint.findFirst({
      where: { uid, companyId },
    });

    if (!endpoint) {
      throw new NotFoundException(`Webhook endpoint with uid "${uid}" not found`);
    }

    const updated = await this.db.webhookEndpoint.update({
      where: { id: endpoint.id },
      data: {
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.events !== undefined && { events: dto.events }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return this.toResponseDto(updated, false);
  }

  async remove(uid: string, companyId: number): Promise<void> {
    const endpoint = await this.db.webhookEndpoint.findFirst({
      where: { uid, companyId },
    });

    if (!endpoint) {
      throw new NotFoundException(`Webhook endpoint with uid "${uid}" not found`);
    }

    await this.db.webhookEndpoint.delete({ where: { id: endpoint.id } });
  }

  async emitWebhookEvent(companyId: number, event: string, payload: Record<string, unknown>): Promise<void> {
    this.eventEmitter.emit('webhook.deliver', { event, companyId, payload });
  }

  private toResponseDto(endpoint: WebhookEndpoint, includeSecret: boolean): WebhookResponseDto {
    const dto: WebhookResponseDto = {
      uid: endpoint.uid,
      url: endpoint.url,
      events: endpoint.events,
      isActive: endpoint.isActive,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    };

    if (includeSecret) {
      dto.secret = endpoint.secret;
    }

    return dto;
  }
}
