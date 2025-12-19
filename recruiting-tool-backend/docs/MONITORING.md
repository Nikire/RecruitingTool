# Monitoring and Alerting Infrastructure

## Overview

The BorderLess application includes comprehensive monitoring and alerting infrastructure to ensure production reliability and quick issue detection.

**Key Features:**
- Health check endpoints for all critical services
- Structured logging with correlation IDs
- Performance monitoring and metrics collection
- Error tracking with detailed context
- Database query performance monitoring
- Docker health checks for container orchestration

---

## Health Check Endpoints

All health check endpoints are available under the `/api/health` path.

### 1. Liveness Probe

**Endpoint:** `GET /api/health/liveness`

**Purpose:** Kubernetes liveness probe - checks if the application is alive

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T10:00:00.000Z"
}
```

**Use Case:** Container orchestration platforms use this to restart unhealthy containers

---

### 2. Readiness Probe

**Endpoint:** `GET /api/health/readiness`

**Purpose:** Kubernetes readiness probe - checks if the application is ready to serve traffic

**Checks:**
- Database connectivity

**Response (Healthy):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

**Response (Unhealthy):**
```json
{
  "status": "error",
  "info": {},
  "error": {
    "database": {
      "status": "down",
      "message": "Connection failed"
    }
  },
  "details": {
    "database": {
      "status": "down",
      "message": "Connection failed"
    }
  }
}
```

---

### 3. Overall Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Comprehensive health status of all services

**Checks:**
- Database (PostgreSQL)
- Storage (MinIO S3)
- Email service (SendGrid)

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "storage": { "status": "up" },
    "email": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "storage": { "status": "up" },
    "email": { "status": "up" }
  }
}
```

---

### 4. Detailed Health Status

**Endpoint:** `GET /api/health/detailed`

**Purpose:** Detailed system health information including environment and uptime

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "storage": { "status": "up" },
    "email": { "status": "up" },
    "version": "1.0.0",
    "environment": "production",
    "uptime": 123456,
    "timestamp": "2025-12-01T10:00:00.000Z"
  }
}
```

---

### 5. Service-Specific Health Checks

**Database Health:**
- Endpoint: `GET /api/health/database`
- Checks: PostgreSQL connection

**Storage Health:**
- Endpoint: `GET /api/health/storage`
- Checks: MinIO S3 connectivity

**Email Service Health:**
- Endpoint: `GET /api/health/email`
- Checks: SendGrid API availability

---

### 6. Database Connection Pool Statistics

**Endpoint:** `GET /api/health/database/pool`

**Purpose:** Monitor database connection pool utilization

**Response:**
```json
{
  "total": 8,
  "active": 3,
  "idle": 5,
  "waiting": 0,
  "maxConnections": 100,
  "poolMax": 20,
  "utilizationPercent": 15,
  "timestamp": "2025-12-01T10:00:00.000Z",
  "healthy": true,
  "warning": false,
  "recommendations": []
}
```

**Alerts:**
- `utilizationPercent > 80%`: Warning - consider increasing pool size
- `utilizationPercent > 90%`: Critical - immediate action required

---

## Structured Logging

### Log Levels

All logs follow NestJS standard log levels:

- `log` - Informational messages (200-399 status codes)
- `warn` - Warning messages (400-499 status codes, slow requests)
- `error` - Error messages (500+ status codes, exceptions)
- `debug` - Debug information (development only)

---

### Correlation IDs

Every request is assigned a unique correlation ID for distributed tracing.

**Request Header:**
```
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

**Log Format:**
```json
{
  "type": "request",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/candidates",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "userId": "usr_1234567890",
  "userRole": "hr",
  "timestamp": "2025-12-01T10:00:00.000Z"
}
```

---

### Request/Response Logging

**Request Log:**
```json
{
  "type": "request",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "path": "/api/candidates",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "userId": "usr_1234567890",
  "userRole": "hr",
  "timestamp": "2025-12-01T10:00:00.000Z"
}
```

**Response Log:**
```json
{
  "type": "response",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "path": "/api/candidates",
  "statusCode": 200,
  "duration": "45ms",
  "userId": "usr_1234567890",
  "userRole": "hr",
  "contentLength": "1024",
  "timestamp": "2025-12-01T10:00:00.100Z"
}
```

---

### Slow Request Detection

Requests exceeding 3 seconds are automatically logged as warnings:

```json
{
  "type": "slow-request",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/candidates/import",
  "duration": "3500ms",
  "threshold": "3000ms",
  "message": "Request exceeded performance threshold"
}
```

---

## Performance Monitoring

### Request Duration Tracking

All requests are tracked with high-resolution timing (nanosecond precision).

**Performance Thresholds:**
- Normal: < 1000ms
- Warning: 1000ms - 3000ms (logged as warning)
- Critical: > 3000ms (logged as error)

**Log Example:**
```json
{
  "type": "slow-performance",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/ai/batch-score",
  "statusCode": 200,
  "duration": "2500ms",
  "threshold": "1000ms",
  "message": "Request exceeded warning performance threshold"
}
```

---

### Memory Usage Tracking

Each request tracks memory delta (heap and RSS):

```json
{
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/candidates",
  "statusCode": 201,
  "duration": "120ms",
  "memoryDelta": {
    "heapUsed": "2.45MB",
    "rss": "3.12MB"
  }
}
```

**Get Current Memory Usage:**
```typescript
const performanceMiddleware = app.get(PerformanceMiddleware);
const memoryUsage = performanceMiddleware.getMemoryUsage();
```

**Response:**
```json
{
  "heapUsed": "156.23MB",
  "heapTotal": "200.00MB",
  "rss": "250.45MB",
  "external": "10.12MB",
  "arrayBuffers": "0.50MB"
}
```

---

### Endpoint-Level Metrics

Performance metrics are tracked per endpoint:

```typescript
const performanceMiddleware = app.get(PerformanceMiddleware);
const metrics = performanceMiddleware.getMetrics();
```

**Metrics Format:**
```json
{
  "GET /api/candidates": {
    "count": 1250,
    "totalDuration": 62500,
    "minDuration": 25,
    "maxDuration": 450,
    "avgDuration": 50
  }
}
```

**Reset Metrics (Periodic Cleanup):**
```typescript
performanceMiddleware.resetMetrics();
```

---

## Database Query Monitoring

### Slow Query Detection

**Automatically logged in database.service.ts**

Queries exceeding 100ms are logged as warnings:

```
[DatabaseService] Slow query detected (250ms): SELECT * FROM "Candidate" WHERE...
```

**Development Mode:**
All queries > 10ms are logged with duration.

---

### Connection Pool Monitoring

**Automatic Monitoring:**
- Runs every 5 minutes in development
- Logs pool utilization statistics
- Warns if utilization > 80%

**Manual Check:**
```bash
curl http://localhost:4000/api/health/database/pool
```

**High Utilization Warning:**
```
[DatabaseService] High connection pool utilization detected (85%). Consider increasing DATABASE_POOL_MAX.
```

---

## Error Tracking

### Global Exception Filter

All exceptions are caught and logged with full context.

**Error Log Format:**
```json
{
  "status": 500,
  "error": "InternalServerError",
  "message": "Unexpected error occurred",
  "stack": "Error: ...\n    at ...",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

**Production Mode:**
- Stack traces are NOT sent to clients (security)
- Full error details logged server-side
- Generic error messages shown to users

**Development Mode:**
- Stack traces included in response
- Detailed error messages for debugging

---

### Prisma Exception Handling

Database errors are caught and translated to user-friendly messages.

**Example - Unique Constraint Violation:**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "A user with this email address already exists in this company.",
  "error": "UniqueConstraintViolation",
  "timestamp": "2025-12-01T10:00:00.000Z",
  "path": "/api/users"
}
```

**Server-Side Log:**
```json
{
  "status": 409,
  "error": "UniqueConstraintViolation",
  "message": "A user with this email address already exists in this company.",
  "prismaCode": "P2002",
  "meta": { "target": ["email", "companyId"] },
  "userAgent": "...",
  "ip": "192.168.1.1"
}
```

---

## Docker Health Checks

All services have health checks configured in `docker-compose.yml`.

### Backend

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:4000/api/health/liveness']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Frontend

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:80']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

### Database (PostgreSQL)

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U $POSTGRES_USER -d $POSTGRES_DB -h 127.0.0.1 -p 5432']
  interval: 10s
  timeout: 5s
  retries: 5
```

### PgBouncer (Connection Pooler)

```yaml
healthcheck:
  test: ['CMD', 'pg_isready', '-h', 'localhost', '-p', '6432', '-U', '$POSTGRES_USER']
  interval: 10s
  timeout: 5s
  retries: 5
```

### MinIO (Object Storage)

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
  interval: 30s
  timeout: 20s
  retries: 3
```

### N8N (Workflow Automation)

```yaml
healthcheck:
  test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:5678/healthz']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

---

## Viewing Container Health Status

**Check all container statuses:**
```bash
docker-compose ps
```

**Check specific service health:**
```bash
docker inspect --format='{{.State.Health.Status}}' recruiting_tool_backend
```

**View health check logs:**
```bash
docker inspect --format='{{json .State.Health}}' recruiting_tool_backend | jq
```

---

## Integration with External Monitoring (Future)

The current monitoring infrastructure is designed to be easily integrated with external monitoring services:

### Sentry (Error Tracking)

**When to integrate:** Production deployment

**Benefits:**
- Centralized error tracking
- Error grouping and deduplication
- User impact analysis
- Release tracking

**Integration Point:** Update `HttpExceptionFilter` to send errors to Sentry

---

### Datadog / New Relic (APM)

**When to integrate:** Production deployment with high traffic

**Benefits:**
- Application performance monitoring
- Distributed tracing
- Custom metrics and dashboards
- Alerting and incident management

**Integration Point:** Add APM agent to NestJS application

---

### Prometheus + Grafana (Metrics)

**When to integrate:** Production or staging environment

**Benefits:**
- Time-series metrics collection
- Custom dashboards
- Alert rules and notifications
- Historical performance analysis

**Integration Point:** Expose Prometheus metrics endpoint

---

### ELK Stack (Centralized Logging)

**When to integrate:** Multi-instance deployment

**Benefits:**
- Centralized log aggregation
- Full-text log search
- Log visualization and analysis
- Custom alerts

**Integration Point:** Ship structured logs to Elasticsearch

---

## Best Practices

### 1. Monitor Health Endpoints Regularly

Set up monitoring to check health endpoints every 1-5 minutes:

```bash
# Example cron job
*/5 * * * * curl -f http://localhost:4000/api/health || echo "Health check failed"
```

### 2. Set Up Alerts

Configure alerts for:
- Health check failures (> 3 consecutive failures)
- High error rate (> 5% of requests)
- Slow requests (> 10% of requests > 3s)
- High database pool utilization (> 80%)
- Memory usage (> 80% of allocated)

### 3. Review Logs Daily

Check logs for:
- Slow queries (> 500ms)
- Slow requests (> 1s)
- Errors and exceptions
- High database pool utilization

### 4. Performance Baselines

Establish performance baselines for:
- Average request duration
- P95 request duration
- Database query duration
- Memory usage patterns

### 5. Regular Maintenance

Schedule regular maintenance:
- Weekly review of slow queries
- Monthly review of error trends
- Quarterly performance optimization
- Update monitoring thresholds as needed

---

## Troubleshooting

### High Database Pool Utilization

**Symptoms:**
- Warning logs about pool utilization > 80%
- Slow database queries
- Request timeouts

**Solutions:**
1. Check connection pool stats: `GET /api/health/database/pool`
2. Increase `DATABASE_POOL_MAX` environment variable
3. Optimize slow queries
4. Enable PgBouncer for advanced connection pooling

---

### Slow Requests

**Symptoms:**
- Warning/error logs about slow requests
- High response times

**Solutions:**
1. Check performance metrics per endpoint
2. Review slow query logs
3. Profile memory-intensive operations
4. Add caching for frequently accessed data
5. Optimize database queries (indexes, etc.)

---

### High Memory Usage

**Symptoms:**
- Large memory deltas in performance logs
- Container restarts due to OOM

**Solutions:**
1. Check memory usage: `performanceMiddleware.getMemoryUsage()`
2. Review memory-intensive endpoints
3. Add pagination to large dataset queries
4. Implement caching strategies
5. Increase container memory limits

---

### Health Check Failures

**Symptoms:**
- Container marked as unhealthy
- Docker restarts containers
- Health endpoint returns 503

**Solutions:**
1. Check service-specific health: `/api/health/database`, `/api/health/storage`, `/api/health/email`
2. Review service logs: `docker-compose logs backend`
3. Verify environment variables are set correctly
4. Check external service connectivity (PostgreSQL, MinIO, SendGrid)

---

## Environment Variables

### Logging Configuration

```bash
# Enable detailed logging in development
NODE_ENV=development

# Enable connection pool logging
DATABASE_POOL_LOGGING=true
```

### Database Pool Configuration

```bash
# Connection pool settings
DATABASE_POOL_MIN=2                 # Minimum connections
DATABASE_POOL_MAX=10                # Maximum connections
DATABASE_POOL_ACQUIRE_TIMEOUT=60000 # Timeout to acquire connection (ms)
DATABASE_POOL_IDLE_TIMEOUT=600000   # Idle connection timeout (ms)
DATABASE_POOL_MAX_LIFETIME=1800000  # Max connection lifetime (ms)
```

---

## Summary

The BorderLess application includes production-ready monitoring infrastructure:

✅ **Health Checks** - Comprehensive endpoints for all services
✅ **Structured Logging** - Correlation IDs, request/response tracking
✅ **Performance Monitoring** - Request duration, memory usage, metrics
✅ **Error Tracking** - Global exception handling with detailed context
✅ **Database Monitoring** - Slow query detection, connection pool stats
✅ **Docker Health Checks** - Container orchestration support

**Ready for:**
- Production deployment
- Integration with external monitoring services
- Alerting and incident response
- Performance optimization

For production deployment, consider integrating with external monitoring services like Sentry, Datadog, or ELK Stack for centralized monitoring and alerting.
