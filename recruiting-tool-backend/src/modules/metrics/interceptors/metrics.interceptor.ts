import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from '../metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const route = this.extractRoute(request);
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds

        this.metricsService.recordHttpRequest(method, route, statusCode, duration);
      }),
      catchError((error) => {
        const statusCode = error.status || 500;
        const duration = (Date.now() - startTime) / 1000;
        const errorType = error.name || 'UnknownError';

        this.metricsService.recordHttpRequest(method, route, statusCode, duration);
        this.metricsService.recordHttpError(method, route, statusCode, errorType);

        return throwError(() => error);
      }),
    );
  }

  private extractRoute(request: any): string {
    // Try to get the route pattern from the request
    if (request.route && request.route.path) {
      return request.route.path;
    }

    // Fallback to URL path with parameter normalization
    const path = request.url.split('?')[0]; // Remove query string
    return this.normalizeRoute(path);
  }

  private normalizeRoute(path: string): string {
    // Replace UIDs and numeric IDs with placeholders for better metric aggregation
    return path
      .replace(/\/[a-f0-9-]{36}/gi, '/:uid') // UUID v4
      .replace(/\/[a-z0-9]{8,}/gi, '/:uid') // Short UIDs
      .replace(/\/\d+/g, '/:id'); // Numeric IDs
  }
}
