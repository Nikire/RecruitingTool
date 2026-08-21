/**
 * Signup Funnel Instrumentation Helpers
 *
 * Shared by `RegistrationWizard` and its steps so the funnel event names, the
 * step ordering and the attribution mapping are declared exactly once.
 *
 * DESIGN NOTES
 * - Step names are STABLE ANALYTICS IDENTIFIERS, not UI copy. They are never
 *   translated: renaming one orphans every PostHog funnel built on top of it.
 *   The visible step labels stay in the i18n bundle, where they belong.
 * - Every attribution read is wrapped defensively. Attribution is a marketing
 *   nicety; a signup must NEVER fail because sessionStorage is blocked, the
 *   stash is corrupt, or a field is malformed.
 */
import { ANALYTICS_EVENTS, track } from "../../analytics";
import { getAttribution } from "../../utils/attribution";
import type { RegistrationAttribution } from "../../api/auth";

/**
 * Stable, untranslated step identifiers, indexed by the wizard's `activeStep`.
 * Keep in sync with the `steps` array rendered by `RegistrationWizard`.
 */
export const SIGNUP_STEP_NAMES = [
  "role_selection",
  "account_creation",
  "role_information",
  "confirmation",
] as const;

export type SignupStepName = (typeof SIGNUP_STEP_NAMES)[number];

/** Index of the final (confirmation) step. */
export const SIGNUP_CONFIRMATION_STEP = SIGNUP_STEP_NAMES.length - 1;

/** Maximum length the backend accepts for a UTM column (`@MaxLength(255)`). */
const MAX_UTM_LENGTH = 255;
/** Maximum length the backend accepts for a URL column (`@MaxLength(2048)`). */
const MAX_URL_LENGTH = 2048;

/**
 * Reads the first-touch stash without ever throwing.
 *
 * `getAttribution()` is already defensive, but it is a foreign module on the
 * signup critical path, so it gets a second belt here.
 */
const safeGetAttribution = (): ReturnType<typeof getAttribution> => {
  try {
    return getAttribution();
  } catch {
    return null;
  }
};

/**
 * Normalises an arbitrary stash value into something the backend will accept:
 * a non-empty, trimmed, length-capped string. Anything else becomes `undefined`
 * so the key is omitted from the request body entirely.
 */
const sanitize = (value: unknown, maxLength: number): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
};

/**
 * Maps the stashed first-touch attribution onto the optional `CreateUserDto`
 * fields accepted by `POST /auth/register`.
 *
 * Source key -> DTO key:
 *   utm_source -> utmSource, utm_medium -> utmMedium, utm_campaign -> utmCampaign,
 *   utm_term -> utmTerm, utm_content -> utmContent,
 *   referrer -> referrerUrl, landing_path -> landingPath
 * (`referrer_domain` has no backend column and is intentionally dropped.)
 *
 * @returns an object with ONLY the keys that carry a usable value — never
 *          `undefined` values, and `{}` when nothing was captured.
 */
export const buildRegistrationAttribution = (): RegistrationAttribution => {
  const stash = safeGetAttribution();
  if (!stash) return {};

  const payload: RegistrationAttribution = {};
  const assign = (
    key: keyof RegistrationAttribution,
    raw: unknown,
    maxLength: number,
  ) => {
    const value = sanitize(raw, maxLength);
    if (value) payload[key] = value;
  };

  assign("utmSource", stash.utm_source, MAX_UTM_LENGTH);
  assign("utmMedium", stash.utm_medium, MAX_UTM_LENGTH);
  assign("utmCampaign", stash.utm_campaign, MAX_UTM_LENGTH);
  assign("utmTerm", stash.utm_term, MAX_UTM_LENGTH);
  assign("utmContent", stash.utm_content, MAX_UTM_LENGTH);
  assign("referrerUrl", stash.referrer, MAX_URL_LENGTH);
  assign("landingPath", stash.landing_path, MAX_URL_LENGTH);

  return payload;
};

/**
 * Attribution properties in PostHog's canonical snake_case naming, for use as
 * event properties on the funnel events.
 *
 * NOTE: `identify()` merges first-touch attribution into the PERSON profile
 * automatically. These are attached to the EVENT so a funnel can be broken down
 * by campaign without a person-property join.
 */
export const buildAttributionEventProps = (): Record<string, string> => {
  const stash = safeGetAttribution();
  if (!stash) return {};

  const props: Record<string, string> = {};
  const assign = (key: string, raw: unknown) => {
    const value = sanitize(raw, MAX_URL_LENGTH);
    if (value) props[key] = value;
  };

  assign("utm_source", stash.utm_source);
  assign("utm_medium", stash.utm_medium);
  assign("utm_campaign", stash.utm_campaign);
  assign("utm_term", stash.utm_term);
  assign("utm_content", stash.utm_content);
  assign("referrer_domain", stash.referrer_domain);
  assign("landing_path", stash.landing_path);

  return props;
};

/**
 * Fires `signup_step_completed` for a single wizard step.
 *
 * Both the camelCase names documented by the analytics kit (`step`, `stepName`)
 * and the snake_case aliases (`step_index`, `step_name`) are sent: event
 * property names cannot be renamed retroactively in PostHog without orphaning
 * the dashboards built on them, so both spellings ship from day one.
 *
 * @param stepIndex zero-based index into {@link SIGNUP_STEP_NAMES}
 * @param extra     additional, JSON-serialisable properties (never PII)
 */
export const trackSignupStepCompleted = (
  stepIndex: number,
  extra?: Record<string, unknown>,
): void => {
  const stepName = SIGNUP_STEP_NAMES[stepIndex] ?? "unknown";
  track(ANALYTICS_EVENTS.SIGNUP_STEP_COMPLETED, {
    step: stepIndex,
    stepName,
    step_index: stepIndex,
    step_name: stepName,
    ...extra,
  });
};
