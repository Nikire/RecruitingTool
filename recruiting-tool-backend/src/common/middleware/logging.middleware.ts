import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Logging middleware for request/response tracking
 *
 * Features:
 * - Assigns correlation ID to each request for distributed tracing
 * - Logs incoming requests with method, path, user agent, IP
 * - Logs outgoing responses with status code and duration
 * - Includes user information if authenticated
 * - Structured logging format for easy parsing and analysis
 *
 * Correlation ID is added to response headers for client-side tracking
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Generate correlation ID for request tracing
    const correlationId = randomUUID();
    req['correlationId'] = correlationId;

    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', correlationId);

    // Extract user information from request (if authenticated)
    const user = req['user'];
    const userId = user?.uid || 'anonymous';
    const userRole = user?.role || 'guest';

    // Log incoming request
    this.logger.log({
      type: 'request',
      correlationId,
      method: req.method,
      path: req.originalUrl || req.url,
      userAgent: req.get('user-agent') || 'unknown',
      ip: req.ip || req.socket.remoteAddress,
      userId,
      userRole,
      timestamp: new Date().toISOString(),
    });

    // Capture response finish event
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // Determine log level based on status code
      const logLevel = this.getLogLevel(statusCode);

      // Log outgoing response
      this.logger[logLevel]({
        type: 'response',
        correlationId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode,
        duration: `${duration}ms`,
        userId,
        userRole,
        contentLength: res.get('content-length'),
        timestamp: new Date().toISOString(),
      });

      // Log slow requests (>3 seconds) as warnings
      if (duration > 3000) {
        this.logger.warn({
          type: 'slow-request',
          correlationId,
          method: req.method,
          path: req.originalUrl || req.url,
          duration: `${duration}ms`,
          threshold: '3000ms',
          message: 'Request exceeded performance threshold',
        });
      }
    });

    next();
  }

  /**
   * Determine appropriate log level based on HTTP status code
   */
  private getLogLevel(statusCode: number): 'log' | 'warn' | 'error' {
    if (statusCode >= 500) {
      return 'error';
    }
    if (statusCode >= 400) {
      return 'warn';
    }
    return 'log';
  }
}
