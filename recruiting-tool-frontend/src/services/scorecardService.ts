/**
 * Scorecard Service — DELIBERATELY NON-FUNCTIONAL.
 *
 * ## Why every function here rejects
 *
 * Each function below used to `await` a `setTimeout` and then read from a
 * module-level `mockTemplates` array — hardcoded fixtures such as "Technical
 * Interview Scorecard", complete with an invented `evaluatorName: "Current
 * User"`. None of it ever touched the network.
 *
 * Meanwhile `ScorecardModule` is registered in the backend (`app.module.ts`)
 * and exposes nine real, authenticated, company-scoped endpoints. The polished
 * scorecard components in `src/components/scorecard/` are complete, but no
 * route renders them, so today nothing calls any of this.
 *
 * That combination is more dangerous than the feature simply being absent. The
 * moment anyone adds a route pointing at `<ScorecardTemplateList />`, the
 * screen would render — convincingly, with no error, no empty state and no
 * console warning — and show a customer INVENTED evaluation data as if it were
 * their own hiring records. Silent fabrication in an HR product is a
 * correctness and trust failure, not a missing feature.
 *
 * So the fixtures are gone and every entry point rejects instead. This is
 * intentional and must NOT be "fixed" by restoring mock data. It fails in every
 * environment rather than only under `import.meta.env.DEV`, because the entire
 * point is that it cannot reach a customer by accident: a build that wires the
 * UI up fails loudly on the first call, in development, in CI and in preview.
 *
 * Rejection (rather than a synchronous `throw`) keeps the declared
 * `Promise`-returning contract intact, so a caller that only attaches
 * `.catch()` still observes the failure. Every consumer awaits these, and the
 * `queryCache` / `mutationCache` handlers in `main.tsx` forward anything thrown
 * inside React Query to Sentry, so a mis-wire surfaces in telemetry too.
 *
 * ## How to actually finish this feature
 *
 * Delete this file and replace it with a React Query hook module
 * (`src/hooks/api/useScorecards.ts`) following the convention already used by
 * `hooks/api/useAnalytics.ts` and `hooks/api/useAi.ts`: call `api.*` directly
 * inside `useQuery` / `useMutation`, key the caches through `api/queryKeys.ts`,
 * and let React Query own loading and error state. The endpoints already exist
 * and are named per-function below. The backend speaks UIDs only — keep it that
 * way; never surface a numeric `id`.
 *
 * Structured scorecards are a real paid-tier differentiator, which is why the
 * backend module stays. The frontend should remain unrouted until a customer
 * asks for it — see the handover notes for this decision.
 */

import {
  ScorecardTemplate,
  ScorecardSubmission,
  CreateScorecardTemplateDto,
  SubmitScorecardDto,
  UpdateScorecardTemplateDto,
} from "../types/scorecard";

/**
 * Base path of the live backend controller: `@Controller('scorecard')` behind
 * the global `api` prefix set in `main.ts`.
 */
const SCORECARD_API_BASE = "/api/scorecard";

/**
 * Raised by every entry point in this module.
 *
 * A named class rather than a bare `Error`, so the failure is unmistakable in
 * Sentry instead of being lost among generic errors.
 */
export class ScorecardServiceNotImplementedError extends Error {
  /** The service function that was called, e.g. `getTemplate`. */
  readonly operation: string;
  /** The real endpoint that should have been called instead. */
  readonly endpoint: string;

  constructor(operation: string, endpoint: string, requested: string) {
    super(
      `Scorecard feature is not wired to the API. \`${operation}(${requested})\` has no ` +
        `implementation: it previously returned HARDCODED MOCK DATA, which would have shown ` +
        `a customer fabricated evaluation results as if they were their own records. ` +
        `The real, authenticated endpoint is \`${endpoint}\`. ` +
        `Do not restore the mock — implement \`src/hooks/api/useScorecards.ts\` against the live ` +
        `\`${SCORECARD_API_BASE}\` controller (see the docblock in src/services/scorecardService.ts), ` +
        `or leave the scorecard UI unrouted.`,
    );
    this.name = "ScorecardServiceNotImplementedError";
    this.operation = operation;
    this.endpoint = endpoint;
  }
}

/**
 * Builds the rejected promise returned by every function in this module.
 *
 * `args` is echoed into the message purely so the failure names what was
 * actually requested, which makes a stray call site obvious from the log line
 * alone.
 */
const notImplemented = (
  operation: string,
  endpoint: string,
  ...args: unknown[]
): Promise<never> =>
  Promise.reject(
    new ScorecardServiceNotImplementedError(
      operation,
      endpoint,
      args.map((a) => JSON.stringify(a) ?? "undefined").join(", "),
    ),
  );

/**
 * List scorecard templates.
 * Real endpoint: `GET /api/scorecard/templates?companyUid=` (HR, ADMIN, SUPER_ADMIN)
 */
export const getTemplates = (): Promise<ScorecardTemplate[]> =>
  notImplemented("getTemplates", `GET ${SCORECARD_API_BASE}/templates`);

/**
 * Fetch one scorecard template.
 * Real endpoint: `GET /api/scorecard/templates/:uid` (HR, ADMIN, SUPER_ADMIN, USER)
 */
export const getTemplate = (uid: string): Promise<ScorecardTemplate | null> =>
  notImplemented(
    "getTemplate",
    `GET ${SCORECARD_API_BASE}/templates/:uid`,
    uid,
  );

/**
 * Create a scorecard template.
 * Real endpoint: `POST /api/scorecard/templates` (HR, ADMIN, SUPER_ADMIN)
 */
export const createTemplate = (
  data: CreateScorecardTemplateDto,
): Promise<ScorecardTemplate> =>
  notImplemented(
    "createTemplate",
    `POST ${SCORECARD_API_BASE}/templates`,
    data,
  );

/**
 * Update a scorecard template.
 * Real endpoint: `PUT /api/scorecard/templates/:uid` (HR, ADMIN, SUPER_ADMIN)
 */
export const updateTemplate = (
  uid: string,
  data: UpdateScorecardTemplateDto,
): Promise<ScorecardTemplate> =>
  notImplemented(
    "updateTemplate",
    `PUT ${SCORECARD_API_BASE}/templates/:uid`,
    uid,
    data,
  );

/**
 * Delete a scorecard template.
 * Real endpoint: `DELETE /api/scorecard/templates/:uid` → 204 (HR, ADMIN, SUPER_ADMIN)
 */
export const deleteTemplate = (uid: string): Promise<void> =>
  notImplemented(
    "deleteTemplate",
    `DELETE ${SCORECARD_API_BASE}/templates/:uid`,
    uid,
  );

/**
 * Submit a completed scorecard for an interview.
 * Real endpoint: `POST /api/scorecard/submit` (HR, ADMIN, SUPER_ADMIN, USER)
 *
 * The backend derives the evaluator from the authenticated user. The old mock
 * invented `evaluatorName: "Current User"` — exactly the kind of fabricated
 * attribution that must never be written onto an evaluation record.
 */
export const submitScorecard = (
  data: SubmitScorecardDto,
): Promise<ScorecardSubmission> =>
  notImplemented("submitScorecard", `POST ${SCORECARD_API_BASE}/submit`, data);

/**
 * List every scorecard submitted for one interview.
 * Real endpoint: `GET /api/scorecard/interview/:interviewUid` (HR, ADMIN, SUPER_ADMIN)
 */
export const getScorecardsByInterview = (
  interviewUid: string,
): Promise<ScorecardSubmission[]> =>
  notImplemented(
    "getScorecardsByInterview",
    `GET ${SCORECARD_API_BASE}/interview/:interviewUid`,
    interviewUid,
  );

/**
 * Fetch one scorecard submission.
 * Real endpoint: `GET /api/scorecard/:uid` (HR, ADMIN, SUPER_ADMIN, USER)
 */
export const getScorecard = (
  uid: string,
): Promise<ScorecardSubmission | null> =>
  notImplemented("getScorecard", `GET ${SCORECARD_API_BASE}/:uid`, uid);

/**
 * Aggregate scorecard summary for an interview.
 * Real endpoint: `GET /api/scorecard/interview/:interviewUid/summary` (HR, ADMIN, SUPER_ADMIN)
 *
 * Had no mock counterpart at all — included so the whole controller surface is
 * documented in one place for whoever wires this up.
 */
export const getInterviewSummary = (interviewUid: string): Promise<never> =>
  notImplemented(
    "getInterviewSummary",
    `GET ${SCORECARD_API_BASE}/interview/:interviewUid/summary`,
    interviewUid,
  );
