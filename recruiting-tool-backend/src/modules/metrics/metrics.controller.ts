import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { MetricsService } from './metrics.service';
import { BusinessMetricsService } from './business-metrics.service';
import { MetricsTokenGuard } from './guards/metrics-token.guard';

/**
 * Every route here was previously unauthenticated. Between them they exposed
 * candidate/application/job counts, active users broken down by role, AI spend,
 * database pool state, memory/CPU and the Node version — enough for anyone who
 * guessed the URL to size the customer base and fingerprint the runtime.
 *
 * The JSON routes now require SUPER_ADMIN. The Prometheus scrape route uses a
 * static bearer token instead, because a scraper cannot present a JWT.
 */
@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly businessMetricsService: BusinessMetricsService,
  ) {}

  // Prometheus scrape target. Authenticated with a static bearer token
  // (METRICS_TOKEN) rather than a JWT, since a scraper cannot log in.
  // Fails closed when METRICS_TOKEN is unset — see MetricsTokenGuard.
  @Get()
  @UseGuards(MetricsTokenGuard)
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiExcludeEndpoint() // Exclude from Swagger as it returns Prometheus format
  async getMetrics(): Promise<string> {
    // Update business metrics before returning all metrics
    await this.businessMetricsService.updateAllMetrics();
    return this.metricsService.getMetrics();
  }

  @Get('json')
  @Auth(['SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @ApiForbiddenResponse({ description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiOperation({ summary: 'Get all metrics in JSON format - SUPER_ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'Current application metrics',
    schema: {
      type: 'object',
      properties: {
        http: {
          type: 'object',
          properties: {
            totalRequests: { type: 'number' },
            averageResponseTime: { type: 'number' },
            errorRate: { type: 'number' },
          },
        },
        business: {
          type: 'object',
          properties: {
            applications: { type: 'object' },
            jobPositions: { type: 'object' },
            candidates: { type: 'number' },
            interviews: { type: 'object' },
            activeUsers: { type: 'object' },
          },
        },
        database: {
          type: 'object',
          properties: {
            connectionsActive: { type: 'number' },
            connectionsIdle: { type: 'number' },
            poolUtilization: { type: 'number' },
          },
        },
        system: {
          type: 'object',
          properties: {
            memoryUsageMB: { type: 'number' },
            cpuUsagePercent: { type: 'number' },
            uptimeSeconds: { type: 'number' },
          },
        },
      },
    },
  })
  async getMetricsJson() {
    await this.businessMetricsService.updateAllMetrics();
    const metrics = await this.metricsService.getRegistry().getMetricsAsJSON();

    // Transform Prometheus metrics to a more readable JSON format
    const transformed = this.transformMetrics(metrics);

    return {
      timestamp: new Date().toISOString(),
      ...transformed,
    };
  }

  @Get('business')
  @Auth(['SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @ApiForbiddenResponse({ description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiOperation({ summary: 'Get business metrics - SUPER_ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'Current business metrics',
    schema: {
      type: 'object',
      properties: {
        applications: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            byStatus: { type: 'object' },
          },
        },
        jobPositions: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            byStatus: { type: 'object' },
          },
        },
        candidates: { type: 'number' },
        interviews: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            byStatus: { type: 'object' },
          },
        },
        activeUsers: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            byRole: { type: 'object' },
          },
        },
      },
    },
  })
  async getBusinessMetrics() {
    return this.businessMetricsService.getBusinessMetricsSummary();
  }

  @Get('system')
  @Auth(['SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @ApiForbiddenResponse({ description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiOperation({ summary: 'Get system metrics - SUPER_ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'Current system metrics',
    schema: {
      type: 'object',
      properties: {
        memory: {
          type: 'object',
          properties: {
            heapUsedMB: { type: 'number' },
            heapTotalMB: { type: 'number' },
            rssMB: { type: 'number' },
            externalMB: { type: 'number' },
          },
        },
        cpu: {
          type: 'object',
          properties: {
            usagePercent: { type: 'number' },
            userSeconds: { type: 'number' },
            systemSeconds: { type: 'number' },
          },
        },
        uptime: {
          type: 'object',
          properties: {
            seconds: { type: 'number' },
            hours: { type: 'number' },
            days: { type: 'number' },
          },
        },
        version: { type: 'string' },
        environment: { type: 'string' },
        nodeVersion: { type: 'string' },
      },
    },
  })
  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    return {
      memory: {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
        externalMB: Math.round(memUsage.external / 1024 / 1024),
      },
      cpu: {
        usagePercent: Math.round(((cpuUsage.user + cpuUsage.system) / 1000000) * 100) / 100,
        userSeconds: Math.round((cpuUsage.user / 1000000) * 100) / 100,
        systemSeconds: Math.round((cpuUsage.system / 1000000) * 100) / 100,
      },
      uptime: {
        seconds: Math.round(uptime),
        hours: Math.round((uptime / 3600) * 100) / 100,
        days: Math.round((uptime / 86400) * 100) / 100,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }

  private transformMetrics(metrics: any[]): any {
    const result: any = {
      http: {},
      business: {},
      database: {},
      system: {},
      ai: {},
      cache: {},
    };

    for (const metric of metrics) {
      const name = metric.name;

      if (name.startsWith('http_')) {
        result.http[name] = metric.values || metric.value;
      } else if (
        name.includes('applications_') ||
        name.includes('job_positions_') ||
        name.includes('candidates_') ||
        name.includes('interviews_') ||
        name.includes('active_users_')
      ) {
        result.business[name] = metric.values || metric.value;
      } else if (name.startsWith('db_')) {
        result.database[name] = metric.values || metric.value;
      } else if (name.startsWith('nodejs_')) {
        result.system[name] = metric.values || metric.value;
      } else if (name.startsWith('ai_')) {
        result.ai[name] = metric.values || metric.value;
      } else if (name.startsWith('cache_')) {
        result.cache[name] = metric.values || metric.value;
      }
    }

    return result;
  }
}
