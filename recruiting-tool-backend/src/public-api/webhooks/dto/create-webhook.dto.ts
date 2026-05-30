import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsUrl, ArrayNotEmpty } from 'class-validator';

export const VALID_WEBHOOK_EVENTS = ['candidate.created', 'candidate.updated', 'application.status_changed'] as const;

export type WebhookEventType = (typeof VALID_WEBHOOK_EVENTS)[number];

export class CreateWebhookDto {
  @ApiProperty({
    description: 'The URL that will receive webhook POST requests',
    example: 'https://example.com/webhooks/borderless',
  })
  @IsUrl({}, { message: 'url must be a valid URL' })
  url: string;

  @ApiProperty({
    description: 'List of events to subscribe to',
    type: [String],
    example: ['candidate.created', 'application.status_changed'],
    enum: VALID_WEBHOOK_EVENTS,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(VALID_WEBHOOK_EVENTS, { each: true })
  events: string[];
}
