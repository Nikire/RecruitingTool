import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { captureServerError } from './sentry';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
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
      message = this.isProduction ? 'An unexpected error occurred. Please try again later.' : exception.message;
      error = this.isProduction ? 'InternalServerError' : exception.name;
    }

    // Redact 5xx bodies in production, INCLUDING explicitly-thrown HttpExceptions.
    //
    // The branch above only sanitised raw `Error`s, on the assumption that an
    // HttpException message is deliberate developer-authored copy. That is true
    // for 4xx — validation failures, conflicts, "not found" — and those must
    // survive, because they are the user-facing half of the API contract.
    //
    // It is NOT true for 5xx. 165 call sites across 24 services use the shape
    //     catch (error) { throw new InternalServerErrorException(`Failed to X: ${error.message}`) }
    // which embeds the raw underlying message into the exception, so the
    // sanitiser above never saw it. In production that shipped Prisma
    // invocation details, column names and query shapes to any caller — e.g. a
    // malformed uid returned the full `prisma.jobPosition.findFirst()` error.
    //
    // Redacting centrally here rather than editing 165 throws means no call
    // site can be missed, and a future careless `InternalServerErrorException`
    // carrying sensitive detail is covered by default. The full message and
    // stack are still logged server-side below and still sent to Sentry.
    if (this.isProduction && status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'An unexpected error occurred. Please try again later.';
      error = 'InternalServerError';
    }

    // Log full error details server-side (always, regardless of environment)
    this.logger.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
      JSON.stringify({
        status,
        error: exception instanceof Error ? exception.name : error,
        message: exception instanceof Error ? exception.message : message,
        stack: exception instanceof Error ? exception.stack : undefined,
        // Log request details for debugging
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }),
    );

    // Report to Sentry — server faults only. 4xx responses (validation errors,
    // 401s, 404s) are ordinary traffic and would exhaust the event quota
    // without surfacing a single real bug, so they are never sent.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const user = request['user'] as { uid?: string } | undefined;
      captureServerError(exception, {
        correlationId: request['correlationId'] as string | undefined,
        method: request.method,
        url: request.url,
        statusCode: status,
        userUid: user?.uid,
      });
    }

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
