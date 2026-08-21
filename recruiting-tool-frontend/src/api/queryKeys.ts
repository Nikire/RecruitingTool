/**
 * Central React Query key factory — the ONLY place a query key may be spelled.
 *
 * ─── Why this file exists ────────────────────────────────────────────────────
 *
 * Keys used to be inline literals scattered across ~40 hook modules, and they
 * drifted. Drift in a query key is uniquely nasty because nothing fails loudly:
 * a query writes to key A, its mutation invalidates key B, and the UI just
 * quietly shows stale data that looks like a backend bug. This codebase has
 * already been bitten three times:
 *
 *   - `["currentUser"]` vs `["auth","me"]`  → silently broke team invites (fixed in Phase 0)
 *   - `["interview", uid]` vs `["interviews"]` → cancelling an interview left the calendar stale
 *   - `["candidateStageNotes"]` never invalidated → saved stage evaluations did not appear
 *
 * ─── How to use it ───────────────────────────────────────────────────────────
 *
 * Every domain follows the same shape:
 *
 *   all          the root prefix. Pass it to invalidateQueries() to nuke the domain.
 *   lists()      prefix for every list variant.
 *   list(params) one concrete list.
 *   details()    prefix for every detail.
 *   detail(uid)  one concrete entity — ALWAYS by public string uid, never numeric id.
 *
 * Domains that do not have list/detail semantics (dashboards, tokens, settings)
 * expose named leaves instead, still hanging off a single `all` root so one
 * invalidation covers the domain.
 *
 * RULES
 *   1. Never write a query key literal in a hook. Import from here.
 *   2. A mutation invalidates a PREFIX from this file (usually `<domain>.all`),
 *      never a hand-assembled array.
 *   3. Adding a query means adding its key here first.
 *
 * ─── Layering note (supersedes ARCHITECTURE.md §Folder Structure) ────────────
 *
 * ARCHITECTURE.md documents `src/api/` as pure transport and `src/hooks/api/`
 * as the React Query layer. That rule is still the target state and remains the
 * dominant pattern (28 of 43 api modules are pure transport; all 38 modules in
 * hooks/api/ are hooks). It is NOT currently universal: 15 api modules — the
 * admin/billing additions listed in the migration report — declare their React
 * Query hooks inline. Those are the deviation, not a second sanctioned pattern.
 *
 * New work copies the split: transport in `src/api/<domain>.ts`, hooks in
 * `src/hooks/api/use<Domain>.ts`, keys here.
 */

// ─── Roots ────────────────────────────────────────────────────────────────────
//
// Declared separately so the factories below can spread them without TypeScript
// hitting a "referenced directly or indirectly in its own initializer" error.

const AUTH = ["auth"] as const;
const USERS = ["users"] as const;
const COMPANIES = ["companies"] as const;
const COMPANY_PROFILE = ["company-profile"] as const;
const COMPANY_ROLES = ["company-roles"] as const;
const CANDIDATES = ["candidates"] as const;
const CANDIDATE_NOTES = ["candidate-notes"] as const;
const CANDIDATE_ACTIVITIES = ["candidateActivities"] as const;
const CANDIDATE_STAGE_NOTES = ["candidateStageNotes"] as const;
const CLIENTS = ["clients"] as const;
const JOB_POSITIONS = ["jobPositions"] as const;
const HIRING_PROCESSES = ["hiringProcess"] as const;
const STAGES = ["stages"] as const;
const STAGE_NOTES = ["stageNotes"] as const;
const APPLICATIONS = ["applications"] as const;
const INTERVIEWS = ["interviews"] as const;
const TIME_SLOTS = ["timeSlots"] as const;
const PUBLIC_CALENDAR_SETTINGS = ["calendarSettings"] as const;
const COMPANY_CALENDAR_SETTINGS = ["company-calendar-settings"] as const;
const GOOGLE_CALENDAR = ["google-calendar"] as const;
const FILES = ["files"] as const;
const ASYNC_STAGE_STATUS = ["async-stage-status"] as const;
const ASYNC_SUBMISSIONS = ["async-submission"] as const;
const PUBLIC_ASYNC_STAGE = ["public-async-stage"] as const;
const EMAIL_TEMPLATES = ["email-templates"] as const;
const CONTACT_MESSAGES = ["contactMessages"] as const;
const CUSTOM_PLANS = ["adminCustomPlans"] as const;
const STRIPE_CONFIG = ["stripeConfig"] as const;
const SYSTEM_SETTINGS = ["systemSettings"] as const;
const EMAIL_STATS = ["emailStats"] as const;
const EMAIL_LOGS = ["emailLogs"] as const;
const PLAN_LIMITS = ["planLimits"] as const;
const ADMIN_PLAN_LIMITS = ["adminPlanLimits"] as const;
const ADMIN_FEATURE_FLAGS = ["adminFeatureFlags"] as const;
const API_KEYS = ["api-keys"] as const;
const ANALYTICS = ["analytics"] as const;
const AI_RANKINGS = ["aiRankings"] as const;
const AI = ["ai"] as const;
const ONBOARDING = ["onboarding"] as const;
const PROSPECTS = ["prospects"] as const;
const SUBSCRIPTION = ["subscription"] as const;
const QUOTA = ["quota"] as const;
const INVOICES = ["invoices"] as const;
const ADMIN = ["admin"] as const;
const ADMIN_TASKS = ["admin-tasks"] as const;
const ADMIN_OUTREACH_TEMPLATES = ["outreach-template-overrides"] as const;
const OUTREACH_CAMPAIGNS = ["outreach-campaigns"] as const;
const OUTREACH_LEADS = ["outreach-leads"] as const;
const OUTREACH_PREVIEW_EMAIL = ["outreach-preview-email"] as const;
const RELEASE_NOTES = ["release-notes"] as const;
const UNSUBSCRIBE = ["unsubscribe"] as const;
const DEMO_SLOTS = ["demo-slots"] as const;
const DEMO_SETTINGS = ["demo-settings"] as const;
const DELETED = ["deleted"] as const;

// ─── Identity & tenancy ───────────────────────────────────────────────────────

export const authKeys = {
  all: AUTH,
  /** The signed-in user. Team invites, profile edits and onboarding all read this. */
  me: () => [...AUTH, "me"] as const,
  linkedAccounts: () => [...AUTH, "linked-accounts"] as const,
} as const;

export const userKeys = {
  all: USERS,
  lists: () => [...USERS, "list"] as const,
  list: (params?: unknown) => [...USERS, "list", params] as const,
  details: () => [...USERS, "detail"] as const,
  detail: (uid: string) => [...USERS, "detail", uid] as const,
  activity: (uid: string) => [...USERS, "detail", uid, "activity"] as const,
  resumeDownload: () => [...USERS, "resume", "download"] as const,
} as const;

export const companyKeys = {
  all: COMPANIES,
  lists: () => [...COMPANIES, "list"] as const,
  list: (params?: unknown) => [...COMPANIES, "list", params] as const,
  details: () => [...COMPANIES, "detail"] as const,
  detail: (uid: string) => [...COMPANIES, "detail", uid] as const,
  /** Every user of one company — prefix, invalidated after ownership transfers. */
  users: (companyUid: string) =>
    [...COMPANIES, "detail", companyUid, "users"] as const,
  usersList: (companyUid: string, params?: unknown) =>
    [...COMPANIES, "detail", companyUid, "users", params] as const,
  publicWithJobs: () => [...COMPANIES, "public", "with-jobs"] as const,
} as const;

export const companyProfileKeys = {
  all: COMPANY_PROFILE,
  mine: () => COMPANY_PROFILE,
} as const;

export const companyRoleKeys = {
  all: COMPANY_ROLES,
  byCompany: (companyUid: string) => [...COMPANY_ROLES, companyUid] as const,
  members: (companyUid: string) =>
    [...COMPANY_ROLES, companyUid, "members"] as const,
  delegatable: (companyUid: string) =>
    [...COMPANY_ROLES, companyUid, "delegatable"] as const,
} as const;

// ─── Recruiting core ──────────────────────────────────────────────────────────

export const candidateKeys = {
  all: CANDIDATES,
  lists: () => [...CANDIDATES, "list"] as const,
  list: (params?: unknown) => [...CANDIDATES, "list", params] as const,
  details: () => [...CANDIDATES, "detail"] as const,
  detail: (uid: string) => [...CANDIDATES, "detail", uid] as const,
} as const;

export const candidateNoteKeys = {
  all: CANDIDATE_NOTES,
  byCandidate: (candidateUid: string) =>
    [...CANDIDATE_NOTES, candidateUid] as const,
} as const;

export const candidateActivityKeys = {
  all: CANDIDATE_ACTIVITIES,
  byCandidate: (candidateUid: string) =>
    [...CANDIDATE_ACTIVITIES, candidateUid] as const,
} as const;

export const candidateStageNoteKeys = {
  all: CANDIDATE_STAGE_NOTES,
  byCandidate: (candidateUid: string | undefined) =>
    [...CANDIDATE_STAGE_NOTES, candidateUid] as const,
} as const;

export const clientKeys = {
  all: CLIENTS,
  /** Unpaginated picker list — deliberately distinct from `list(params)`. */
  allRecords: () => [...CLIENTS, "all"] as const,
  lists: () => [...CLIENTS, "list"] as const,
  list: (params?: unknown) => [...CLIENTS, "list", params] as const,
  details: () => [...CLIENTS, "detail"] as const,
  detail: (uid: string) => [...CLIENTS, "detail", uid] as const,
} as const;

export const jobPositionKeys = {
  all: JOB_POSITIONS,
  lists: () => [...JOB_POSITIONS, "list"] as const,
  list: (params?: unknown) => [...JOB_POSITIONS, "list", params] as const,
  details: () => [...JOB_POSITIONS, "detail"] as const,
  detail: (uid: string) => [...JOB_POSITIONS, "detail", uid] as const,
  /** Public careers board. Kept under the same root so one invalidation
   *  refreshes the HR list AND the public board after a moderation decision. */
  publicList: (filters?: unknown) =>
    [...JOB_POSITIONS, "public", "list", filters] as const,
  publicDetail: (uid: string) =>
    [...JOB_POSITIONS, "public", "detail", uid] as const,
  moderationStats: () => [...JOB_POSITIONS, "moderation", "stats"] as const,
  moderationQueue: (params?: unknown) =>
    [...JOB_POSITIONS, "moderation", "queue", params] as const,
  moderationDetail: (uid: string) =>
    [...JOB_POSITIONS, "moderation", "detail", uid] as const,
} as const;

export const hiringProcessKeys = {
  all: HIRING_PROCESSES,
  lists: () => [...HIRING_PROCESSES, "list"] as const,
  list: (params?: unknown) => [...HIRING_PROCESSES, "list", params] as const,
  listGrouped: (params?: unknown) =>
    [...HIRING_PROCESSES, "list-grouped", params] as const,
  details: () => [...HIRING_PROCESSES, "detail"] as const,
  detail: (uid: string) => [...HIRING_PROCESSES, "detail", uid] as const,
} as const;

export const stageKeys = {
  all: STAGES,
  lists: () => [...STAGES, "list"] as const,
  list: (params?: unknown) => [...STAGES, "list", params] as const,
  details: () => [...STAGES, "detail"] as const,
  detail: (uid: string) => [...STAGES, "detail", uid] as const,
} as const;

export const stageNoteKeys = {
  all: STAGE_NOTES,
  byStage: (stageUid: string) => [...STAGE_NOTES, stageUid] as const,
} as const;

export const applicationKeys = {
  all: APPLICATIONS,
  lists: () => [...APPLICATIONS, "list"] as const,
  list: (filters?: unknown) => [...APPLICATIONS, "list", filters] as const,
  grouped: (filters?: unknown) =>
    [...APPLICATIONS, "grouped", filters] as const,
  details: () => [...APPLICATIONS, "detail"] as const,
  detail: (uid: string) => [...APPLICATIONS, "detail", uid] as const,
} as const;

// ─── Scheduling ───────────────────────────────────────────────────────────────

/**
 * One root for every interview view. The stage list, the company calendar and
 * the single-interview detail MUST share this root: a cancellation from the
 * calendar has to invalidate the stage list and vice versa.
 */
export const interviewKeys = {
  all: INTERVIEWS,
  details: () => [...INTERVIEWS, "detail"] as const,
  detail: (uid: string) => [...INTERVIEWS, "detail", uid] as const,
  byStage: (stageUid: string) => [...INTERVIEWS, "stage", stageUid] as const,
  calendars: () => [...INTERVIEWS, "calendar"] as const,
  calendar: (startDate: string, endDate: string, memberUids?: string[]) =>
    [...INTERVIEWS, "calendar", startDate, endDate, memberUids] as const,
} as const;

export const timeSlotKeys = {
  all: TIME_SLOTS,
  byInterview: (interviewUid: string | null) =>
    [...TIME_SLOTS, "interview", interviewUid] as const,
  available: (token: string | null) =>
    [...TIME_SLOTS, "available", token] as const,
} as const;

export const publicCalendarSettingsKeys = {
  all: PUBLIC_CALENDAR_SETTINGS,
  byToken: (token: string | null) =>
    [...PUBLIC_CALENDAR_SETTINGS, "token", token] as const,
} as const;

export const companyCalendarSettingsKeys = {
  all: COMPANY_CALENDAR_SETTINGS,
} as const;

export const googleCalendarKeys = {
  all: GOOGLE_CALENDAR,
  status: () => [...GOOGLE_CALENDAR, "status"] as const,
  availability: (params?: unknown) =>
    [...GOOGLE_CALENDAR, "availability", params] as const,
  settings: () => [...GOOGLE_CALENDAR, "settings"] as const,
} as const;

// ─── Files & storage ──────────────────────────────────────────────────────────

/**
 * `byCandidate` and `detail` used to both be `["files", <uid>]` — a list of a
 * candidate's files and a single file record sharing one cache slot.
 */
export const fileKeys = {
  all: FILES,
  byCandidate: (candidateUid: string) =>
    [...FILES, "candidate", candidateUid] as const,
  details: () => [...FILES, "detail"] as const,
  detail: (uid: string) => [...FILES, "detail", uid] as const,
  companyList: () => [...FILES, "company", "list"] as const,
  companyStorage: () => [...FILES, "company", "storage"] as const,
} as const;

// ─── Async (take-home) stages ─────────────────────────────────────────────────

export const asyncStageKeys = {
  all: ASYNC_STAGE_STATUS,
  status: (stageUid: string, hiringProcessUid: string) =>
    [...ASYNC_STAGE_STATUS, stageUid, hiringProcessUid] as const,
} as const;

export const asyncSubmissionKeys = {
  all: ASYNC_SUBMISSIONS,
  detail: (submissionUid: string | undefined) =>
    [...ASYNC_SUBMISSIONS, submissionUid] as const,
} as const;

export const publicAsyncStageKeys = {
  all: PUBLIC_ASYNC_STAGE,
  byToken: (token: string) => [...PUBLIC_ASYNC_STAGE, token] as const,
} as const;

// ─── Communications ───────────────────────────────────────────────────────────

/**
 * `byCompany` and `detail` used to both be `["email-templates", <uid>]`, so a
 * template list and a single template shared a cache slot.
 */
export const emailTemplateKeys = {
  all: EMAIL_TEMPLATES,
  /** Prefix covering every template LIST but no template detail — required by
   *  setQueriesData, which would otherwise run a list updater over a single
   *  EmailTemplate object. */
  lists: () => [...EMAIL_TEMPLATES, "company"] as const,
  byCompany: (companyUid?: string) =>
    [...EMAIL_TEMPLATES, "company", companyUid] as const,
  details: () => [...EMAIL_TEMPLATES, "detail"] as const,
  detail: (uid: string) => [...EMAIL_TEMPLATES, "detail", uid] as const,
} as const;

export const contactMessageKeys = {
  all: CONTACT_MESSAGES,
  lists: () => [...CONTACT_MESSAGES, "list"] as const,
  list: (params?: unknown) => [...CONTACT_MESSAGES, "list", params] as const,
} as const;

export const releaseNoteKeys = {
  all: RELEASE_NOTES,
  unread: () => [...RELEASE_NOTES, "unread"] as const,
} as const;

export const unsubscribeKeys = {
  all: UNSUBSCRIBE,
  byToken: (token: string) => [...UNSUBSCRIBE, token] as const,
} as const;

export const demoBookingKeys = {
  slots: (token: string | null) => [...DEMO_SLOTS, token] as const,
  settings: (token: string | null) => [...DEMO_SETTINGS, token] as const,
} as const;

// ─── Billing, quota & plans ───────────────────────────────────────────────────

export const subscriptionKeys = {
  /** NOTE: read directly by pages/profile/SubscriptionPage.tsx — value is load-bearing. */
  all: SUBSCRIPTION,
  current: () => SUBSCRIPTION,
  invoices: () => INVOICES,
} as const;

export const quotaKeys = {
  /** NOTE: read directly by pages/profile/SubscriptionPage.tsx — value is load-bearing. */
  all: QUOTA,
  current: () => QUOTA,
} as const;

export const planLimitKeys = {
  all: PLAN_LIMITS,
} as const;

export const adminPlanLimitKeys = {
  all: ADMIN_PLAN_LIMITS,
} as const;

export const customPlanKeys = {
  all: CUSTOM_PLANS,
} as const;

export const stripeConfigKeys = {
  all: STRIPE_CONFIG,
} as const;

// ─── Platform settings & flags ────────────────────────────────────────────────

export const systemSettingsKeys = {
  all: SYSTEM_SETTINGS,
  emailStats: () => EMAIL_STATS,
  emailLogs: (params?: unknown) => [...EMAIL_LOGS, params] as const,
} as const;

export const featureFlagKeys = {
  all: ADMIN_FEATURE_FLAGS,
  list: (planType?: string) => [...ADMIN_FEATURE_FLAGS, planType] as const,
} as const;

export const apiKeyKeys = {
  all: API_KEYS,
} as const;

export const onboardingKeys = {
  all: ONBOARDING,
  hrStatus: () => [...ONBOARDING, "hr", "status"] as const,
} as const;

// ─── Analytics & AI ───────────────────────────────────────────────────────────

export const analyticsKeys = {
  all: ANALYTICS,
  overview: (dateRange?: unknown) =>
    [...ANALYTICS, "overview", dateRange] as const,
  timeMetrics: (dateRange?: unknown) =>
    [...ANALYTICS, "time-metrics", dateRange] as const,
  conversion: (dateRange?: unknown) =>
    [...ANALYTICS, "conversion", dateRange] as const,
  volume: (dateRange?: unknown) => [...ANALYTICS, "volume", dateRange] as const,
  sources: (dateRange?: unknown) =>
    [...ANALYTICS, "sources", dateRange] as const,
  pipeline: (dateRange?: unknown) =>
    [...ANALYTICS, "pipeline", dateRange] as const,
  timeToHire: (dateRange?: unknown) =>
    [...ANALYTICS, "time-to-hire", dateRange] as const,
  sourceEffectiveness: (dateRange?: unknown) =>
    [...ANALYTICS, "source-effectiveness", dateRange] as const,
  stageDuration: (dateRange?: unknown) =>
    [...ANALYTICS, "stage-duration", dateRange] as const,
} as const;

export const aiKeys = {
  all: AI,
  scoringWeights: () => [...AI, "scoring-weights"] as const,
} as const;

export const aiRankingKeys = {
  all: AI_RANKINGS,
  byJobPosition: (jobPositionUid: string | undefined) =>
    [...AI_RANKINGS, jobPositionUid] as const,
} as const;

// ─── Outreach / growth ────────────────────────────────────────────────────────

export const prospectKeys = {
  all: PROSPECTS,
  lists: () => [...PROSPECTS, "list"] as const,
  list: (params?: unknown) => [...PROSPECTS, "list", params] as const,
  details: () => [...PROSPECTS, "detail"] as const,
  detail: (uid: string) => [...PROSPECTS, "detail", uid] as const,
  stats: () => [...PROSPECTS, "stats"] as const,
  analytics: () => [...PROSPECTS, "analytics"] as const,
} as const;

export const outreachKeys = {
  campaigns: OUTREACH_CAMPAIGNS,
  leads: (campaignUid: string, filters?: Record<string, string>) =>
    [...OUTREACH_LEADS, campaignUid, filters ?? {}] as const,
  leadsByCampaign: (campaignUid: string) =>
    [...OUTREACH_LEADS, campaignUid] as const,
  previewEmail: (campaignUid: string, leadUid: string) =>
    [...OUTREACH_PREVIEW_EMAIL, campaignUid, leadUid] as const,
} as const;

// ─── Soft-deleted records (recycle bin) ───────────────────────────────────────

export const deletedKeys = {
  all: DELETED,
  candidates: () => [...DELETED, "candidates"] as const,
  jobPositions: () => [...DELETED, "job-positions"] as const,
  applications: () => [...DELETED, "applications"] as const,
  interviews: () => [...DELETED, "interviews"] as const,
} as const;

// ─── SUPER_ADMIN back-office ──────────────────────────────────────────────────

export const adminKeys = {
  all: ADMIN,
  subscriptions: () => [...ADMIN, "subscriptions"] as const,
  /** Paginated back-office subscription list. Deliberately nested under
   *  `subscriptions()` so a plan/status change invalidates it too. */
  subscriptionsList: (query?: unknown) =>
    [...ADMIN, "subscriptions", "list", query] as const,
  subscriptionAuditLog: (companyUid: string | null) =>
    [...ADMIN, "subscription-audit-log", companyUid] as const,
  aiQuota: (companyUid: string | null) =>
    [...ADMIN, "ai-quota", companyUid] as const,
  emailDeliverabilityStats: () =>
    [...ADMIN, "email", "deliverability", "stats"] as const,
  emailDeliverabilityPerType: () =>
    [...ADMIN, "email", "deliverability", "per-type"] as const,
  companyHealth: (params?: unknown) =>
    [...ADMIN, "health", "companies", params] as const,
  pipelineAnalytics: () => [...ADMIN, "pipeline-analytics"] as const,
  quotaOverview: (params?: unknown) =>
    [...ADMIN, "quota", "overview", params] as const,
  revenueStats: () => [...ADMIN, "revenue", "stats"] as const,
  trialOverview: (params?: unknown) =>
    [...ADMIN, "trials", "overview", params] as const,
  releaseNotes: () => [...ADMIN, "release-notes"] as const,
  releaseNotesList: (params?: unknown) =>
    [...ADMIN, "release-notes", params] as const,
  demos: () => [...ADMIN, "demos"] as const,
  demosList: (params?: unknown) => [...ADMIN, "demos", params] as const,
  tasks: () => ADMIN_TASKS,
  outreachTemplateOverrides: () => ADMIN_OUTREACH_TEMPLATES,
} as const;

// ─── Aggregate ────────────────────────────────────────────────────────────────

export const queryKeys = {
  admin: adminKeys,
  adminPlanLimits: adminPlanLimitKeys,
  ai: aiKeys,
  aiRankings: aiRankingKeys,
  analytics: analyticsKeys,
  apiKeys: apiKeyKeys,
  applications: applicationKeys,
  asyncStage: asyncStageKeys,
  asyncSubmissions: asyncSubmissionKeys,
  auth: authKeys,
  candidateActivities: candidateActivityKeys,
  candidateNotes: candidateNoteKeys,
  candidates: candidateKeys,
  candidateStageNotes: candidateStageNoteKeys,
  clients: clientKeys,
  companies: companyKeys,
  companyCalendarSettings: companyCalendarSettingsKeys,
  companyProfile: companyProfileKeys,
  companyRoles: companyRoleKeys,
  contactMessages: contactMessageKeys,
  customPlans: customPlanKeys,
  deleted: deletedKeys,
  demoBooking: demoBookingKeys,
  emailTemplates: emailTemplateKeys,
  featureFlags: featureFlagKeys,
  files: fileKeys,
  googleCalendar: googleCalendarKeys,
  hiringProcesses: hiringProcessKeys,
  interviews: interviewKeys,
  jobPositions: jobPositionKeys,
  onboarding: onboardingKeys,
  outreach: outreachKeys,
  planLimits: planLimitKeys,
  prospects: prospectKeys,
  publicAsyncStage: publicAsyncStageKeys,
  publicCalendarSettings: publicCalendarSettingsKeys,
  quota: quotaKeys,
  releaseNotes: releaseNoteKeys,
  stageNotes: stageNoteKeys,
  stages: stageKeys,
  stripeConfig: stripeConfigKeys,
  subscription: subscriptionKeys,
  systemSettings: systemSettingsKeys,
  timeSlots: timeSlotKeys,
  unsubscribe: unsubscribeKeys,
  users: userKeys,
} as const;

export default queryKeys;
