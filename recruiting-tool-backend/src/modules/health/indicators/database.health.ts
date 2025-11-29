import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DatabaseService } from '../../shared/modules/database/database.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.databaseService.checkHealth();
      const poolStats = await this.databaseService.getConnectionPoolStats();

      if (isHealthy) {
        return this.getStatus(key, true, {
          message: 'Database is healthy',
          pool: poolStats,
        });
      } else {
        return this.getStatus(key, false, {
          message: 'Database connection failed',
        });
      }
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
      });
    }
  }
}
