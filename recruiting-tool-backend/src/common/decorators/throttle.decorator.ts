import { SetMetadata } from '@nestjs/common';

export const THROTTLE_TTL = 'throttle_ttl';
export const THROTTLE_LIMIT = 'throttle_limit';

/**
 * Custom decorator for endpoint-specific rate limiting
 * @param limit - Maximum number of requests
 * @param ttl - Time window in seconds
 *
 * @example
 * // 5 requests per 15 minutes (900 seconds)
 * @ThrottleEndpoint(5, 900)
 *
 * // 10 requests per hour (3600 seconds)
 * @ThrottleEndpoint(10, 3600)
 */
export const ThrottleEndpoint = (limit: number, ttl: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(THROTTLE_LIMIT, limit)(target, propertyKey, descriptor);
    SetMetadata(THROTTLE_TTL, ttl)(target, propertyKey, descriptor);
  };
};

/**
 * Skip throttling for specific endpoints
 * Useful for health checks or internal endpoints
 */
export const SkipThrottle = () => {
  return SetMetadata('skipThrottle', true);
};
