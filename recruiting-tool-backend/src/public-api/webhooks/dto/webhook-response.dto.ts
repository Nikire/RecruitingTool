import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookResponseDto {
  @ApiProperty({ description: 'Unique identifier for the webhook endpoint', example: 'a1b2c3d4-...' })
  uid: string;

  @ApiProperty({ description: 'The URL that receives webhook events', example: 'https://example.com/webhooks' })
  url: string;

  @ApiProperty({
    description: 'Subscribed event types',
    type: [String],
    example: ['candidate.created', 'application.status_changed'],
  })
  events: string[];

  @ApiProperty({ description: 'Whether the endpoint is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Webhook signing secret — only returned once on creation. Store it securely; it cannot be retrieved again.',
    example: 'a3f8e2b1c4d5...',
  })
  secret?: string;
}
