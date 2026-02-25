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
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateInterview,
  useUpdateInterview,
} from "../../hooks/api/useInterview";
import { Interview } from "../../types/interview.types";
import { format } from "date-fns";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onClose: () => void;
  stageUid: string;
  interview?: Interview | null;
}

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
      // Parse existing interview data for editing
      const dateValue = interview.scheduledDate
        ? new Date(interview.scheduledDate)
        : null;

      // Parse time string (HH:mm) into a Date object
      let timeValue = null;
      if (interview.scheduledTime) {
        const [hours, minutes] = interview.scheduledTime.split(":");
        timeValue = new Date();
        timeValue.setHours(parseInt(hours, 10));
        timeValue.setMinutes(parseInt(minutes, 10));
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
      const payload = {
        stageUid,
        scheduledDate: data.scheduledDate
          ? data.scheduledDate.toISOString()
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
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending ? (
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
