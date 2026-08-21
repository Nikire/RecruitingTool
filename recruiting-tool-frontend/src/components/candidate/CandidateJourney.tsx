import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CenteredLoadingSpinner, EmptyState } from "../common";
import {
  formatDurationMinutes,
  useCandidateJourney,
  type CandidateJourney as CandidateJourneyModel,
} from "./useCandidateJourney";

interface CandidateJourneyProps {
  candidateUid: string;
}

/**
 * One hiring process, with every stage the candidate has passed through and
 * the time they spent in each.
 */
const JourneyProcessCard: React.FC<{ journey: CandidateJourneyModel }> = ({
  journey,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card variant="outlined">
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1,
            mb: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
              {journey.hiringProcessTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("candidate_detail.stages_count", {
                count: journey.stages.length,
              })}
              {" · "}
              {t("candidate_detail.total_time", {
                duration: formatDurationMinutes(journey.totalTimeMinutes, t),
              })}
            </Typography>
          </Box>

          <Button
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={() =>
              navigate(`/hiring-process/${journey.hiringProcessUid}`)
            }
            sx={{ minHeight: 44 }}
          >
            {t("candidate_detail.view_process")}
          </Button>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {journey.stages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            {t("candidate_detail.no_stages")}
          </Typography>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("candidate_detail.stage_column")}</TableCell>
                  <TableCell>{t("candidate_detail.entered_column")}</TableCell>
                  <TableCell>{t("candidate_detail.exited_column")}</TableCell>
                  <TableCell>{t("candidate_detail.duration_column")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journey.stages.map((stage) => (
                  <TableRow key={stage.stageUid}>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2">
                          {stage.stageTitle}
                        </Typography>
                        {stage.isCurrent && (
                          <Chip
                            size="small"
                            variant="filled"
                            color="primary"
                            label={t("candidate_detail.stage_current")}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {stage.enteredAt
                        ? format(new Date(stage.enteredAt), "PP")
                        : t("common.n_a")}
                    </TableCell>
                    <TableCell>
                      {stage.exitedAt
                        ? format(new Date(stage.exitedAt), "PP")
                        : t("candidate_detail.stage_in_progress")}
                    </TableCell>
                    <TableCell>
                      {formatDurationMinutes(stage.durationMinutes, t)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * The candidate's pipeline: every hiring process they belong to and their
 * stage-by-stage progress through it. This is what "applications" means for a
 * candidate in this data model — a `HiringProcess` per role they are in.
 *
 * Backed by `GET /candidate/:uid/journey`, which had shipped with no frontend
 * consumer at all before this page existed.
 */
const CandidateJourney: React.FC<CandidateJourneyProps> = ({
  candidateUid,
}) => {
  const { t } = useTranslation();
  const {
    data: journeys,
    isLoading,
    isError,
  } = useCandidateJourney(candidateUid);

  if (isLoading) {
    return <CenteredLoadingSpinner minHeight="200px" />;
  }

  if (isError) {
    return (
      <Alert severity="error">{t("candidate_detail.journey_error")}</Alert>
    );
  }

  if (!journeys || journeys.length === 0) {
    return (
      <EmptyState
        message="candidate_detail.no_processes"
        icon={<TimelineIcon sx={{ fontSize: 48, color: "text.secondary" }} />}
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">
        {t("candidate_detail.processes_count", { count: journeys.length })}
      </Typography>
      {journeys.map((journey) => (
        <JourneyProcessCard key={journey.hiringProcessUid} journey={journey} />
      ))}
    </Stack>
  );
};

export default CandidateJourney;
