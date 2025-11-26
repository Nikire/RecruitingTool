import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisteredUserDto } from './dto/auth.dto';
import { CreateUserDto } from 'src/modules/users/dto/users.dto';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkipThrottle } from 'src/common/decorators/throttle.decorator';

@ApiTags('Auth')
@ApiResponse({
  status: 201,
  description: 'Returns the user details',
  type: RegisteredUserDto,
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: 'Register a User' })
  @ApiBadRequestResponse({
    description: 'User already exists',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many registration attempts. Maximum 3 registrations per hour per IP.',
  })
  @ApiBody({ type: CreateUserDto })
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 registrations per hour
  @Post('register')
  register(
    @Body()
    registerDto: CreateUserDto,
  ): Promise<RegisteredUserDto> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login a User' })
  @ApiUnauthorizedResponse({
    description: 'Email is wrong or Password is wrong',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many login attempts. Maximum 5 attempts per 15 minutes per IP.',
  })
  @ApiBody({ type: LoginDto })
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 login attempts per 15 minutes
  @Post('sign-in')
  async login(
    @Body()
    loginDto: LoginDto,
  ): Promise<RegisteredUserDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @SkipThrottle() // Skip throttling for token verification
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user details if token is valid',
    type: RegisteredUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing token',
  })
  async getProfile(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.verifyToken(token);
  }
}
