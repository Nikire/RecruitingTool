import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class PublicApiThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Key by API key uid so rate limits apply per key, not per IP.
    // Fallback to IP in case the guard runs before authentication (shouldn't happen).
    return req.apiKey?.uid ?? req.ip ?? 'anonymous';
  }
}
