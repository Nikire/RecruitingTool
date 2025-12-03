import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;

  // HTTP Metrics
  public readonly httpRequestsTotal: Counter;
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestErrors: Counter;

  // Business Metrics
  public readonly applicationsTotal: Gauge;
  public readonly jobPositionsTotal: Gauge;
  public readonly candidatesTotal: Gauge;
  public readonly interviewsTotal: Gauge;
  public readonly activeUsersTotal: Gauge;

  // Database Metrics
  public readonly dbConnectionsActive: Gauge;
  public readonly dbConnectionsIdle: Gauge;
  public readonly dbQueryDuration: Histogram;
  public readonly dbConnectionErrors: Counter;

  // AI API Metrics
  public readonly aiApiCallsTotal: Counter;
  public readonly aiApiCostTotal: Counter;
  public readonly aiApiErrors: Counter;
  public readonly aiQuotaUsage: Gauge;

  // Cache Metrics
  public readonly cacheHitsTotal: Counter;
  public readonly cacheMissesTotal: Counter;

  // System Metrics
  public readonly memoryUsage: Gauge;
  public readonly cpuUsage: Gauge;

  constructor() {
    this.registry = new Registry();

    // HTTP Request Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'status_code', 'error_type'],
      registers: [this.registry],
    });

    // Business Metrics
    this.applicationsTotal = new Gauge({
      name: 'applications_total',
      help: 'Total number of applications',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.jobPositionsTotal = new Gauge({
      name: 'job_positions_total',
      help: 'Total number of job positions',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.candidatesTotal = new Gauge({
      name: 'candidates_total',
      help: 'Total number of candidates',
      registers: [this.registry],
    });

    this.interviewsTotal = new Gauge({
      name: 'interviews_total',
      help: 'Total number of interviews',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.activeUsersTotal = new Gauge({
      name: 'active_users_total',
      help: 'Total number of active users',
      labelNames: ['role'],
      registers: [this.registry],
    });

    // Database Metrics
    this.dbConnectionsActive = new Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    this.dbConnectionsIdle = new Gauge({
      name: 'db_connections_idle',
      help: 'Number of idle database connections',
      registers: [this.registry],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation'],
      buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    this.dbConnectionErrors = new Counter({
      name: 'db_connection_errors_total',
      help: 'Total number of database connection errors',
      registers: [this.registry],
    });

    // AI API Metrics
    this.aiApiCallsTotal = new Counter({
      name: 'ai_api_calls_total',
      help: 'Total number of AI API calls',
      labelNames: ['provider', 'model', 'status'],
      registers: [this.registry],
    });

    this.aiApiCostTotal = new Counter({
      name: 'ai_api_cost_total',
      help: 'Total cost of AI API calls in USD',
      labelNames: ['provider', 'model'],
      registers: [this.registry],
    });

    this.aiApiErrors = new Counter({
      name: 'ai_api_errors_total',
      help: 'Total number of AI API errors',
      labelNames: ['provider', 'error_type'],
      registers: [this.registry],
    });

    this.aiQuotaUsage = new Gauge({
      name: 'ai_quota_usage_percent',
      help: 'AI quota usage percentage',
      labelNames: ['provider'],
      registers: [this.registry],
    });

    // Cache Metrics
    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['key_pattern'],
      registers: [this.registry],
    });

    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['key_pattern'],
      registers: [this.registry],
    });

    // System Metrics
    this.memoryUsage = new Gauge({
      name: 'nodejs_memory_usage_bytes',
      help: 'Node.js memory usage in bytes',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.cpuUsage = new Gauge({
      name: 'nodejs_cpu_usage_percent',
      help: 'Node.js CPU usage percentage',
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Collect default metrics (CPU, memory, event loop, etc.)
    collectDefaultMetrics({ register: this.registry, prefix: 'nodejs_' });

    // Start collecting system metrics every 10 seconds
    this.startSystemMetricsCollection();
  }

  private startSystemMetricsCollection() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
      this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
      this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
      this.memoryUsage.set({ type: 'external' }, memUsage.external);

      const cpuUsage = process.cpuUsage();
      this.cpuUsage.set((cpuUsage.user + cpuUsage.system) / 1000000);
    }, 10000);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }

  // Helper methods for recording metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  }

  recordHttpError(method: string, route: string, statusCode: number, errorType: string) {
    this.httpRequestErrors.inc({ method, route, status_code: statusCode, error_type: errorType });
  }

  recordDbQuery(operation: string, duration: number) {
    this.dbQueryDuration.observe({ operation }, duration);
  }

  recordDbConnections(active: number, idle: number) {
    this.dbConnectionsActive.set(active);
    this.dbConnectionsIdle.set(idle);
  }

  recordAiApiCall(provider: string, model: string, status: string, cost?: number) {
    this.aiApiCallsTotal.inc({ provider, model, status });
    if (cost) {
      this.aiApiCostTotal.inc({ provider, model }, cost);
    }
  }

  recordAiQuotaUsage(provider: string, usagePercent: number) {
    this.aiQuotaUsage.set({ provider }, usagePercent);
  }

  recordCacheHit(keyPattern: string) {
    this.cacheHitsTotal.inc({ key_pattern: keyPattern });
  }

  recordCacheMiss(keyPattern: string) {
    this.cacheMissesTotal.inc({ key_pattern: keyPattern });
  }

  // Business metrics update methods
  updateApplicationsCount(status: string, count: number) {
    this.applicationsTotal.set({ status }, count);
  }

  updateJobPositionsCount(status: string, count: number) {
    this.jobPositionsTotal.set({ status }, count);
  }

  updateCandidatesCount(count: number) {
    this.candidatesTotal.set(count);
  }

  updateInterviewsCount(status: string, count: number) {
    this.interviewsTotal.set({ status }, count);
  }

  updateActiveUsersCount(role: string, count: number) {
    this.activeUsersTotal.set({ role }, count);
  }
}
