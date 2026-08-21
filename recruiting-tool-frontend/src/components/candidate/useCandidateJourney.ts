import { useQuery } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import axiosInstance from "../../api/axios";

/**
 * Candidate journey — the per-candidate view of every hiring process the
 * candidate is in, with the stage-by-stage time tracking the backend already
 * computes in `GET /candidate/:uid/journey`.
 *
 * The endpoint shipped a long time ago (candidate.controller.ts) but had no
 * frontend consumer until the candidate detail page. The query lives next to
 * its only consumers rather than in `src/api` + `src/hooks/api` because this
 * agent does not own those directories; see the report for the follow-up to
 * move it into `src/api/candidates.ts` / `src/hooks/api/useCandidates.ts`
 * alongside every other candidate call.
 */

/** One stage of one hiring process, as returned by the journey endpoint. */
export interface CandidateJourneyStep {
  stageUid: string;
  stageTitle: string;
  stagePosition: number;
  /** ISO date string. */
  enteredAt: string;
  /** ISO date string, or null while the candidate is still in the stage. */
  exitedAt?: string | null;
  durationMinutes?: number | null;
  isCurrent: boolean;
}

/** One hiring process the candidate is (or was) in. */
export interface CandidateJourney {
  candidateUid: string;
  candidateName: string;
  hiringProcessUid: string;
  hiringProcessTitle: string;
  totalTimeMinutes?: number | null;
  stages: CandidateJourneyStep[];
}

export const CANDIDATE_JOURNEY_QUERY_KEY = "candidate-journey";

/**
 * Fetches the candidate's journey across all of their hiring processes.
 * Disabled until a uid is available so the route can render while
 * `useParams()` resolves.
 */
export const useCandidateJourney = (candidateUid: string | undefined) =>
  useQuery<CandidateJourney[]>({
    queryKey: [CANDIDATE_JOURNEY_QUERY_KEY, candidateUid],
    queryFn: async () => {
      const response = await axiosInstance.get<CandidateJourney[]>(
        `/candidate/${candidateUid}/journey`,
      );
      return response.data;
    },
    enabled: Boolean(candidateUid),
    staleTime: 2 * 60 * 1000,
  });

/**
 * Every stage uid across every hiring process, de-duplicated and ordered.
 * Used to look up the candidate's interviews, which the API only exposes
 * per stage (`GET /interview/stage/:stageUid`).
 */
export const collectStageUids = (
  journeys: CandidateJourney[] | undefined,
): string[] =>
  Array.from(
    new Set(
      (journeys ?? []).flatMap((journey) =>
        journey.stages.map((stage) => stage.stageUid),
      ),
    ),
  );

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 60 * 24;

/**
 * Renders a minute count as the largest sensible unit ("3 d", "5 h", "12 min").
 * Every unit label goes through i18n — never build this string by hand.
 */
export const formatDurationMinutes = (
  minutes: number | null | undefined,
  t: TFunction,
): string => {
  if (minutes === null || minutes === undefined) {
    return t("common.n_a");
  }

  if (minutes >= MINUTES_PER_DAY) {
    return t("candidate_detail.duration_days", {
      count: Math.round(minutes / MINUTES_PER_DAY),
    });
  }

  if (minutes >= MINUTES_PER_HOUR) {
    return t("candidate_detail.duration_hours", {
      count: Math.round(minutes / MINUTES_PER_HOUR),
    });
  }

  return t("candidate_detail.duration_minutes", { count: Math.round(minutes) });
};
