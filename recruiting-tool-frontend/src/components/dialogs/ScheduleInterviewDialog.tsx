import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateInterview,
  useUpdateInterview,
} from "../../hooks/api/useInterview";
import { Interview } from "../../types/interview.types";
import { addMinutes } from "date-fns";
import {
  useCalendarConnectionStatus,
  useCreateCalendarEvent,
} from "../../hooks/api/useGoogleCalendar";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onClose: () => void;
  stageUid: string;
  interview?: Interview | null;
  candidate?: { name: string; email: string };
}

// Time options in 30-minute increments from 06:00 to 22:00
const timeOptions = Array.from({ length: 33 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

interface FormData {
  scheduledDate: Date | null;
  scheduledTime: string;
  duration: number;
  meetingLink: string;
  notes: string;
}

const ScheduleInterviewDialog: React.FC<ScheduleInterviewDialogProps> = ({
  open,
  onClose,
  stageUid,
  interview,
  candidate,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!interview;
  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview();

  const { data: calendarStatus } = useCalendarConnectionStatus();
  const isCalendarConnected = calendarStatus?.connected ?? false;
  const createCalendarEvent = useCreateCalendarEvent();

  const [createGoogleMeetEvent, setCreateGoogleMeetEvent] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      scheduledDate: null,
      scheduledTime: "",
      duration: 60,
      meetingLink: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (interview) {
      const dateValue = interview.scheduledDate
        ? new Date(interview.scheduledDate)
        : null;

      // Use the HH:mm string directly; snap to nearest valid option or keep as-is
      const timeValue = interview.scheduledTime ?? "";

      reset({
        scheduledDate: dateValue,
        scheduledTime: timeValue,
        duration: interview.duration || 60,
        meetingLink: interview.meetingLink || "",
        notes: interview.notes || "",
      });
    } else {
      reset({
        scheduledDate: null,
        scheduledTime: "",
        duration: 60,
        meetingLink: "",
        notes: "",
      });
    }
  }, [interview, reset]);

  const buildCalendarStartTime = (
    date: Date | null,
    time: string,
  ): Date | null => {
    if (!date) return null;
    const start = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      start.setHours(hours, minutes, 0, 0);
    } else {
      start.setHours(0, 0, 0, 0);
    }
    return start;
  };

  const onSubmit = async (data: FormData) => {
    try {
      let resolvedMeetingLink = data.meetingLink;

      // If calendar is connected and user wants a Google Meet event, create it first
      if (isCalendarConnected && createGoogleMeetEvent) {
        const startDateTime = buildCalendarStartTime(
          data.scheduledDate,
          data.scheduledTime,
        );

        if (startDateTime) {
          const durationMinutes = data.duration || 60;
          const endDateTime = addMinutes(startDateTime, durationMinutes);
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          const calendarResponse = await createCalendarEvent.mutateAsync({
            summary: candidate
              ? `${t("schedule_interview.google_event_summary")} - ${candidate.name}`
              : t("schedule_interview.google_event_summary"),
            description: data.notes || undefined,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            timeZone,
            createMeetLink: true,
            sendUpdates: true,
            attendees: candidate
              ? [{ email: candidate.email, displayName: candidate.name }]
              : undefined,
          });

          if (calendarResponse.meetLink) {
            resolvedMeetingLink = calendarResponse.meetLink;
            setValue("meetingLink", calendarResponse.meetLink);
          }
        }
      }

      const payload = {
        stageUid,
        scheduledDate: data.scheduledDate
          ? data.scheduledDate.toISOString()
          : undefined,
        scheduledTime: data.scheduledTime || undefined,
        duration: data.duration || undefined,
        meetingLink: resolvedMeetingLink || undefined,
        notes: data.notes || undefined,
      };

      if (isEditMode && interview) {
        await updateMutation.mutateAsync({
          uid: interview.uid,
          data: {
            scheduledDate: payload.scheduledDate,
            scheduledTime: payload.scheduledTime,
            duration: payload.duration,
            meetingLink: payload.meetingLink,
            notes: payload.notes,
          },
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      handleClose();
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    createCalendarEvent.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode
          ? t("schedule_interview.edit_title")
          : t("schedule_interview.title")}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="scheduledDate"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value) return true; // Optional
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return (
                        value >= today ||
                        t("schedule_interview.date_future_error")
                      );
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label={t("schedule_interview.interview_date")}
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.scheduledDate,
                          helperText: errors.scheduledDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="scheduledTime"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.scheduledTime}>
                      <InputLabel id="scheduled-time-label">
                        {t("schedule_interview.interview_time")}
                      </InputLabel>
                      <Select
                        labelId="scheduled-time-label"
                        label={t("schedule_interview.interview_time")}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>{t("schedule_interview.time_not_set")}</em>
                        </MenuItem>
                        {timeOptions.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.scheduledTime && (
                        <FormHelperText>
                          {errors.scheduledTime.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="duration"
                  control={control}
                  rules={{
                    min: {
                      value: 1,
                      message: t("schedule_interview.duration_min_error", {
                        min: 1,
                      }),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("schedule_interview.duration")}
                      type="number"
                      fullWidth
                      error={!!errors.duration}
                      helperText={errors.duration?.message}
                    />
                  )}
                />
              </Grid>

              {/* Google Calendar integration section */}
              {isCalendarConnected ? (
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={createGoogleMeetEvent}
                        onChange={(e) =>
                          setCreateGoogleMeetEvent(e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {t("schedule_interview.create_google_meet_event")}
                      </Typography>
                    }
                  />
                </Grid>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                    <Typography variant="body2">
                      {t("schedule_interview.connect_google_calendar_hint")}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="meetingLink"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("schedule_interview.meeting_link")}
                      placeholder={t(
                        "schedule_interview.meeting_link_placeholder",
                      )}
                      fullWidth
                      error={!!errors.meetingLink}
                      helperText={errors.meetingLink?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("schedule_interview.notes")}
                      placeholder={t("schedule_interview.notes_placeholder")}
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common.cancel")}</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={20} />
          ) : isEditMode ? (
            t("common.update")
          ) : (
            t("schedule_interview.schedule")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;
