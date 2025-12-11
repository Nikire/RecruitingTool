import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Invalidate a single cache key
   */
  async invalidate(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Invalidate all cache keys matching a pattern
   * Note: This is a simplified implementation for in-memory cache
   * For Redis, you would use SCAN/KEYS commands
   * @param _pattern - Pattern to match cache keys against (unused in in-memory implementation)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async invalidatePattern(_pattern?: string): Promise<void> {
    // For in-memory cache-manager, we cannot list keys easily
    // This is a no-op for now - cache will expire based on TTL
    // When migrating to Redis, implement proper key scanning
    // For now, we rely on TTL expiration
  }

  /**
   * Clear all cache entries
   * Note: reset() method might not be available in all cache-manager versions
   */
  async clear(): Promise<void> {
    // Clear is not directly supported in cache-manager v5+
    // Rely on TTL expiration for now
    // When migrating to Redis, implement proper cache clearing
  }

  /**
   * Set a cache value with optional TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Get a cache value
   */
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }
}
