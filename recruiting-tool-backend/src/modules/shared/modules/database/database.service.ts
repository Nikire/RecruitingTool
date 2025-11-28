import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected with connection pooling');

      // Enable slow query logging (queries > 100ms)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.$on('query' as never, (e: any) => {
        if (e.duration > 100) {
          this.logger.warn(
            `Slow query detected (${e.duration}ms): ${e.query.substring(0, 200)}${e.query.length > 200 ? '...' : ''}`,
          );
        }

        // In development, log all queries with duration
        if (process.env.NODE_ENV === 'development' && e.duration > 10) {
          this.logger.debug(`Query (${e.duration}ms): ${e.query.substring(0, 100)}${e.query.length > 100 ? '...' : ''}`);
        }
      });

      // Log connection pool configuration in development
      if (process.env.NODE_ENV === 'development') {
        const poolStats = await this.getConnectionPoolStats();
        this.logger.debug(`Initial connection pool stats: ${JSON.stringify(poolStats)}`);
      }

      this.logger.log('Slow query logging enabled (threshold: 100ms)');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }

  /**
   * Get current connection pool statistics
   * Useful for monitoring and debugging connection pool usage
   */
  async getConnectionPoolStats() {
    try {
      const result = await this.$queryRaw<Array<{
        total_connections: bigint;
        active_connections: bigint;
        idle_connections: bigint;
      }>>`
        SELECT
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      if (result && result.length > 0) {
        return {
          total: Number(result[0].total_connections),
          active: Number(result[0].active_connections),
          idle: Number(result[0].idle_connections),
        };
      }

      return {
        total: 0,
        active: 0,
        idle: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get connection pool stats', error);
      return {
        total: 0,
        active: 0,
        idle: 0,
        error: error.message,
      };
    }
  }

  /**
   * Check database health
   * Returns true if database is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
