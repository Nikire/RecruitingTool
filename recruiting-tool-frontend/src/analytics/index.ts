/**
 * Analytics - Barrel Export
 *
 * Import from here, never from `posthog-js` directly:
 *   import { track, ANALYTICS_EVENTS } from "../analytics";
 */

// Vendor seam - the only four functions the app may call.
export { initAnalytics, track, identify, reset } from "./analytics";

// Event catalogue.
export { ANALYTICS_EVENTS } from "./events";
export type {
  AnalyticsEvent,
  AnalyticsProperties,
  AnalyticsPersonProperties,
} from "./events";

// SPA pageview hook.
export { usePageView } from "./usePageView";

// Error reporting seam (guard call sites with isSentryEnabled()).
export { isSentryEnabled } from "./sentry";
