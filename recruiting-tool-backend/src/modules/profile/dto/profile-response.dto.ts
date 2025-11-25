import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'The UID of the profile',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  uid: string;

  @ApiProperty({
    description: 'The UID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userUid: string;

  @ApiProperty({
    description: 'Professional bio',
    example: 'Experienced HR professional with 5+ years in recruitment',
    required: false
  })
  bio?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1-555-0123',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'Location',
    example: 'New York, NY',
    required: false
  })
  location?: string;

  @ApiProperty({
    description: 'User timezone',
    example: 'America/New_York',
    required: false
  })
  timezone?: string;

  @ApiProperty({
    description: 'User preferences as JSON object',
    example: { theme: 'dark', notifications: true },
    required: false
  })
  preferences?: Record<string, any>;

  @ApiProperty({
    description: 'The date the profile was created',
    example: '2021-08-01T00:00:00.000Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'The date the profile was last updated',
    example: '2021-08-01T00:00:00.000Z'
  })
  updatedAt: string;
}
