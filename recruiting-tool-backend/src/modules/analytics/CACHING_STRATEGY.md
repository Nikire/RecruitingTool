# Analytics Module - Caching Strategy

## Overview

The analytics module performs complex aggregations and calculations across multiple database tables. To optimize performance, a comprehensive caching strategy should be implemented.

## Current State

**Status:** No caching implemented (v1.0)

All analytics queries execute in real-time against the PostgreSQL database. This approach ensures:
- Always fresh data
- No cache invalidation complexity
- Simpler initial implementation

## Performance Considerations

### Query Complexity
- **Overview metrics:** 3 parallel queries (time, conversion, volume)
- **Pipeline funnel:** Single query with stage filtering
- **Time-to-hire:** 2 queries (current + previous period)
- **Source effectiveness:** Single query with multiple includes
- **Stage duration:** Single query with stage analysis

### Expected Performance
- Small datasets (<1000 records): <500ms response time
- Medium datasets (1000-10000 records): 500ms-2s response time
- Large datasets (>10000 records): 2s-5s response time

## Recommended Caching Strategy (Future Enhancement)

### Option 1: Redis Cache (Recommended)

**Implementation:**
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly databaseService: DatabaseService,
  ) {}

  async getOverviewMetrics(queryDto: DateRangeQueryDto, user: User) {
    const cacheKey = `analytics:overview:${user.companyId}:${queryDto.startDate}:${queryDto.endDate}`;

    // Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Calculate metrics
    const metrics = await this.calculateOverviewMetrics(queryDto, user);

    // Cache for 15 minutes
    await this.cacheManager.set(cacheKey, metrics, 900);

    return metrics;
  }
}
```

**Cache Keys Structure:**
- `analytics:overview:{companyId}:{startDate}:{endDate}`
- `analytics:pipeline:{companyId}:{startDate}:{endDate}`
- `analytics:time-to-hire:{companyId}:{startDate}:{endDate}`
- `analytics:source-effectiveness:{companyId}:{startDate}:{endDate}`
- `analytics:stage-duration:{companyId}:{startDate}:{endDate}`

**TTL (Time-to-Live):**
- Default: 15 minutes (900 seconds)
- Adjustable based on data update frequency
- Can be reduced to 5 minutes for more real-time data

**Cache Invalidation:**
1. **Time-based:** Automatic expiration after TTL
2. **Event-based:** Invalidate on hiring process updates:
   ```typescript
   // In hiring-process.service.ts
   async updateStatus(uid: string, status: HiringProcessStatus) {
     const process = await this.update(uid, { status });

     // Invalidate analytics cache for this company
     await this.cacheManager.del(`analytics:*:${process.companyId}:*`);

     return process;
   }
   ```

**Benefits:**
- 50-90% reduction in database queries
- Sub-100ms response times for cached data
- Scales horizontally with Redis cluster
- Can be shared across multiple backend instances

**Drawbacks:**
- Additional infrastructure (Redis server)
- Cache invalidation complexity
- Stale data for TTL duration
- Memory overhead

### Option 2: In-Memory Cache (NestJS Cache Manager)

**Implementation:**
```typescript
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 900, // 15 minutes
      max: 100, // Maximum number of items in cache
      isGlobal: true,
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

**Benefits:**
- No external dependencies
- Simple setup
- Good for single-instance deployments

**Drawbacks:**
- Not shared across multiple instances
- Limited memory (cache eviction)
- Lost on server restart

### Option 3: Database Materialized Views

**Implementation:**
```sql
-- Create materialized view for daily analytics
CREATE MATERIALIZED VIEW analytics_daily AS
SELECT
  DATE(hp.created_at) as date,
  hp.company_id,
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE hp.status = 'CLOSED') as total_hires,
  AVG(EXTRACT(EPOCH FROM (hp.updated_at - hp.created_at))/86400)
    FILTER (WHERE hp.status = 'CLOSED') as avg_time_to_hire
FROM hiring_process hp
GROUP BY DATE(hp.created_at), hp.company_id;

-- Refresh strategy
CREATE INDEX ON analytics_daily (company_id, date);

-- Refresh nightly
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily;
```

**Benefits:**
- Leverages PostgreSQL's built-in features
- Extremely fast queries (pre-aggregated)
- Consistent with database backups

**Drawbacks:**
- Less flexible than application-level caching
- Requires database schema changes
- Refresh overhead (can be scheduled)

## Implementation Priority

### Phase 1: No Caching (Current)
- **Timeline:** Initial release
- **Use case:** Small to medium datasets
- **Performance:** Acceptable for <10,000 records

### Phase 2: Redis Cache (Recommended Next)
- **Timeline:** After initial deployment, based on performance metrics
- **Trigger:** Average response time >2s or database CPU >70%
- **Dependencies:** Redis server setup

### Phase 3: Materialized Views (Advanced)
- **Timeline:** Large-scale deployments
- **Trigger:** >100,000 records or complex multi-tenant scenarios
- **Dependencies:** Database administration, scheduled jobs

## Monitoring Recommendations

Track these metrics to determine when caching is needed:

1. **Response Times:**
   - p50, p95, p99 latencies for each endpoint
   - Target: p95 <1s, p99 <2s

2. **Database Load:**
   - Query execution time
   - Connection pool usage
   - CPU/Memory on PostgreSQL server

3. **Cache Performance (if implemented):**
   - Hit rate (target: >80%)
   - Miss rate
   - Eviction rate
   - Memory usage

## Testing Cache Implementation

```typescript
// analytics.service.spec.ts
describe('AnalyticsService with caching', () => {
  it('should return cached data on second call', async () => {
    const result1 = await service.getOverviewMetrics(queryDto, user);
    const result2 = await service.getOverviewMetrics(queryDto, user);

    expect(result1).toEqual(result2);
    expect(mockDatabaseService.hiringProcess.findMany).toHaveBeenCalledTimes(1);
  });

  it('should invalidate cache after TTL', async () => {
    const result1 = await service.getOverviewMetrics(queryDto, user);

    // Fast-forward time
    jest.advanceTimersByTime(901000); // 15 minutes + 1 second

    const result2 = await service.getOverviewMetrics(queryDto, user);

    expect(mockDatabaseService.hiringProcess.findMany).toHaveBeenCalledTimes(2);
  });
});
```

## Configuration

Create environment variables for cache settings:

```env
# .env
ANALYTICS_CACHE_ENABLED=true
ANALYTICS_CACHE_TTL=900  # 15 minutes
ANALYTICS_CACHE_MAX_ITEMS=100
REDIS_URL=redis://localhost:6379
```

## Conclusion

**Current recommendation:** Monitor performance metrics after deployment. Implement Redis caching (Phase 2) if response times exceed 2 seconds or database load becomes a concern.

**Next steps:**
1. Deploy without caching
2. Monitor performance for 2-4 weeks
3. Analyze metrics and user feedback
4. Implement caching if needed
5. Continue monitoring cache hit rates

---

**Last Updated:** 2025-11-25
**Version:** 1.0
**Author:** Analytics Module Development Team
