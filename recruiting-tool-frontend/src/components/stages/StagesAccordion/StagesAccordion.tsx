import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";
import {
  LockOpen,
  CheckCircle,
  Lock,
  KeyboardArrowDown,
  Event as EventIcon,
  EventAvailable as BookingIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { Stage } from "../../../types/stage.types";
import { AccordionHeaderWrapper } from "./StagesAccordion.styles";
import { useInterviewsByStage } from "../../../hooks/api/useInterview";
import InterviewCard from "../../interview/InterviewCard";
import ScheduleInterviewDialog from "../../dialogs/ScheduleInterviewDialog";
import { Interview } from "../../../types/interview.types";
import { canManageResources } from "../../../utils/permissions";
import { useUserAtom } from "../../../hooks/api/state/useUserAtom";
import { useTranslation } from "react-i18next";
import StageNoteButton from "../StageNoteButton";
import {
  useSendStageBookingLink,
  type SendBookingLinkResponse,
} from "../../../hooks/api/useTimeSlots";
import { useGetCompanyCalendarSettings } from "../../../hooks/api/useCompanyCalendarSettings";

type StagesAccordionProps = {
  stage: Stage;
  hiringProcessUid: string;
  disabled?: boolean;
  candidate?: { name: string; email: string };
};

const StagesAccordion: React.FC<StagesAccordionProps> = ({
  stage,
  hiringProcessUid,
  disabled,
  candidate,
}) => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(
    null,
  );
  const [bookingResult, setBookingResult] =
    useState<SendBookingLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: interviews, isLoading: interviewsLoading } =
    useInterviewsByStage(stage.uid);
  const { mutate: sendStageBookingLink, isPending: isSendingLink } =
    useSendStageBookingLink();
  const { data: calendarSettings } = useGetCompanyCalendarSettings();

  const canManage = canManageResources(user);
  const isBookingEnabled = calendarSettings?.isBookingEnabled ?? false;

  const handleScheduleClick = () => {
    setEditingInterview(null);
    setScheduleDialogOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
    setScheduleDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setScheduleDialogOpen(false);
    setEditingInterview(null);
  };

  const handleSendBookingLink = () => {
    sendStageBookingLink(stage.uid, {
      onSuccess: (data) => {
        setBookingResult(data);
        setCopied(false);
      },
    });
  };

  const handleCopyLink = () => {
    if (!bookingResult) return;
    navigator.clipboard.writeText(bookingResult.bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Accordion
        elevation={0}
        defaultExpanded={stage.status === "CURRENT"}
        disabled={disabled}
        square={false}
      >
        <AccordionSummary expandIcon={<KeyboardArrowDown />}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              pr: 1,
            }}
          >
            <AccordionHeaderWrapper>
              {stage.status === "CURRENT" ? (
                <LockOpen sx={{ color: "text.primary" }} />
              ) : stage.status === "DONE" ? (
                <CheckCircle color="primary" />
              ) : (
                <Lock color="disabled" />
              )}
              <Typography variant="h6">{stage.title}</Typography>
            </AccordionHeaderWrapper>
            {!disabled && (
              <StageNoteButton
                hiringProcessUid={hiringProcessUid}
                stageUid={stage.uid}
                existingNote={stage.note}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {disabled ? null : stage.description}
          </Typography>

          {!disabled && (
            <>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <EventIcon fontSize="small" />
                    {t("interviews.title")}
                  </Typography>
                  {canManage && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {isBookingEnabled && (
                        <Tooltip title={t("booking_link.send_stage_tooltip")}>
                          <span>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={
                                isSendingLink ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : (
                                  <BookingIcon />
                                )
                              }
                              onClick={handleSendBookingLink}
                              disabled={isSendingLink}
                            >
                              {t("booking_link.send_to_candidate")}
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EventIcon />}
                        onClick={handleScheduleClick}
                      >
                        {t("interviews.schedule_interview")}
                      </Button>
                    </Box>
                  )}
                </Box>

                {bookingResult && (
                  <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setBookingResult(null)}
                  >
                    <Typography variant="caption" display="block">
                      {t("booking_link.sent_to")} {bookingResult.candidateEmail}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<LinkIcon fontSize="small" />}
                      onClick={handleCopyLink}
                      sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
                    >
                      {copied
                        ? t("booking_link.copied")
                        : t("booking_link.copy_link")}
                    </Button>
                  </Alert>
                )}

                {interviewsLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 3 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : interviews && interviews.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {interviews.map((interview) => (
                      <InterviewCard
                        key={interview.uid}
                        interview={interview}
                        onEdit={handleEditInterview}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: "center" }}
                  >
                    {t("interviews.no_interviews")}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>

      {canManage && (
        <ScheduleInterviewDialog
          open={scheduleDialogOpen}
          onClose={handleCloseDialog}
          stageUid={stage.uid}
          interview={editingInterview}
          candidate={candidate}
        />
      )}
    </>
  );
};

export default StagesAccordion;
