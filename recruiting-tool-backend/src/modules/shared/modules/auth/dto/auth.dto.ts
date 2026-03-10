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

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address to send the reset link to',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The password reset token received via email',
    example: 'a1b2c3d4e5f6...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'The new password (minimum 8 characters)',
    example: 'NewPassword123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
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

export class AddEmailDto {
  @ApiProperty({ description: 'Email address to add', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RequestEmailChangeDto {
  @ApiProperty({ description: 'New email address to change to', example: 'newemail@example.com' })
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}

export class ConfirmEmailChangeDto {
  @ApiProperty({ description: '6-digit verification code sent to the new email', example: '123456' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class ConfirmPasswordChangeDto {
  @ApiProperty({ description: '6-digit verification code sent to the current email', example: '123456' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'The new password (minimum 8 characters)', example: 'NewPassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
