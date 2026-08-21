import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';

/**
 * Bearer-token guard for the raw Prometheus scrape endpoint (GET /api/metrics).
 *
 * The JSON metrics routes are gated with @Auth(['SUPER_ADMIN']), but a
 * Prometheus scraper cannot hold a JWT, so this route uses a static token
 * supplied by the scrape config:
 *
 *   Authorization: Bearer <METRICS_TOKEN>
 *
 * Mirrors InternalApiKeyGuard: getOrThrow, never get(key, default). A default
 * would mean an unset METRICS_TOKEN silently accepts a well-known string on a
 * public host, which is worse than the unauthenticated endpoint we are
 * replacing. With getOrThrow an unset token makes every request fail — the
 * route fails closed, not open.
 */
@Injectable()
export class MetricsTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Throws if METRICS_TOKEN is not configured -> endpoint is unreachable
    // rather than open. Fail closed.
    const expectedToken = this.configService.getOrThrow<string>('METRICS_TOKEN');

    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing metrics bearer token');
    }

    const [scheme, token] = authHeader.split(' ');

    if (!token || scheme?.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Invalid or missing metrics bearer token');
    }

    if (!this.safeEquals(token, expectedToken)) {
      throw new UnauthorizedException('Invalid or missing metrics bearer token');
    }

    return true;
  }

  /**
   * Constant-time comparison. Hashing both sides first gives two equal-length
   * buffers, which timingSafeEqual requires, and avoids leaking the token
   * length through an early return.
   */
  private safeEquals(provided: string, expected: string): boolean {
    const providedHash = createHash('sha256').update(provided).digest();
    const expectedHash = createHash('sha256').update(expected).digest();
    return timingSafeEqual(providedHash, expectedHash);
  }
}
