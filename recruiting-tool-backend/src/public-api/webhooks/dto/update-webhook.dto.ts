import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsUrl } from 'class-validator';
import { VALID_WEBHOOK_EVENTS } from './create-webhook.dto';

export class UpdateWebhookDto {
  @ApiPropertyOptional({
    description: 'The URL that will receive webhook POST requests',
    example: 'https://example.com/webhooks/borderless',
  })
  @IsOptional()
  @IsUrl({}, { message: 'url must be a valid URL' })
  url?: string;

  @ApiPropertyOptional({
    description: 'List of events to subscribe to',
    type: [String],
    example: ['candidate.created', 'application.status_changed'],
    enum: VALID_WEBHOOK_EVENTS,
  })
  @IsOptional()
  @IsArray()
  @IsIn(VALID_WEBHOOK_EVENTS, { each: true })
  events?: string[];

  @ApiPropertyOptional({
    description: 'Whether the webhook endpoint is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
