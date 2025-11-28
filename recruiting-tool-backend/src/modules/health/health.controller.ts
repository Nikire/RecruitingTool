import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../shared/modules/database/database.service';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  services: {
    database: {
      status: string;
      connectionPool: any;
    };
  };
}

interface DatabaseHealthResponse {
  healthy: boolean;
  timestamp: string;
  connectionPool: any;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check(): Promise<HealthCheckResponse> {
    const dbHealthy = await this.databaseService.checkHealth();
    const poolStats = await this.databaseService.getConnectionPoolStats();

    return {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealthy ? 'ok' : 'error',
          connectionPool: poolStats,
        },
      },
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health and connection pool status' })
  @ApiResponse({ status: 200, description: 'Database connection pool stats' })
  async database(): Promise<DatabaseHealthResponse> {
    const isHealthy = await this.databaseService.checkHealth();
    const poolStats = await this.databaseService.getConnectionPoolStats();

    return {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      connectionPool: poolStats,
    };
  }
}
