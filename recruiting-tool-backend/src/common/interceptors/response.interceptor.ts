import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

/**
 * Standard API response format
 * Wraps all successful responses with metadata for consistency
 */
export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * Global response interceptor
 * Transforms all successful responses to follow StandardResponse format
 *
 * Note: Does not affect error responses (handled by HttpExceptionFilter)
 * Does not affect file downloads (StreamableFile is handled differently)
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Get the actual status code that will be sent
        const statusCode = response.statusCode;

        // Return standardized response format
        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
