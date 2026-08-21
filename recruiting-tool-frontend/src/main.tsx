import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
/**
 * Roboto faces. THIS LIST IS THE COMPLETE SET OF WEIGHTS THE APP CAN RENDER.
 *
 * A weight that is not imported here cannot be drawn: the CSS font-matching
 * algorithm snaps the request to the nearest loaded face, so `fontWeight: 600`,
 * `800` and `900` all silently render as 700. There are currently ~199 uses of
 * 600 and ~35 of 800/900 in the app that are therefore no-ops.
 *
 * The fix is to clamp those call sites to 400/500/700 — NOT to add faces here.
 * Each additional weight is another woff2 fetched on the landing page, whose
 * payload Phase 1 deliberately shrank. If a design genuinely needs semibold,
 * that is a deliberate byte trade-off to be made once, not per component.
 */
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Provider as JotaiProvider } from "jotai";

import { BrowserRouter } from "react-router";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { UnheadProvider, createHead } from "@unhead/react/client";
import * as Sentry from "@sentry/react";
import ErrorBoundary from "./components/error/ErrorBoundary.tsx";
import Auth0ProviderWithNavigate from "./providers/Auth0ProviderWithNavigate.tsx";
import ThemeWrapper from "./providers/ThemeWrapper.tsx";
import { initAnalytics, isSentryEnabled } from "./analytics";

import "./i18n/i18n.ts";

/**
 * Boot telemetry before React renders so that errors thrown during the first
 * render are captured. `initAnalytics()` boots PostHog and Sentry and is a
 * silent no-op when `VITE_POSTHOG_KEY` / `VITE_SENTRY_DSN` are unset, so a
 * developer with neither account runs the app with zero configuration.
 */
initAnalytics();

/**
 * Unhead instance backing the `<Seo>` component. Created once, outside the
 * component tree, so `<StrictMode>`'s double-invoke does not produce two heads.
 */
const head = createHead();

/**
 * Reports a failed query/mutation to Sentry.
 *
 * Both `throwOnError` defaults below are `false`, which means a failed API call
 * never reaches the `<ErrorBoundary>`. That is deliberate — components render
 * their own inline error states — but it also meant failures were completely
 * invisible in production. The cache-level handlers restore observability
 * without changing any rendering behaviour.
 *
 * Never throws: telemetry must not be able to break product code.
 */
const reportDataLayerError = (
  error: unknown,
  source: "query" | "mutation",
  key: unknown,
): void => {
  if (import.meta.env.DEV) {
    console.error(`[react-query:${source}]`, key, error);
  }

  if (!isSentryEnabled()) return;

  try {
    Sentry.captureException(error, {
      tags: { source: `react-query.${source}` },
      extra: { key },
    });
  } catch {
    // Ignore — a telemetry failure must never surface to the user.
  }
};

/**
 * React Query Client Configuration
 *
 * Default options for all queries and mutations in the application.
 * These settings provide optimal performance and user experience.
 */
const queryClient = new QueryClient({
  // Cache-level handlers fire for EVERY query/mutation, including those that
  // define their own `onError`, so nothing fails silently.
  queryCache: new QueryCache({
    onError: (error, query) => {
      reportDataLayerError(error, "query", query.queryKey);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      reportDataLayerError(error, "mutation", mutation.options.mutationKey);
    },
  }),
  defaultOptions: {
    queries: {
      // Retry failed queries once before giving up
      retry: 1,

      // Don't refetch on window focus to reduce unnecessary API calls
      refetchOnWindowFocus: false,

      // Consider data stale after 5 minutes
      staleTime: 5 * 60 * 1000,

      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Errors are surfaced inline by each screen rather than by the global
      // ErrorBoundary. Reporting happens in `queryCache.onError` above.
      throwOnError: false,
    },
    mutations: {
      // Individual mutations handle errors with their own onError.
      // Reporting happens in `mutationCache.onError` above.
      throwOnError: false,
    },
  },
});

/**
 * `createRoot`, deliberately — NOT `hydrateRoot`.
 *
 * The public routes are prerendered to static HTML at build time (see
 * `scripts/prerender/`), so on `/`, `/careers`, `/contact`, the legal pages and
 * the blog this container arrives with real markup in it. React discards that
 * markup and renders from scratch.
 *
 * Hydrating instead would be faster on paper and wrong in practice: the server
 * snapshot is rendered in one fixed language with no `localStorage`, while the
 * client resolves BOTH the i18next language (localStorage → cookie → navigator)
 * and the persisted theme mode before its first render. Any visitor whose
 * browser disagrees with the build machine would hit a hydration mismatch —
 * which React recovers from by re-rendering the whole tree anyway, having first
 * reported an error to Sentry on every page load.
 *
 * So the prerendered HTML is for crawlers and for first paint; the client keeps
 * exactly the render path it had before prerendering existed. If this app ever
 * gains server-side data and per-request rendering, revisit this — until then
 * the swap is invisible (identical markup) and the failure mode is nil.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <UnheadProvider value={head}>
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>
            <ThemeWrapper>
              <BrowserRouter>
                <Auth0ProviderWithNavigate>
                  <App />
                </Auth0ProviderWithNavigate>
              </BrowserRouter>
            </ThemeWrapper>
          </JotaiProvider>
        </QueryClientProvider>
      </UnheadProvider>
    </ErrorBoundary>
  </StrictMode>,
);
