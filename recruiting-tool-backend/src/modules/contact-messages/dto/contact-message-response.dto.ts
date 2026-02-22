import { ApiProperty } from '@nestjs/swagger';

export class ContactMessageResponseDto {
  @ApiProperty({
    description: 'Contact message UID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uid: string;

  @ApiProperty({
    description: 'Full name of the sender',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email address of the sender',
    example: 'john.doe@company.com',
  })
  email: string;

  @ApiProperty({
    description: 'Company name of the sender (optional)',
    example: 'Acme Corp',
    required: false,
  })
  company?: string;

  @ApiProperty({
    description: 'The message content',
    example: 'I would like to learn more about your enterprise plan.',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the message has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Timestamp when the message was created',
    example: '2026-02-22T10:30:00Z',
  })
  createdAt: Date;
}
