import React, { useState } from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import CancelIcon from "@mui/icons-material/Cancel";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  CalendarInterview,
  useRescheduleInterview,
  useCancelCalendarInterview,
} from "../../hooks/api/useCalendarInterviews";

interface InterviewDetailPopoverProps {
  interview: CalendarInterview | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const InterviewDetailPopover: React.FC<InterviewDetailPopoverProps> = ({
  interview,
  anchorEl,
  onClose,
}) => {
  const { t } = useTranslation();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const reschedule = useRescheduleInterview();
  const cancel = useCancelCalendarInterview();

  const open = Boolean(anchorEl) && interview !== null;

  const handleCopyLink = () => {
    if (interview?.meetingLink) {
      navigator.clipboard.writeText(interview.meetingLink).then(() => {
        toast.success(t("calendar.link_copied"));
      });
    }
  };

  const handleRescheduleOpen = () => {
    setNewDate(interview?.scheduledDate ?? "");
    setNewTime(interview?.scheduledTime ?? "");
    setRescheduleOpen(true);
  };

  const handleRescheduleClose = () => {
    setRescheduleOpen(false);
    setNewDate("");
    setNewTime("");
  };

  const handleRescheduleSave = () => {
    if (!interview) return;
    reschedule.mutate(
      {
        uid: interview.uid,
        data: {
          scheduledDate: newDate || undefined,
          scheduledTime: newTime || undefined,
        },
      },
      {
        onSuccess: () => {
          handleRescheduleClose();
          onClose();
        },
      },
    );
  };

  const handleCancelConfirm = () => {
    if (!interview) return;
    cancel.mutate(interview.uid, {
      onSuccess: () => {
        setCancelOpen(false);
        onClose();
      },
    });
  };

  if (!interview) return null;

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: { width: 480, maxWidth: "calc(100vw - 32px)", p: 0 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ pr: 1 }}>
              {interview.candidate?.name ?? t("common.unknown")}
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {interview.status && (
            <Chip
              label={interview.status}
              size="small"
              sx={{ mb: 1.5, textTransform: "capitalize", fontSize: "0.7rem" }}
            />
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            {interview.jobPosition && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("calendar.job_position")}
                </Typography>
                <Typography variant="body2">
                  {interview.jobPosition.title}
                </Typography>
              </Box>
            )}

            {interview.stage && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("calendar.stage")}
                </Typography>
                <Typography variant="body2">{interview.stage.title}</Typography>
              </Box>
            )}

            {interview.organizer && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("calendar.organizer")}
                </Typography>
                <Typography variant="body2">
                  {interview.organizer.name}
                </Typography>
              </Box>
            )}

            {(interview.scheduledDate || interview.scheduledTime) && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("calendar.scheduled_date")} /{" "}
                  {t("calendar.scheduled_time")}
                </Typography>
                <Typography variant="body2">
                  {[interview.scheduledDate, interview.scheduledTime]
                    .filter(Boolean)
                    .join(" · ")}
                </Typography>
              </Box>
            )}

            {interview.duration != null && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("calendar.duration")}
                </Typography>
                <Typography variant="body2">
                  {interview.duration} {t("calendar.minutes")}
                </Typography>
              </Box>
            )}

            {interview.meetingLink ? (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("calendar.meeting_link")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Link
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 200,
                      display: "block",
                    }}
                  >
                    {interview.meetingLink}
                  </Link>
                  <IconButton
                    size="small"
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleCopyLink}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("calendar.meeting_link")}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {t("calendar.no_meeting_link")}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            p: 1.5,
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
          }}
        >
          {interview.meetingLink && (
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              variant="outlined"
            >
              {t("calendar.copy_meet_link")}
            </Button>
          )}
          <Button
            size="small"
            startIcon={<EditCalendarIcon />}
            onClick={handleRescheduleOpen}
            variant="outlined"
            color="primary"
          >
            {t("calendar.reschedule")}
          </Button>
          <Button
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => setCancelOpen(true)}
            variant="outlined"
            color="error"
          >
            {t("calendar.cancel_interview")}
          </Button>
        </Box>
      </Popover>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleOpen}
        onClose={handleRescheduleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("calendar.reschedule_title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={t("calendar.new_date")}
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label={t("calendar.new_time")}
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRescheduleClose}>{t("common.cancel")}</Button>
          <Button
            onClick={handleRescheduleSave}
            variant="contained"
            disabled={reschedule.isPending}
          >
            {t("calendar.save_reschedule")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("calendar.confirm_cancel")}</DialogTitle>
        <DialogContent>
          <Typography>{t("calendar.cancel_confirm_message")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
            disabled={cancel.isPending}
          >
            {t("calendar.cancel_interview")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InterviewDetailPopover;
