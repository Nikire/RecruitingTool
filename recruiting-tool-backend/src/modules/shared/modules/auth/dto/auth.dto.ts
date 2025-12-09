import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
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

export class RegisteredUserDto {
  user: UserResponseDto;
  @ApiProperty({
    description: 'The access token (short-lived, 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'The refresh token (long-lived, 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class TokenPairDto {
  @ApiProperty({
    description: 'The access token (short-lived, 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The refresh token (long-lived, 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  expiresIn: number;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token to exchange for a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class Auth0CallbackDto {
  @ApiProperty({
    description: 'Auth0 JWT token',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  auth0Token: string;
}

export class LinkSocialAccountDto {
  @ApiProperty({
    description: 'Auth0 JWT token from social provider',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  auth0Token: string;
}

export class LinkedAccountResponseDto {
  @ApiProperty({
    description: 'Auth0 provider type',
    example: 'google-oauth2',
  })
  provider: string;

  @ApiProperty({
    description: 'Whether this provider is linked',
    example: true,
  })
  isLinked: boolean;

  @ApiProperty({
    description: 'Provider email if linked',
    example: 'user@example.com',
    required: false,
  })
  email?: string;
}

export class LinkedAccountsResponseDto {
  @ApiProperty({
    description: 'List of linked account providers',
    type: [LinkedAccountResponseDto],
  })
  linkedAccounts: LinkedAccountResponseDto[];

  @ApiProperty({
    description: 'Whether the user has a local password',
    example: true,
  })
  hasLocalPassword: boolean;
}
