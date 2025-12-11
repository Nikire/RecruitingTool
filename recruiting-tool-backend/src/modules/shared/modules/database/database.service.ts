import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private poolLoggingEnabled: boolean;

  constructor() {
    // Parse connection pool configuration from environment variables
    const poolMin = parseInt(process.env.DATABASE_POOL_MIN || '2', 10);
    const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '10', 10);
    const acquireTimeout = parseInt(process.env.DATABASE_POOL_ACQUIRE_TIMEOUT || '60000', 10);
    const idleTimeout = parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '600000', 10);
    const maxLifetime = parseInt(process.env.DATABASE_POOL_MAX_LIFETIME || '1800000', 10);

    // Build DATABASE_URL with connection pool parameters
    const baseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/recruiting_tool_db';
    const urlWithPooling = DatabaseService.buildConnectionUrlWithPooling(
      baseUrl,
      poolMax,
      Math.floor(acquireTimeout / 1000), // Convert ms to seconds
      10, // connect_timeout (fixed at 10 seconds)
    );

    super({
      datasources: {
        db: {
          url: urlWithPooling,
        },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    this.poolLoggingEnabled = process.env.DATABASE_POOL_LOGGING === 'true';

    // Log connection pool configuration
    this.logger.log(`Connection pool configuration:
      - Min connections: ${poolMin}
      - Max connections: ${poolMax}
      - Acquire timeout: ${acquireTimeout}ms
      - Idle timeout: ${idleTimeout}ms
      - Max lifetime: ${maxLifetime}ms
      - Pool logging: ${this.poolLoggingEnabled ? 'enabled' : 'disabled'}
    `);
  }

  /**
   * Build PostgreSQL connection URL with connection pool parameters
   */
  private static buildConnectionUrlWithPooling(baseUrl: string, connectionLimit: number, poolTimeout: number, connectTimeout: number): string {
    try {
      const url = new URL(baseUrl);

      // Add or update connection pool parameters
      url.searchParams.set('connection_limit', connectionLimit.toString());
      url.searchParams.set('pool_timeout', poolTimeout.toString());
      url.searchParams.set('connect_timeout', connectTimeout.toString());

      // Optional: Add statement timeout (prevents long-running queries)
      // url.searchParams.set('statement_timeout', '30000'); // 30 seconds

      return url.toString();
    } catch (error) {
      // If URL parsing fails, return original URL
      return baseUrl;
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected with connection pooling');

      // Enable slow query logging (queries > 100ms)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.$on('query' as never, (e: any) => {
        if (e.duration > 100) {
          this.logger.warn(`Slow query detected (${e.duration}ms): ${e.query.substring(0, 200)}${e.query.length > 200 ? '...' : ''}`);
        }

        // In development, log all queries with duration
        if (process.env.NODE_ENV === 'development' && e.duration > 10) {
          this.logger.debug(`Query (${e.duration}ms): ${e.query.substring(0, 100)}${e.query.length > 100 ? '...' : ''}`);
        }

        // Log connection pool usage if enabled
        if (this.poolLoggingEnabled) {
          this.logger.debug(`Query executed - Pool might be in use`);
        }
      });

      // Log initial connection pool statistics
      const poolStats = await this.getConnectionPoolStats();
      this.logger.log(`Initial connection pool stats: ${JSON.stringify(poolStats)}`);

      // In development or when pool logging is enabled, monitor pool stats periodically
      if (process.env.NODE_ENV === 'development' || this.poolLoggingEnabled) {
        this.startConnectionPoolMonitoring();
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
   * Start periodic connection pool monitoring
   * Logs pool statistics every 5 minutes in development or when pool logging is enabled
   */
  private startConnectionPoolMonitoring() {
    const monitoringInterval = 5 * 60 * 1000; // 5 minutes

    setInterval(async () => {
      try {
        const poolStats = await this.getConnectionPoolStats();
        const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '10', 10);
        const utilizationPercent = poolStats.total > 0 ? Math.round((poolStats.active / poolMax) * 100) : 0;

        this.logger.debug(`Connection pool stats - Total: ${poolStats.total}, Active: ${poolStats.active}, Idle: ${poolStats.idle}, Utilization: ${utilizationPercent}%`);

        // Warn if pool utilization is high (>80%)
        if (utilizationPercent > 80) {
          this.logger.warn(`High connection pool utilization detected (${utilizationPercent}%). Consider increasing DATABASE_POOL_MAX.`);
        }
      } catch (error) {
        this.logger.error('Failed to monitor connection pool', error);
      }
    }, monitoringInterval);

    this.logger.log(`Connection pool monitoring started (interval: ${monitoringInterval / 1000}s)`);
  }

  /**
   * Get current connection pool statistics
   * Useful for monitoring and debugging connection pool usage
   */
  async getConnectionPoolStats() {
    try {
      const result = await this.$queryRaw<
        Array<{
          total_connections: bigint;
          active_connections: bigint;
          idle_connections: bigint;
          waiting_connections: bigint;
          max_connections: bigint;
        }>
      >`
        SELECT
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE wait_event_type = 'Lock') as waiting_connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      if (result && result.length > 0) {
        const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '10', 10);
        const stats = {
          total: Number(result[0].total_connections),
          active: Number(result[0].active_connections),
          idle: Number(result[0].idle_connections),
          waiting: Number(result[0].waiting_connections),
          maxConnections: Number(result[0].max_connections),
          poolMax,
          utilizationPercent: Math.round((Number(result[0].active_connections) / poolMax) * 100),
        };

        return stats;
      }

      return {
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0,
        maxConnections: 100,
        poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
        utilizationPercent: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get connection pool stats', error);
      return {
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0,
        maxConnections: 100,
        poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
        utilizationPercent: 0,
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
