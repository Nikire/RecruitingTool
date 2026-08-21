import * as Sentry from '@sentry/node';

/**
 * Sentry wiring for the backend.
 *
 * Design rules (do not "simplify" these away):
 *
 * 1. Entirely optional. If SENTRY_DSN is unset — the normal case for a
 *    developer who has no Sentry account — `initSentry()` returns false and
 *    every `captureServerError()` call is a no-op. Nothing is imported at
 *    runtime, no network calls are made and the app behaves identically.
 *
 * 2. Server faults only. We deliberately do NOT report 4xx responses.
 *    Validation failures, 401s and 404s are ordinary traffic; sending them to
 *    Sentry would burn the free-tier event quota within hours and bury the
 *    real bugs. Only 5xx and genuinely unhandled exceptions get through.
 *
 * 3. Every event carries the request's X-Correlation-ID (assigned in
 *    LoggingMiddleware) as a tag, so a browser-side error report can be joined
 *    to the exact backend request that produced it.
 */

let sentryEnabled = false;

export interface SentryErrorContext {
  correlationId?: string;
  method?: string;
  /** Request path. Do not pass a URL containing a query string with secrets. */
  url?: string;
  statusCode?: number;
  /** Public UID of the authenticated user, never the numeric database id. */
  userUid?: string;
}

/**
 * Initialise Sentry if — and only if — a DSN is configured.
 * Returns true when Sentry is active, false when it is disabled.
 */
export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn || dsn.trim().length === 0) {
    sentryEnabled = false;
    return false;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || undefined,
    // Error monitoring only. Performance tracing is explicitly off: it is the
    // single biggest consumer of a Sentry quota and we get no value from it
    // while the transaction volume is this low.
    tracesSampleRate: 0,
  });

  sentryEnabled = true;
  return true;
}

export function isSentryEnabled(): boolean {
  return sentryEnabled;
}

/**
 * Report a server-side fault to Sentry.
 *
 * Callers are responsible for filtering: only invoke this for HTTP 5xx or for
 * exceptions that never produced a meaningful status code. See the module
 * comment for why.
 */
export function captureServerError(exception: unknown, context: SentryErrorContext = {}): void {
  if (!sentryEnabled) {
    return;
  }

  try {
    Sentry.withScope((scope) => {
      if (context.correlationId) {
        // Tag (not just extra) so it is searchable/filterable in the Sentry UI.
        scope.setTag('correlation_id', context.correlationId);
      }
      if (context.statusCode !== undefined) {
        scope.setTag('http.status_code', String(context.statusCode));
      }
      if (context.method) {
        scope.setTag('http.method', context.method);
      }
      if (context.userUid) {
        scope.setUser({ id: context.userUid });
      }

      scope.setContext('request', {
        method: context.method,
        url: context.url,
        statusCode: context.statusCode,
        correlationId: context.correlationId,
      });

      scope.setLevel('error');
      Sentry.captureException(exception);
    });
  } catch {
    // Telemetry must never be able to break a request. If Sentry itself
    // throws, swallow it — the exception filters have already logged the
    // underlying error locally.
  }
}
