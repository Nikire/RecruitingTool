import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle different response types
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        // Handle validation errors (array of messages)
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      // In production, hide detailed error messages for non-HTTP exceptions
      message = this.isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : exception.message;
      error = this.isProduction ? 'InternalServerError' : exception.name;
    }

    // Log full error details server-side (always, regardless of environment)
    console.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
      {
        status,
        error: exception instanceof Error ? exception.name : error,
        message: exception instanceof Error ? exception.message : message,
        stack: exception instanceof Error ? exception.stack : undefined,
        // Log request details for debugging
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      },
    );

    // Build response object
    const errorResponse: any = {
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Only include stack trace in development
    if (!this.isProduction && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    // Send formatted response
    response.status(status).json(errorResponse);
  }
}
