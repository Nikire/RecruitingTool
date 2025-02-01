import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserResponseDto } from 'src/modules/users/dto/users.dto';

export class LoginDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'jhondoe@hotmail.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Testing123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  password: string;
}

export class RegisteredUserDto extends UserResponseDto {
  @ApiProperty({
    description: 'The token of the user',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbWVzQGhvdG1haWwuY29tIiwibmFtZSI6ImpvaG4gZG9lIiwiaWQi',
  })
  token: string;
}
