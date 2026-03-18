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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateInterview,
  useUpdateInterview,
} from "../../hooks/api/useInterview";
import { Interview } from "../../types/interview.types";
import { useCalendarConnectionStatus } from "../../hooks/api/useGoogleCalendar";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onClose: () => void;
  stageUid: string;
  interview?: Interview | null;
  candidate?: { name: string; email: string };
}

const durationOptions = [15, 30, 45, 60, 90, 120];

interface FormData {
  scheduledDate: Date | null;
  scheduledTime: Date | null;
  duration: number;
  meetingLink: string;
  notes: string;
}

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

  const { data: calendarStatus } = useCalendarConnectionStatus();
  const isCalendarConnected = calendarStatus?.connected ?? false;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      scheduledDate: null,
      scheduledTime: null,
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

      // Parse HH:mm string into a Date object so TimePicker can display it
      let timeValue: Date | null = null;
      if (interview.scheduledTime) {
        const [hours, minutes] = interview.scheduledTime.split(":").map(Number);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        timeValue = d;
      }

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
        scheduledTime: null,
        duration: 60,
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
          ? format(data.scheduledTime, "HH:mm")
          : undefined,
        duration: data.duration || undefined,
        meetingLink: data.meetingLink || undefined,
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
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.duration}>
                      <InputLabel id="duration-label">
                        {t("schedule_interview.duration")}
                      </InputLabel>
                      <Select
                        labelId="duration-label"
                        label={t("schedule_interview.duration")}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {durationOptions.map((mins) => (
                          <MenuItem key={mins} value={mins}>
                            {t("interviews.duration_minutes", { count: mins })}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.duration && (
                        <FormHelperText>
                          {errors.duration.message}
                        </FormHelperText>
                      )}
                    </FormControl>
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
