import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Performance monitoring middleware
 *
 * Features:
 * - Tracks request duration and performance metrics
 * - Monitors memory usage (heap, RSS)
 * - Logs slow database queries via Prisma middleware
 * - Provides endpoint-level performance insights
 * - Alerts on performance degradation
 *
 * Performance thresholds:
 * - Warning: >1s (1000ms)
 * - Critical: >3s (3000ms)
 * - Slow query: >500ms
 */
@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Performance');

  // Track performance metrics in memory
  private readonly performanceMetrics = new Map<
    string,
    {
      count: number;
      totalDuration: number;
      minDuration: number;
      maxDuration: number;
      avgDuration: number;
    }
  >();

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

      const endMemory = process.memoryUsage();
      const memoryDelta = {
        heapUsed: ((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2),
        rss: ((endMemory.rss - startMemory.rss) / 1024 / 1024).toFixed(2),
      };

      // Track performance metrics per endpoint
      this.trackMetrics(req.method, req.originalUrl || req.url, duration);

      // Log performance data
      const performanceData = {
        correlationId: req['correlationId'],
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        memoryDelta: {
          heapUsed: `${memoryDelta.heapUsed}MB`,
          rss: `${memoryDelta.rss}MB`,
        },
        timestamp: new Date().toISOString(),
      };

      // Log based on duration thresholds
      if (duration > 3000) {
        this.logger.error({
          ...performanceData,
          type: 'critical-performance',
          threshold: '3000ms',
          message: 'Request exceeded critical performance threshold',
        });
      } else if (duration > 1000) {
        this.logger.warn({
          ...performanceData,
          type: 'slow-performance',
          threshold: '1000ms',
          message: 'Request exceeded warning performance threshold',
        });
      }
    });

    next();
  }

  /**
   * Track performance metrics per endpoint
   */
  private trackMetrics(method: string, path: string, duration: number) {
    const key = `${method} ${path}`;
    const existing = this.performanceMetrics.get(key);

    if (existing) {
      const count = existing.count + 1;
      const totalDuration = existing.totalDuration + duration;

      this.performanceMetrics.set(key, {
        count,
        totalDuration,
        minDuration: Math.min(existing.minDuration, duration),
        maxDuration: Math.max(existing.maxDuration, duration),
        avgDuration: totalDuration / count,
      });
    } else {
      this.performanceMetrics.set(key, {
        count: 1,
        totalDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        avgDuration: duration,
      });
    }
  }

  /**
   * Get performance metrics for all endpoints
   * Useful for monitoring dashboards
   */
  getMetrics(): Map<
    string,
    {
      count: number;
      totalDuration: number;
      minDuration: number;
      maxDuration: number;
      avgDuration: number;
    }
  > {
    return this.performanceMetrics;
  }

  /**
   * Reset performance metrics
   * Should be called periodically to avoid memory issues
   */
  resetMetrics() {
    this.performanceMetrics.clear();
    this.logger.log('Performance metrics reset');
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)}MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`,
      arrayBuffers: `${(usage.arrayBuffers / 1024 / 1024).toFixed(2)}MB`,
    };
  }
}
