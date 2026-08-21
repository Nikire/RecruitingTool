/**
 * Analytics Event Catalogue
 *
 * The single source of truth for every product event name.
 *
 * WHY A CONST MAP: renaming an event orphans every historical funnel, cohort and
 * dashboard built on top of it in PostHog. Names are declared once here and
 * referenced by symbol everywhere else, so a typo is a compile error instead of
 * a silently-dropped event, and a rename is a deliberate, reviewable act.
 *
 * DO NOT rename or delete an entry once it has shipped to production. Add a new
 * one and deprecate the old one with a comment instead.
 */
export const ANALYTICS_EVENTS = {
  /** PostHog reserved pageview event. Fired by usePageView() on every SPA route change. */
  PAGEVIEW: "$pageview",

  // --- Marketing site ---
  /** Any primary/secondary CTA on the landing page. Props: { location, label } */
  LANDING_CTA_CLICKED: "landing_cta_clicked",
  /** The "book a demo" dialog was opened. */
  DEMO_DIALOG_OPENED: "demo_dialog_opened",
  /** A demo request was successfully submitted. */
  DEMO_BOOKED: "demo_booked",

  // --- Signup funnel ---
  /** The visitor entered the signup flow (first step rendered). */
  SIGNUP_STARTED: "signup_started",
  /** A single signup step was completed. Props: { step, stepName } */
  SIGNUP_STEP_COMPLETED: "signup_step_completed",
  /** The account was created. */
  SIGNUP_COMPLETED: "signup_completed",
  /** The post-signup onboarding wizard was finished. */
  ONBOARDING_COMPLETED: "onboarding_completed",

  // --- Activation milestones (fire once per company) ---
  /** First job position ever created by this company. */
  FIRST_JOB_POSITION_CREATED: "first_job_position_created",
  /** First candidate ever added by this company. */
  FIRST_CANDIDATE_ADDED: "first_candidate_added",
  /** First application ever moved forward a stage by this company. */
  FIRST_APPLICATION_ADVANCED: "first_application_advanced",

  // --- Expansion / revenue ---
  /** A teammate invitation was sent. */
  TEAMMATE_INVITED: "teammate_invited",
  /** The Stripe checkout session was started. Props: { plan, interval } */
  CHECKOUT_STARTED: "checkout_started",
} as const;

/**
 * Union of every valid event name. Call sites must use `ANALYTICS_EVENTS.X`
 * (or a literal that matches this union) — arbitrary strings are rejected.
 */
export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Free-form event properties. Values must be JSON-serialisable. */
export type AnalyticsProperties = Record<string, unknown>;

/** Properties attached to a user profile via `identify()`. */
export type AnalyticsPersonProperties = Record<string, unknown>;
