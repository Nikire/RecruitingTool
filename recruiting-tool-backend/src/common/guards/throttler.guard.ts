import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * Custom Throttler Guard with IP-based rate limiting
 * Extends the default ThrottlerGuard to implement IP-based tracking
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Generate a unique key for rate limiting based on IP address and endpoint
   * This ensures rate limits are tracked per IP address
   */
  protected async getTracker(req: Request): Promise<string> {
    // Get IP address from request
    // Support X-Forwarded-For header for proxies/load balancers
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';

    // Combine IP with the route path for unique tracking per endpoint
    const route = req.route?.path || req.path;

    return `${ip}-${route}`;
  }

  /**
   * Override error message to be more user-friendly
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new ThrottlerException(
      'Too many requests. Please try again later.',
    );
  }
}
