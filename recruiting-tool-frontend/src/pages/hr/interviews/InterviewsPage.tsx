import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  CalendarInterview,
  useCompanyCalendarInterviews,
  useUpdateInterviewNotes,
} from "../../../hooks/api/useCalendarInterviews";
import PageHeader from "../../../components/common/PageHeader";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a YYYY-MM-DD string offset by `months` from today */
function offsetDateString(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

/** Map interview status to a MUI Chip color */
type ChipColor =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "secondary";

function statusColor(status: string): ChipColor {
  switch (status?.toUpperCase()) {
    case "SCHEDULED":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    case "PENDING":
    default:
      return "default";
  }
}

/** Format a duration (minutes) into a human-readable string */
function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format a scheduled date + time into a readable string */
function formatDateTime(date?: string, time?: string): string {
  if (!date) return "";
  const d = new Date(date);
  const dateStr = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return time ? `${dateStr} · ${time}` : dateStr;
}

// ─── Sub-component: skeleton loader ──────────────────────────────────────────

const InterviewCardSkeleton: React.FC = () => (
  <Card variant="outlined">
    <CardContent>
      <Skeleton variant="text" width="40%" height={28} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
      <Skeleton variant="text" width="30%" height={20} sx={{ mt: 0.5 }} />
    </CardContent>
  </Card>
);

// ─── Sub-component: single interview card ────────────────────────────────────

interface InterviewCardProps {
  interview: CalendarInterview;
  highlighted: boolean;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  highlighted,
}) => {
  const { t } = useTranslation();
  const [notesOpen, setNotesOpen] = useState(false);
  const [draft, setDraft] = useState(interview.notes ?? "");
  const { mutate: saveNotes, isPending } = useUpdateInterviewNotes();

  const hasNotes = !!interview.notes;

  const handleSave = () => {
    saveNotes(
      { uid: interview.uid, notes: draft.trim() || null },
      { onSuccess: () => setNotesOpen(false) },
    );
  };

  const handleCancel = () => {
    setDraft(interview.notes ?? "");
    setNotesOpen(false);
  };

  return (
    <Card
      id={interview.uid}
      variant="outlined"
      sx={{
        borderLeft: highlighted ? "4px solid" : "1px solid",
        borderLeftColor: highlighted ? "warning.main" : "divider",
        backgroundColor: highlighted ? "warning.50" : undefined,
        transition: "background-color 0.3s, border-left-color 0.3s",
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          flexWrap="wrap"
        >
          {/* Left: main info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Candidate name */}
            <Typography variant="h6" noWrap>
              {interview.candidate?.name ?? t("common.unknown")}
            </Typography>

            {/* Job position + stage */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {interview.jobPosition?.title && (
                <Typography variant="body2" color="text.secondary">
                  {t("interviews.job_position")}: {interview.jobPosition.title}
                </Typography>
              )}
              {interview.stage?.title && (
                <Typography variant="body2" color="text.secondary">
                  · {t("interviews.stage")}: {interview.stage.title}
                </Typography>
              )}
            </Stack>

            {/* Date / time / duration */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(
                  interview.scheduledDate,
                  interview.scheduledTime,
                )}
              </Typography>
              {interview.duration && (
                <Typography variant="body2" color="text.secondary">
                  · {formatDuration(interview.duration)}
                </Typography>
              )}
            </Stack>

            {/* Organizer */}
            {interview.organizer?.name && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {t("interviews.organizer")}: {interview.organizer.name}
              </Typography>
            )}
          </Box>

          {/* Right: status chip + meeting link + notes toggle */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: { xs: 1, sm: 0 } }}
          >
            <Chip
              label={t(
                `interviews.${interview.status?.toLowerCase() ?? "pending"}`,
              )}
              color={statusColor(interview.status)}
              size="small"
            />
            {interview.meetingLink && (
              <Button
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon fontSize="small" />}
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("interviews.join_meeting")}
              </Button>
            )}
            <Tooltip
              title={
                hasNotes
                  ? t("interviews.notes_edit")
                  : t("interviews.notes_add")
              }
            >
              <IconButton
                size="small"
                color={hasNotes ? "primary" : "default"}
                onClick={() => {
                  setDraft(interview.notes ?? "");
                  setNotesOpen((prev) => !prev);
                }}
                aria-label={
                  hasNotes
                    ? t("interviews.notes_edit")
                    : t("interviews.notes_add")
                }
              >
                <EditNoteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Notes panel */}
        <Collapse in={notesOpen} unmountOnExit>
          <Divider sx={{ mt: 1.5, mb: 1.5 }} />
          <Typography variant="subtitle2" gutterBottom>
            {t("interviews.notes")}
          </Typography>
          <TextField
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            size="small"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("interviews.notes_placeholder")}
            inputProps={{ maxLength: 1000 }}
          />
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ mt: 1 }}
          >
            <Button
              size="small"
              color="inherit"
              onClick={handleCancel}
              disabled={isPending}
            >
              {t("interviews.notes_cancel")}
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={isPending}
            >
              {t("interviews.notes_save")}
            </Button>
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const InterviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const highlightUid = searchParams.get("highlight") ?? "";

  const startDate = useMemo(() => offsetDateString(-3), []);
  const endDate = useMemo(() => offsetDateString(3), []);

  const { data: interviews, isLoading } = useCompanyCalendarInterviews(
    startDate,
    endDate,
  );

  // Sort descending by scheduledDate + scheduledTime (most recent first)
  const sorted = useMemo(() => {
    if (!interviews) return [];
    return [...interviews].sort((a, b) => {
      const aKey = `${a.scheduledDate ?? ""}${a.scheduledTime ?? ""}`;
      const bKey = `${b.scheduledDate ?? ""}${b.scheduledTime ?? ""}`;
      return bKey.localeCompare(aKey);
    });
  }, [interviews]);

  // Scroll to highlighted interview once data is loaded
  useEffect(() => {
    if (!highlightUid || !interviews) return;
    const el = document.getElementById(highlightUid);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightUid, interviews]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="interviews.page_title"
        subtitle="interviews.page_subtitle"
      />

      {isLoading && (
        <Stack spacing={2}>
          {[...Array(5)].map((_, i) => (
            <InterviewCardSkeleton key={i} />
          ))}
        </Stack>
      )}

      {!isLoading && sorted.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 10,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {t("interviews.no_interviews")}
          </Typography>
        </Box>
      )}

      {!isLoading && sorted.length > 0 && (
        <Stack spacing={2}>
          {sorted.map((interview) => (
            <InterviewCard
              key={interview.uid}
              interview={interview}
              highlighted={interview.uid === highlightUid}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default InterviewsPage;
