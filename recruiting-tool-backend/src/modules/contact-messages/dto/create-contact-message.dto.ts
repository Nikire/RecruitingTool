import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({
    description: 'Full name of the person contacting us',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email address of the person contacting us',
    example: 'john.doe@company.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Company name (optional)',
    example: 'Acme Corp',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @ApiProperty({
    description: 'The message content',
    example: 'I would like to learn more about your enterprise plan.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
