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
  Typography,
  Alert,
  FormHelperText,
  Chip,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  useCreateInterview,
  useUpdateInterview,
} from "../../hooks/api/useInterview";
import { Interview } from "../../types/interview.types";
import {
  useCalendarConnectionStatus,
  useGetCalendarSettings,
} from "../../hooks/api/useGoogleCalendar";
import { useStage } from "../../hooks/api/useStages";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onClose: () => void;
  stageUid: string;
  interview?: Interview | null;
  candidate?: { name: string; email: string };
}

interface FormData {
  scheduledDate: Date | null;
  scheduledTime: Date | null;
  meetingLink: string;
  notes: string;
}

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const DEFAULT_DURATION = 60;

const ScheduleInterviewDialog: React.FC<ScheduleInterviewDialogProps> = ({
  open,
  onClose,
  stageUid,
  interview,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!interview;
  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview();

  const { data: stageData } = useStage(stageUid);

  const { data: calendarStatus } = useCalendarConnectionStatus();
  const isCalendarConnected = calendarStatus?.connected ?? false;

  const { data: calendarSettings } = useGetCalendarSettings();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      scheduledDate: null,
      scheduledTime: null,
      meetingLink: "",
      notes: "",
    },
  });

  const watchedDate = watch("scheduledDate");

  // Effective duration: stage-specific value takes priority, then calendar
  // settings default, then a hardcoded fallback of 60 min.
  const effectiveDuration = useMemo(() => {
    if (stageData?.estimatedTime != null) return stageData.estimatedTime;
    if (calendarSettings?.defaultDuration != null)
      return calendarSettings.defaultDuration;
    return DEFAULT_DURATION;
  }, [stageData?.estimatedTime, calendarSettings?.defaultDuration]);

  // Working hours for the currently selected date (if any).
  const workingHoursForDay = useMemo(() => {
    if (!watchedDate || !calendarSettings?.workingHours) return null;
    const dayKey = DAY_KEYS[watchedDate.getDay()];
    const hours = calendarSettings.workingHours[dayKey];
    return hours?.enabled ? hours : null;
  }, [watchedDate, calendarSettings?.workingHours]);

  useEffect(() => {
    if (interview) {
      const dateValue = interview.scheduledDate
        ? new Date(interview.scheduledDate)
        : null;

      // Parse HH:mm string into a Date object so TimePicker can display it.
      // Use setUTCHours so the picker shows the stored time correctly regardless
      // of the browser's local timezone offset.
      let timeValue: Date | null = null;
      if (interview.scheduledTime) {
        const [hours, minutes] = interview.scheduledTime.split(":").map(Number);
        const d = new Date();
        d.setUTCHours(hours, minutes, 0, 0);
        timeValue = d;
      }

      reset({
        scheduledDate: dateValue,
        scheduledTime: timeValue,
        meetingLink: interview.meetingLink || "",
        notes: interview.notes || "",
      });
    } else {
      reset({
        scheduledDate: null,
        scheduledTime: null,
        meetingLink: "",
        notes: "",
      });
    }
  }, [interview, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Format date as YYYY-MM-DD (date-only, no time component) to avoid
      // timezone offset shifting the date when the backend parses the ISO string.
      const formatDateOnly = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const payload = {
        stageUid,
        scheduledDate: data.scheduledDate
          ? formatDateOnly(data.scheduledDate)
          : undefined,
        scheduledTime: data.scheduledTime
          ? (() => {
              const h = data.scheduledTime!.getUTCHours();
              const m = data.scheduledTime!.getUTCMinutes();
              return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            })()
          : undefined,
        duration: effectiveDuration,
        meetingLink: data.meetingLink || undefined,
        notes: data.notes || undefined,
      };

      if (isEditMode && interview) {
        await updateMutation.mutateAsync({
          uid: interview.uid,
          data: {
            scheduledDate: payload.scheduledDate,
            scheduledTime: payload.scheduledTime,
            duration: effectiveDuration,
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode
          ? t("schedule_interview.edit_title")
          : t("schedule_interview.title")}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          {/* Duration indicator */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {t("schedule_interview.duration_label")}
            </Typography>
            <Chip
              label={t("schedule_interview.duration_minutes", {
                count: effectiveDuration,
              })}
              size="small"
              color={stageData?.estimatedTime != null ? "primary" : "default"}
              variant="outlined"
            />
            {stageData?.estimatedTime == null &&
              calendarSettings?.defaultDuration != null && (
                <Typography variant="caption" color="text.secondary">
                  {t("schedule_interview.duration_from_settings")}
                </Typography>
              )}
          </Box>

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
                    <>
                      <TimePicker
                        label={t("schedule_interview.interview_time")}
                        value={field.value}
                        onChange={(newValue) => field.onChange(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.scheduledTime,
                            helperText: errors.scheduledTime?.message,
                          },
                        }}
                      />
                      <FormHelperText sx={{ mt: 0.5, ml: 1.75 }}>
                        {t("schedule_interview.timezone_info", {
                          timezone:
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                        })}
                      </FormHelperText>
                      {workingHoursForDay && (
                        <FormHelperText sx={{ mt: 0.25, ml: 1.75 }}>
                          {t("schedule_interview.working_hours_hint", {
                            start: workingHoursForDay.startTime,
                            end: workingHoursForDay.endTime,
                          })}
                        </FormHelperText>
                      )}
                    </>
                  )}
                />
              </Grid>

              {/* Google Calendar integration section */}
              {isCalendarConnected ? (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="success" variant="outlined" sx={{ py: 0.5 }}>
                    <Typography variant="body2">
                      {t("schedule_interview.calendar_event_auto_created")}
                    </Typography>
                  </Alert>
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
