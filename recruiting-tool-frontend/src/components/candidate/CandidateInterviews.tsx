import { useMemo, useState } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useQueries } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getInterviewsByStage } from "../../api/interview";
import { interviewKeys } from "../../api/queryKeys";
import { Interview } from "../../types/interview.types";
import { Candidate } from "../../types/candidate";
import InterviewCard from "../interview/InterviewCard";
import ScheduleInterviewDialog from "../dialogs/ScheduleInterviewDialog";
import { CenteredLoadingSpinner, EmptyState } from "../common";
import { collectStageUids, useCandidateJourney } from "./useCandidateJourney";

interface CandidateInterviewsProps {
  candidate: Candidate;
}

/** Newest scheduled interview first; undated ones sink to the bottom. */
const byScheduledDateDesc = (a: Interview, b: Interview): number => {
  const left = a.scheduledDate
    ? new Date(a.scheduledDate).getTime()
    : -Infinity;
  const right = b.scheduledDate
    ? new Date(b.scheduledDate).getTime()
    : -Infinity;
  return right - left;
};

/**
 * Every interview booked for this candidate, across every stage of every
 * hiring process they are in.
 *
 * The API only exposes interviews per stage (`GET /interview/stage/:stageUid`),
 * and a stage belongs to exactly one hiring process, which belongs to exactly
 * one candidate — so fanning out over the candidate's stage uids yields
 * precisely this candidate's interviews with no client-side filtering. The
 * query keys match `useInterviewsByStage`, so the cards stay in sync with the
 * stage accordion on the hiring process page.
 */
const CandidateInterviews: React.FC<CandidateInterviewsProps> = ({
  candidate,
}) => {
  const { t } = useTranslation();
  const [editingInterview, setEditingInterview] = useState<Interview | null>(
    null,
  );

  const {
    data: journeys,
    isLoading: isJourneyLoading,
    isError: isJourneyError,
  } = useCandidateJourney(candidate.uid);

  const stageUids = useMemo(() => collectStageUids(journeys), [journeys]);

  const interviewQueries = useQueries({
    queries: stageUids.map((stageUid) => ({
      queryKey: interviewKeys.byStage(stageUid),
      queryFn: () => getInterviewsByStage(stageUid),
      staleTime: 2 * 60 * 1000,
    })),
    combine: (results) => ({
      interviews: results
        .flatMap((result) => result.data ?? [])
        .sort(byScheduledDateDesc),
      isLoading: results.some((result) => result.isLoading),
      isError: results.some((result) => result.isError),
    }),
  });

  if (isJourneyLoading || interviewQueries.isLoading) {
    return <CenteredLoadingSpinner minHeight="200px" />;
  }

  if (isJourneyError || interviewQueries.isError) {
    return (
      <Alert severity="error">{t("candidate_detail.interviews_error")}</Alert>
    );
  }

  if (interviewQueries.interviews.length === 0) {
    return (
      <EmptyState
        message="interviews.no_interviews"
        icon={<EventIcon sx={{ fontSize: 48, color: "text.secondary" }} />}
      />
    );
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("candidate_detail.interviews_count", {
          count: interviewQueries.interviews.length,
        })}
      </Typography>

      <Stack>
        {interviewQueries.interviews.map((interview) => (
          <InterviewCard
            key={interview.uid}
            interview={interview}
            onEdit={setEditingInterview}
          />
        ))}
      </Stack>

      {editingInterview && (
        <ScheduleInterviewDialog
          open
          onClose={() => setEditingInterview(null)}
          stageUid={editingInterview.stageUid}
          interview={editingInterview}
          candidate={{ name: candidate.name, email: candidate.email }}
        />
      )}
    </>
  );
};

export default CandidateInterviews;
