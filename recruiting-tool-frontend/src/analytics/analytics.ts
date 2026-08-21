/**
 * Analytics Seam
 *
 * The ONLY module in the application that is allowed to import `posthog-js`.
 * Every call site goes through the four functions exported here, which keeps the
 * vendor swappable: replacing PostHog later is a change to this file, not a
 * change to two hundred call sites.
 *
 * PRIVACY / CONSENT POSTURE
 * - `persistence: "memory"` — nothing is written to cookies or localStorage for
 *   anonymous traffic, so no identifier is stored on the visitor's device. That
 *   keeps the marketing site outside the ePrivacy "storage access" consent
 *   trigger, so the landing page needs no cookie banner. A banner on a landing
 *   page costs more conversions than the extra cross-session stitching is worth.
 *   Trade-off: a full page reload starts a new anonymous distinct_id, and
 *   pre-signup sessions do not stitch across visits. Post-signup users are
 *   stitched server-side by UID via `identify()`.
 * - `capture_pageview: false` — every route in this app, including the whole
 *   marketing site, is an SPA navigation. PostHog's built-in listener would
 *   record exactly one pageview per session. `usePageView()` fires them instead.
 * - EU ingest by default: company data stays in the EU region.
 *
 * SAFETY
 * Every function no-ops silently when `VITE_POSTHOG_KEY` is absent, so the app
 * runs unchanged for a developer with no PostHog account, and every call is
 * wrapped so telemetry can never throw into product code.
 */
import posthog from "posthog-js";
import type { AnalyticsEvent, AnalyticsProperties } from "./events";
import { initSentry, setSentryUser } from "./sentry";
import { captureAttribution, getAttribution } from "../utils/attribution";

/** PostHog EU cloud ingest host. Overridable for self-hosted instances. */
const DEFAULT_POSTHOG_HOST = "https://eu.i.posthog.com";

const POSTHOG_KEY: string | undefined = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST: string =
  import.meta.env.VITE_POSTHOG_HOST || DEFAULT_POSTHOG_HOST;

/** True once `initAnalytics()` has successfully booted the PostHog client. */
let posthogReady = false;

/** Dev-only diagnostics. Never logs in production builds. */
const devWarn = (message: string): void => {
  if (import.meta.env.DEV) {
    console.warn(`[analytics] ${message}`);
  }
};

/**
 * Guards the project's UID law at runtime.
 *
 * A numeric database id must never leave the backend, and if one ever reaches
 * `identify()` it would poison the person table permanently — PostHog person
 * profiles cannot be re-keyed after the fact. Refuse loudly in dev, silently in
 * production.
 */
const isValidUid = (uid: unknown): uid is string => {
  if (typeof uid !== "string") {
    devWarn(`identify() ignored: expected a string UID, got ${typeof uid}.`);
    return false;
  }
  const trimmed = uid.trim();
  if (!trimmed) {
    devWarn("identify() ignored: empty UID.");
    return false;
  }
  if (/^\d+$/.test(trimmed)) {
    devWarn(
      `identify() ignored: "${trimmed}" looks like a numeric database id. ` +
        "External surfaces must use string UIDs only.",
    );
    return false;
  }
  return true;
};

/**
 * Boots the analytics stack. Call exactly once, as early as possible in
 * `main.tsx`, before React renders.
 *
 * Responsibilities:
 *  1. Capture first-touch marketing attribution for the session.
 *  2. Boot PostHog (skipped without `VITE_POSTHOG_KEY`).
 *  3. Boot Sentry (skipped without `VITE_SENTRY_DSN`).
 *
 * Idempotent and never throws.
 */
export const initAnalytics = (): void => {
  // Attribution is vendor-independent and must be stashed before any redirect
  // or client-side navigation can strip the UTM parameters off the URL.
  captureAttribution();

  initSentry();

  if (!POSTHOG_KEY) {
    devWarn("VITE_POSTHOG_KEY is not set — product analytics are disabled.");
    return;
  }
  if (posthogReady) return;

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // SPA: pageviews are fired manually by usePageView().
      capture_pageview: false,
      // No device storage for anonymous traffic — see the privacy note above.
      persistence: "memory",
      // Only create person profiles for users we have actually identified.
      person_profiles: "identified_only",
      // Recruiting screens are full of candidate PII: no session replay, and
      // autocapture limited to intent signals rather than every DOM event.
      disable_session_recording: true,
      autocapture: {
        dom_event_allowlist: ["click", "submit"],
      },
    });
    posthogReady = true;
  } catch {
    posthogReady = false;
    devWarn(
      "PostHog failed to initialise — analytics disabled for this session.",
    );
  }
};

/**
 * Records a product event.
 *
 * @param event Must be a name from `ANALYTICS_EVENTS` — arbitrary strings are a
 *              compile error, because renamed events orphan historical funnels.
 * @param properties Optional JSON-serialisable event properties.
 */
export const track = (
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): void => {
  if (!posthogReady) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Telemetry must never break a user interaction.
  }
};

/**
 * Associates the current session with a known user.
 *
 * Call right after login/signup completes. First-touch attribution captured for
 * this session is merged into the person profile so paid acquisition can be
 * tied to the resulting account.
 *
 * @param uid The user's public string UID. Numeric ids are rejected at runtime
 *            per the project's UID law.
 * @param properties Optional person properties (e.g. companyUid, plan, role).
 *                   Never pass raw candidate PII.
 */
export const identify = (
  uid: string,
  properties?: AnalyticsProperties,
): void => {
  if (!isValidUid(uid)) return;

  setSentryUser(uid);

  if (!posthogReady) return;
  try {
    const attribution = getAttribution();
    posthog.identify(uid, {
      ...(attribution ?? {}),
      ...(properties ?? {}),
    });
  } catch {
    // Telemetry must never break the login flow.
  }
};

/**
 * Clears the identified user and starts a fresh anonymous session.
 * Call on logout, so the next user of the browser is not attributed to the
 * previous one.
 */
export const reset = (): void => {
  setSentryUser(null);

  if (!posthogReady) return;
  try {
    posthog.reset();
  } catch {
    // Telemetry must never break the logout flow.
  }
};
