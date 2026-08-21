/**
 * First-Touch Attribution Capture
 *
 * Stashes the marketing parameters of the visit that FIRST brought this session
 * to the site, so the signup form can send them to the backend and every account
 * can be traced back to the campaign that produced it.
 *
 * DESIGN NOTES
 * - FIRST TOUCH WINS. Once a stash exists for the session it is never
 *   overwritten. A visitor who lands on `/?utm_source=linkedin`, browses to
 *   `/pricing` and then to `/signup` must still be credited to LinkedIn — a
 *   last-touch model would credit the internal navigation and make every paid
 *   campaign look like direct traffic.
 * - sessionStorage, not localStorage or a cookie. It dies with the tab, is not
 *   shared across tabs, and is not a persistent device identifier, which keeps
 *   the marketing site clear of the ePrivacy consent-banner trigger.
 * - Every function is defensive: private-mode browsers throw on storage access,
 *   and analytics must never be able to break a page render.
 */

const STORAGE_KEY = "borderless.attribution.v1";

/** UTM parameters we read off the landing URL, in canonical PostHog naming. */
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type UtmParam = (typeof UTM_PARAMS)[number];

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  /** `document.referrer` at first load, empty string when opened directly. */
  referrer?: string;
  /** Hostname of the referrer, convenient for grouping (e.g. "www.google.com"). */
  referrer_domain?: string;
  /** Pathname of the first page of the session (e.g. "/pricing"). */
  landing_path?: string;
  /** ISO timestamp of the first touch. */
  captured_at: string;
}

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const safeRead = (): string | null => {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage disabled (private mode / blocked cookies). Attribution is optional.
    return null;
  }
};

const safeWrite = (value: string): void => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage disabled — silently degrade to "no attribution".
  }
};

const parseReferrerDomain = (referrer: string): string | undefined => {
  if (!referrer) return undefined;
  try {
    return new URL(referrer).hostname;
  } catch {
    return undefined;
  }
};

/**
 * Reads the currently stashed first-touch attribution for this session.
 *
 * Used by the signup form to attach campaign data to the created account.
 *
 * @returns the stash, or `null` when nothing was captured (or storage is blocked).
 */
export const getAttribution = (): AttributionData | null => {
  const raw = safeRead();
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as AttributionData;
  } catch {
    return null;
  }
};

/**
 * Captures first-touch attribution from the current URL and referrer.
 *
 * Safe to call on every load: if a stash already exists for this session it is
 * returned untouched (first touch wins). Called once from `initAnalytics()`.
 *
 * @returns the effective attribution for the session, or `null` when there was
 *          nothing worth recording and storage is unavailable.
 */
export const captureAttribution = (): AttributionData | null => {
  if (!isBrowser()) return null;

  // FIRST TOUCH WINS — never overwrite an existing stash.
  const existing = getAttribution();
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const data: AttributionData = { captured_at: new Date().toISOString() };

  UTM_PARAMS.forEach((param: UtmParam) => {
    const value = params.get(param);
    if (value) data[param] = value;
  });

  const referrer = typeof document !== "undefined" ? document.referrer : "";
  // Ignore self-referrals: they are internal navigation, not an acquisition source.
  const isSelfReferral =
    !!referrer && parseReferrerDomain(referrer) === window.location.hostname;

  if (referrer && !isSelfReferral) {
    data.referrer = referrer;
    data.referrer_domain = parseReferrerDomain(referrer);
  }

  data.landing_path = window.location.pathname;

  safeWrite(JSON.stringify(data));
  return data;
};

/**
 * Clears the stash. Call after the attribution has been persisted server-side
 * (i.e. right after a successful signup) so a second signup in the same tab is
 * not credited to the same campaign twice.
 */
export const clearAttribution = (): void => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — storage is unavailable, so there is nothing stashed.
  }
};
