# Monitoring and Metrics Infrastructure

## Overview

Comprehensive monitoring and alerting system for tracking application health, performance, and business metrics in production.

**Implemented for:** GitHub Issue #83 - Add monitoring and alerting for production issues

## Architecture

### Components

1. **Metrics Module** (`src/modules/metrics/`)
   - `metrics.service.ts` - Core Prometheus metrics collection
   - `business-metrics.service.ts` - Business KPI tracking
   - `metrics.controller.ts` - API endpoints for metrics
   - `metrics.interceptor.ts` - HTTP request/response metrics
   - `metrics.module.ts` - Module configuration

2. **Health Module** (existing, `src/modules/health/`)
   - Database health indicators
   - Storage (MinIO) health indicators
   - Email service health indicators
   - Kubernetes readiness/liveness probes

## Metrics Collected

### 1. HTTP Metrics

- **http_requests_total** - Total HTTP requests
  - Labels: method, route, status_code
- **http_request_duration_seconds** - Request duration histogram
  - Labels: method, route, status_code
  - Buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5] seconds
- **http_request_errors_total** - HTTP request errors
  - Labels: method, route, status_code, error_type

### 2. Business Metrics

- **applications_total** - Total applications by status
  - Labels: status (PENDING, UNDER_REVIEW, INTERVIEW, OFFER, REJECTED)
- **job_positions_total** - Total job positions by status
  - Labels: status (DRAFT, OPEN, CLOSED)
- **candidates_total** - Total candidates in system
- **interviews_total** - Total interviews by status
  - Labels: status (SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED)
- **active_users_total** - Active users by role
  - Labels: role (ADMIN, HR, RECRUITER)

### 3. Database Metrics

- **db_connections_active** - Active database connections
- **db_connections_idle** - Idle database connections
- **db_query_duration_seconds** - Database query duration histogram
  - Labels: operation
  - Buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1] seconds
- **db_connection_errors_total** - Database connection errors

### 4. AI API Metrics

- **ai_api_calls_total** - Total AI API calls
  - Labels: provider, model, status
- **ai_api_cost_total** - Total AI API costs in USD
  - Labels: provider, model
- **ai_api_errors_total** - AI API errors
  - Labels: provider, error_type
- **ai_quota_usage_percent** - AI quota usage percentage
  - Labels: provider

### 5. Cache Metrics

- **cache_hits_total** - Cache hits
  - Labels: key_pattern
- **cache_misses_total** - Cache misses
  - Labels: key_pattern

### 6. System Metrics

- **nodejs_memory_usage_bytes** - Node.js memory usage
  - Labels: type (heapUsed, heapTotal, rss, external)
- **nodejs_cpu_usage_percent** - Node.js CPU usage percentage
- **nodejs_**** - Additional default Node.js metrics from prom-client

## API Endpoints

### Metrics Endpoints

#### `GET /metrics`
Prometheus-compatible metrics endpoint (text/plain format)
- Returns all metrics in Prometheus exposition format
- Auto-updates business metrics before returning
- **Content-Type:** text/plain; version=0.0.4

#### `GET /metrics/json`
JSON-formatted metrics
```json
{
  "timestamp": "2025-12-02T04:00:00.000Z",
  "http": {
    "http_requests_total": [...],
    "http_request_duration_seconds": [...]
  },
  "business": {
    "applications_total": [...],
    "job_positions_total": [...]
  },
  "database": {
    "db_connections_active": [...],
    "db_connections_idle": [...]
  },
  "system": {...},
  "ai": {...},
  "cache": {...}
}
```

#### `GET /metrics/business`
Business metrics summary
```json
{
  "timestamp": "2025-12-02T04:00:00.000Z",
  "applications": {
    "total": 150,
    "byStatus": {
      "PENDING": 20,
      "UNDER_REVIEW": 45,
      "INTERVIEW": 30,
      "OFFER": 10,
      "REJECTED": 45
    }
  },
  "jobPositions": {
    "total": 25,
    "byStatus": {
      "DRAFT": 3,
      "OPEN": 18,
      "CLOSED": 4
    }
  },
  "candidates": 320,
  "interviews": {
    "total": 85,
    "byStatus": {
      "SCHEDULED": 15,
      "COMPLETED": 60,
      "CANCELLED": 5,
      "RESCHEDULED": 5
    }
  },
  "activeUsers": {
    "total": 12,
    "byRole": {
      "ADMIN": 2,
      "HR": 6,
      "RECRUITER": 4
    }
  }
}
```

#### `GET /metrics/system`
System resource metrics
```json
{
  "memory": {
    "heapUsedMB": 125,
    "heapTotalMB": 200,
    "rssMB": 250,
    "externalMB": 15
  },
  "cpu": {
    "usagePercent": 12.5,
    "userSeconds": 45.2,
    "systemSeconds": 10.8
  },
  "uptime": {
    "seconds": 3600,
    "hours": 1.0,
    "days": 0.04
  },
  "version": "1.0.0",
  "environment": "production",
  "nodeVersion": "v20.19.6",
  "timestamp": "2025-12-02T04:00:00.000Z"
}
```

### Health Check Endpoints

#### `GET /health`
Overall application health check (from existing health module)
- Checks database, storage, email service
- Returns 200 if healthy, 503 if unhealthy

#### `GET /health/database`
Database-specific health check

#### `GET /health/storage`
MinIO storage health check

#### `GET /health/email`
Email service health check

#### `GET /health/liveness`
Kubernetes liveness probe

#### `GET /health/readiness`
Kubernetes readiness probe

#### `GET /health/detailed`
Detailed health with system information

#### `GET /health/database/pool`
Database connection pool statistics

## Usage

### Scraping with Prometheus

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'recruiting-tool-backend'
    scrape_interval: 15s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:4000']
```

### Grafana Dashboards

**Recommended Panels:**

1. **HTTP Performance**
   - Request rate (rate(http_requests_total[5m]))
   - Average response time (histogram_quantile(0.95, http_request_duration_seconds))
   - Error rate (rate(http_request_errors_total[5m]))

2. **Business KPIs**
   - Active applications by status (applications_total)
   - Job positions by status (job_positions_total)
   - Interview completion rate
   - User activity

3. **System Health**
   - Memory usage (nodejs_memory_usage_bytes)
   - CPU usage (nodejs_cpu_usage_percent)
   - Database connection pool utilization

4. **Database**
   - Connection pool usage (db_connections_active / pool_max)
   - Query performance (db_query_duration_seconds)
   - Connection errors (rate(db_connection_errors_total[5m]))

### Alerting Rules

**Recommended Prometheus Alerts:**

```yaml
groups:
  - name: recruiting_tool_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_request_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (>5%)"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time (p95 > 2s)"

      - alert: DatabaseConnectionPoolHigh
        expr: (db_connections_active / 20) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool >90% utilized"

      - alert: HighMemoryUsage
        expr: (nodejs_memory_usage_bytes{type="heapUsed"} / nodejs_memory_usage_bytes{type="heapTotal"}) > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage >90%"

      - alert: ServiceDown
        expr: up{job="recruiting-tool-backend"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
```

## Implementation Details

### Automatic HTTP Metrics Collection

The `MetricsInterceptor` automatically tracks all HTTP requests:
- Request count by method, route, and status code
- Response time histogram
- Error tracking with error types
- Route normalization (UIDs replaced with `:uid`, IDs with `:id`)

### Business Metrics Updates

Business metrics are updated automatically when `/metrics` endpoint is called.
They can also be updated on-demand via the `BusinessMetricsService`.

### Database Connection Monitoring

Connection pool statistics are tracked via `DatabaseService.getConnectionPoolStats()`:
- Active connections
- Idle connections
- Waiting connections
- Pool utilization percentage

## Deployment

### Docker

The metrics module is integrated into the Docker container. Ensure prom-client is installed:

```bash
# In recruiting-tool-backend/
yarn add prom-client
```

Then rebuild:

```bash
docker-compose up -d --build backend
```

### Environment Variables

No additional environment variables required. Metrics collection starts automatically.

### Kubernetes

For Kubernetes deployments:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: recruiting-tool-backend
  labels:
    app: recruiting-tool-backend
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/path: "/metrics"
    prometheus.io/port: "4000"
spec:
  ports:
    - port: 4000
      targetPort: 4000
  selector:
    app: recruiting-tool-backend
```

## Future Enhancements

### Pending Improvements:

1. **Distributed Tracing**
   - Integrate OpenTelemetry for request tracing
   - Trace database queries and external API calls
   - Visualize with Jaeger or Zipkin

2. **Error Tracking**
   - Integrate Sentry for error aggregation
   - Track stack traces and user context
   - Set up error notifications

3. **Performance Profiling**
   - CPU profiling for hot paths
   - Memory leak detection
   - Slow query identification

4. **Custom Business Alerts**
   - Alert on low application conversion rates
   - Notify on unusually high interview cancellations
   - Track SLA compliance metrics

5. **Frontend Monitoring**
   - Add frontend metrics collection (React)
   - Track page load times
   - Monitor client-side errors
   - Track user interactions

6. **Log Aggregation**
   - Integrate with Loki or ELK stack
   - Centralize logs from all containers
   - Structured logging with correlation IDs

## Testing

### Local Testing

1. Start the application:
   ```bash
   docker-compose up -d backend
   ```

2. View metrics:
   ```bash
   curl http://localhost:4000/metrics
   curl http://localhost:4000/metrics/json
   curl http://localhost:4000/metrics/business
   curl http://localhost:4000/metrics/system
   ```

3. View health checks:
   ```bash
   curl http://localhost:4000/health
   curl http://localhost:4000/health/detailed
   ```

### Load Testing

Use tools like Apache Bench or k6 to generate traffic and observe metrics:

```bash
# Generate 1000 requests with 10 concurrent
ab -n 1000 -c 10 http://localhost:4000/health

# Then check metrics
curl http://localhost:4000/metrics/json
```

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/)
- [prom-client](https://github.com/siimon/prom-client)
- [NestJS Terminus](https://docs.nestjs.com/recipes/terminus)

## Troubleshooting

### Metrics Not Updating

- Check that the backend is running: `docker-compose ps backend`
- View logs: `docker-compose logs backend`
- Verify `/metrics` endpoint is accessible: `curl http://localhost:4000/metrics`

### High Memory Usage

- Check Node.js heap size: `GET /metrics/system`
- Review memory metrics: `GET /metrics/json`
- Consider increasing container memory limits

### Database Connection Errors

- Check pool statistics: `GET /health/database/pool`
- Review connection limits in environment variables
- Consider increasing `DATABASE_POOL_MAX`

---

**Last Updated:** 2025-12-02
**Author:** DevOps Specialist Agent
**Related Issue:** #83
