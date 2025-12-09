import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Flexible Auth Guard
 *
 * This guard accepts BOTH local JWT tokens and Auth0 tokens.
 * It tries Auth0 first, then falls back to local JWT if Auth0 fails.
 *
 * This allows the application to support:
 * - Traditional email/password login (local JWT)
 * - Social login via Auth0 (Google, GitHub, etc.)
 *
 * Usage:
 * @UseGuards(FlexibleAuthGuard)
 * @Get('protected')
 * async protectedRoute(@Request() req) {
 *   // req.user contains user info from either auth method
 * }
 */
@Injectable()
export class FlexibleAuthGuard extends AuthGuard(['auth0', 'jwt']) {
  /**
   * Override canActivate to provide custom error handling
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try to authenticate with any available strategy
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      // If all strategies fail, throw a generic auth error
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
  }

  /**
   * Handle request after successful authentication
   * This method is called after a strategy successfully validates a token
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, reject
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
