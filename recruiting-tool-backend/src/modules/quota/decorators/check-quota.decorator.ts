import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { QuotaGuard, QUOTA_KEY } from '../guards/quota.guard';
import { QuotaResource } from '../config/plan-limits.config';

/**
 * Decorator to automatically check quota before executing a controller method
 *
 * @param resource - The quota resource to check (jobPositions, users, storage, etc.)
 *
 * @example
 * @Post()
 * @CheckQuota('jobPositions')
 * async createJobPosition() {
 *   // This will only execute if quota allows
 * }
 */
export function CheckQuota(resource: QuotaResource) {
  return applyDecorators(SetMetadata(QUOTA_KEY, resource), UseGuards(QuotaGuard));
}
