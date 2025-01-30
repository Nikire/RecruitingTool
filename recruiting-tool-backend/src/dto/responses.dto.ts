import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'The success or error message',
    example: 'User deleted successfully',
  })
  message: string;
}
