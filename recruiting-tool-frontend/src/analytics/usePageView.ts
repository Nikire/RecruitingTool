import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { track } from "./analytics";
import { ANALYTICS_EVENTS } from "./events";

/**
 * Fires a PostHog `$pageview` on every client-side route change.
 *
 * WHY THIS EXISTS: PostHog's built-in pageview listener only fires on a real
 * document load. Every route in this app — the marketing site included — is an
 * SPA navigation, so without this hook an entire session records exactly one
 * pageview and every funnel step between routes disappears. `initAnalytics()`
 * therefore sets `capture_pageview: false` and delegates to this hook.
 *
 * Mount it ONCE, inside the router, e.g. at the top of `<App />`:
 *
 * ```tsx
 * const App = () => {
 *   usePageView();
 *   return <Routes>...</Routes>;
 * };
 * ```
 *
 * The hash is deliberately excluded from the fired path and from the dependency
 * key: in-page anchor jumps are not pageviews.
 */
export const usePageView = (): void => {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    // React 18/19 StrictMode double-invokes effects in development, and a
    // re-render with an unchanged location must not double-count.
    if (lastTrackedPath.current === path) return;
    lastTrackedPath.current = path;

    track(ANALYTICS_EVENTS.PAGEVIEW, {
      // PostHog reserved properties: keeps the event indistinguishable from a
      // natively captured pageview in Insights.
      $current_url: window.location.href,
      $pathname: location.pathname,
      pathname: location.pathname,
      search: location.search,
    });
  }, [location.pathname, location.search]);
};

export default usePageView;
