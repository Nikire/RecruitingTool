/**
 * Sentry Seam
 *
 * The only module in the app that configures Sentry. Everything is a no-op when
 * `VITE_SENTRY_DSN` is absent, so a developer who has never signed up for Sentry
 * can run the app with zero configuration and zero network calls.
 */
import * as Sentry from "@sentry/react";

const DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN;

let initialized = false;

/**
 * Whether error reporting is configured for this build.
 *
 * Call sites (e.g. the global ErrorBoundary) must guard on this before touching
 * the Sentry SDK, so the app degrades cleanly without a DSN.
 */
export const isSentryEnabled = (): boolean => Boolean(DSN);

/**
 * Initialises Sentry. Idempotent, and a silent no-op without a DSN.
 * Called from `initAnalytics()` — do not call directly.
 */
export const initSentry = (): void => {
  if (initialized || !DSN) return;

  try {
    Sentry.init({
      dsn: DSN,
      environment:
        import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || undefined,
      // Performance tracing is opt-in: it multiplies event volume (and cost).
      tracesSampleRate: Number(
        import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0,
      ),
      // Never ship IPs / cookies / headers by default — recruiting data is sensitive.
      sendDefaultPii: false,
    });
    initialized = true;
  } catch {
    // A misconfigured DSN must never prevent the app from booting.
    initialized = false;
  }
};

/**
 * Associates subsequent Sentry events with a user, identified by UID only.
 * Pass `null` to clear on logout. No-op without a DSN.
 *
 * @param uid Public string UID. Never a numeric database id.
 */
export const setSentryUser = (uid: string | null): void => {
  if (!initialized) return;
  try {
    Sentry.setUser(uid ? { id: uid } : null);
  } catch {
    // Ignore — telemetry must never throw into product code.
  }
};
