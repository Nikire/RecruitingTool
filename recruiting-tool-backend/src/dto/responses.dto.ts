import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'The success message',
    example: 'User deleted successfully',
  })
  message: string;
}

export class ErrorResponseDto extends MessageResponseDto {
  @ApiProperty({
    description: 'The error message',
    example: 'User not found',
  })
  error: string;

  @ApiProperty({
    description: 'The status code',
    example: 404,
  })
  statusCode: number;
}
