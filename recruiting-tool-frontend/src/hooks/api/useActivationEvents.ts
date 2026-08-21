import { useCallback } from "react";
import { useUserAtom } from "./state/useUserAtom";
import {
  track,
  type AnalyticsEvent,
  type AnalyticsProperties,
} from "../../analytics";

/**
 * Activation milestones — the client half.
 *
 * WHY THIS EXISTS: `first_job_position_created`, `first_candidate_added` and
 * `first_application_advanced` must fire ONCE per company, not on every
 * create. React Query `onSuccess` has no idea whether the row it just made was
 * the company's first, so this hook keeps a local "already fired" ledger.
 *
 * WHAT THIS IS NOT: the source of truth. The ledger lives in `localStorage`,
 * so it is per-browser — a founder who creates their first job position on a
 * laptop and their first candidate on a phone will fire both correctly, but a
 * cleared browser can re-fire a milestone. The authoritative answer is the
 * server-side `UserActivityLog` row written by
 * `backend/src/modules/tracking/activation-events.service.ts`, whose
 * `metadata.isFirst` is computed from a real company-scoped count. Client
 * events exist for funnel *latency* and session context; when the two
 * disagree, the server wins.
 *
 * The ledger key is scoped by company UID so that agency users switching
 * accounts in one browser still get one milestone per company.
 */

const LEDGER_PREFIX = "borderless.activation";

function ledgerKey(event: string, companyUid: string | undefined): string {
  return `${LEDGER_PREFIX}.${companyUid ?? "unknown"}.${event}`;
}

/** Storage access is wrapped: Safari private mode throws on setItem. */
function hasFired(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function markFired(key: string): void {
  try {
    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    // Telemetry only — swallow.
  }
}

export function useActivationEvents() {
  const { user } = useUserAtom();
  // ALWAYS the public string uid — never a numeric database id.
  const companyUid = user?.companyUid ?? user?.company?.uid;

  /**
   * Fire `event` only the first time it happens for this company in this
   * browser. Never throws: a telemetry failure must not surface in a toast.
   */
  const trackFirstTime = useCallback(
    (event: AnalyticsEvent, properties?: AnalyticsProperties) => {
      try {
        const key = ledgerKey(event, companyUid);
        if (hasFired(key)) return;
        markFired(key);
        track(event, { ...properties, companyUid });
      } catch {
        // Telemetry only — swallow.
      }
    },
    [companyUid],
  );

  /** Fire `event` on every occurrence (expansion signals, not milestones). */
  const trackAlways = useCallback(
    (event: AnalyticsEvent, properties?: AnalyticsProperties) => {
      try {
        track(event, { ...properties, companyUid });
      } catch {
        // Telemetry only — swallow.
      }
    },
    [companyUid],
  );

  return { trackFirstTime, trackAlways };
}
