import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Auth0 Guard
 *
 * Protects routes by requiring a valid Auth0 JWT token.
 * Uses the Auth0Strategy to validate tokens.
 *
 * Usage:
 * @UseGuards(Auth0Guard)
 * @Get('protected')
 * async protectedRoute(@Request() req) {
 *   // req.user contains validated Auth0 user info
 * }
 */
@Injectable()
export class Auth0Guard extends AuthGuard('auth0') {}
