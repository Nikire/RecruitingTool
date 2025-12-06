import { Body, Controller, Get, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth0CallbackDto, LoginDto, RegisteredUserDto, RefreshTokenDto, TokenPairDto } from './dto/auth.dto';
import { CreateUserDto } from 'src/modules/users/dto/users.dto';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiTooManyRequestsResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkipThrottle } from 'src/common/decorators/throttle.decorator';
import { Auth0Guard } from './guards/auth0.guard';

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
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Works with both local JWT and Auth0 tokens',
  })
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

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
    type: TokenPairDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, or revoked refresh token',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many refresh attempts',
  })
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 refresh attempts per minute (increased for multiple tabs/sessions - was 10)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenPairDto> {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Refresh token revoked successfully',
  })
  @SkipThrottle()
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    await this.authService.revokeRefreshToken(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @ApiOperation({ summary: 'Revoke all refresh tokens for current user' })
  @ApiResponse({
    status: 200,
    description: 'All refresh tokens revoked successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing token',
  })
  @SkipThrottle()
  async logoutAll(@Headers('authorization') authHeader: string): Promise<{ message: string }> {
    const token = authHeader?.replace('Bearer ', '');
    const user = await this.authService.verifyToken(token);
    await this.authService.revokeAllUserTokens(user.id);
    return { message: 'All sessions terminated successfully' };
  }

  @Post('complete-onboarding')
  @ApiOperation({ summary: 'Mark onboarding as complete for current user' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding marked as complete',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing token',
  })
  @SkipThrottle()
  async completeOnboarding(@Headers('authorization') authHeader: string): Promise<{ message: string; onboardingCompleted: boolean }> {
    const token = authHeader?.replace('Bearer ', '');
    const user = await this.authService.verifyToken(token);
    await this.authService.completeOnboarding(user.id);
    return { message: 'Onboarding completed successfully', onboardingCompleted: true };
  }

  @Post('social/callback')
  @UseGuards(Auth0Guard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Handle Auth0 social login callback',
    description: 'Validates Auth0 token and creates/links user account. Returns local JWT tokens for subsequent requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully via Auth0. Returns local JWT tokens.',
    type: RegisteredUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Auth0 token or Auth0 not configured',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many authentication attempts',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  async auth0Callback(@Request() req): Promise<RegisteredUserDto> {
    // req.user is populated by Auth0Guard/Auth0Strategy
    const auth0User = req.user;

    // Handle the callback and return local JWT tokens
    return this.authService.handleAuth0Callback(auth0User);
  }
}
