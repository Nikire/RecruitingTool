import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { StorageHealthIndicator } from './indicators/storage.health';
import { EmailHealthIndicator } from './indicators/email.health';
import { DatabaseService } from '../shared/modules/database/database.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator,
    private storage: StorageHealthIndicator,
    private email: EmailHealthIndicator,
    private databaseService: DatabaseService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Overall application health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this.health.check([() => this.db.isHealthy('database'), () => this.storage.isHealthy('storage'), () => this.email.isHealthy('email')]);
  }

  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  checkDatabase() {
    return this.health.check([() => this.db.isHealthy('database')]);
  }

  @Get('storage')
  @HealthCheck()
  @ApiOperation({ summary: 'Storage (MinIO) health check' })
  @ApiResponse({ status: 200, description: 'Storage is healthy' })
  @ApiResponse({ status: 503, description: 'Storage is unhealthy' })
  checkStorage() {
    return this.health.check([() => this.storage.isHealthy('storage')]);
  }

  @Get('email')
  @HealthCheck()
  @ApiOperation({ summary: 'Email service health check' })
  @ApiResponse({ status: 200, description: 'Email service is healthy' })
  @ApiResponse({ status: 503, description: 'Email service is unhealthy' })
  checkEmail() {
    return this.health.check([() => this.email.isHealthy('email')]);
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Application is ready to serve traffic' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  readiness() {
    return this.health.check([() => this.db.isHealthy('database')]);
  }

  // Gated behind SUPER_ADMIN: this response leaks NODE_ENV, the package
  // version and process uptime, which is reconnaissance material for an
  // unauthenticated caller. /liveness and /readiness stay public so external
  // uptime monitors can poll them.
  @Get('detailed')
  @Auth(['SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @ApiForbiddenResponse({ description: 'Forbidden - SUPER_ADMIN role required' })
  @HealthCheck()
  @ApiOperation({ summary: 'Detailed health status with all system information - SUPER_ADMIN role required' })
  @ApiResponse({ status: 200, description: 'Detailed system health information' })
  @ApiResponse({ status: 503, description: 'One or more services are unhealthy' })
  async getDetailedHealth() {
    const healthCheckResult = await this.health.check([() => this.db.isHealthy('database'), () => this.storage.isHealthy('storage'), () => this.email.isHealthy('email')]);

    return {
      ...healthCheckResult,
      info: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('database/pool')
  @ApiOperation({ summary: 'Database connection pool statistics' })
  @ApiResponse({
    status: 200,
    description: 'Connection pool statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total connections to database' },
        active: { type: 'number', description: 'Active connections executing queries' },
        idle: { type: 'number', description: 'Idle connections available for use' },
        waiting: { type: 'number', description: 'Connections waiting for locks' },
        maxConnections: { type: 'number', description: 'PostgreSQL max_connections setting' },
        poolMax: { type: 'number', description: 'Application pool max size (DATABASE_POOL_MAX)' },
        utilizationPercent: { type: 'number', description: 'Pool utilization percentage (active/poolMax)' },
        timestamp: { type: 'string', format: 'date-time', description: 'Timestamp of statistics' },
      },
    },
  })
  async getConnectionPoolStats() {
    const stats = await this.databaseService.getConnectionPoolStats();
    return {
      ...stats,
      timestamp: new Date().toISOString(),
      healthy: stats.utilizationPercent < 90,
      warning: stats.utilizationPercent >= 80 && stats.utilizationPercent < 90,
      recommendations:
        stats.utilizationPercent > 80
          ? ['Connection pool utilization is high', `Consider increasing DATABASE_POOL_MAX (current: ${stats.poolMax})`, 'Monitor slow queries and optimize if necessary']
          : [],
    };
  }
}
