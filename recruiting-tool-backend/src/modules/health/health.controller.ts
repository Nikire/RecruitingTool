import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { StorageHealthIndicator } from './indicators/storage.health';
import { EmailHealthIndicator } from './indicators/email.health';
import { CacheService } from '../cache/cache.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator,
    private storage: StorageHealthIndicator,
    private email: EmailHealthIndicator,
    private cacheService: CacheService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Overall application health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this.health.check([
      () => this.db.isHealthy('database'),
      () => this.storage.isHealthy('storage'),
      () => this.email.isHealthy('email'),
    ]);
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

  @Get('cache')
  @ApiOperation({ summary: 'Cache health and statistics' })
  @ApiResponse({ status: 200, description: 'Cache is healthy and operational' })
  async checkCache() {
    try {
      // Test cache read/write
      const testKey = 'health-check-test';
      const testValue = { timestamp: new Date().toISOString() };

      await this.cacheService.set(testKey, testValue, 10000); // 10 seconds TTL
      const retrieved = await this.cacheService.get(testKey);

      const isWorking = retrieved !== undefined;

      return {
        status: isWorking ? 'ok' : 'degraded',
        type: 'in-memory',
        timestamp: new Date().toISOString(),
        testPassed: isWorking,
        details: {
          message: isWorking ? 'Cache read/write test successful' : 'Cache read/write test failed',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        type: 'in-memory',
        timestamp: new Date().toISOString(),
        testPassed: false,
        details: {
          message: 'Cache health check failed',
          error: error.message,
        },
      };
    }
  }
}
