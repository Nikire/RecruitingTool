import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useCreateInterview, useUpdateInterview } from '../../hooks/api/useInterview';
import { Interview } from '../../types/interview.types';
import { format } from 'date-fns';

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
      meetingLink: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (interview) {
      // Parse existing interview data for editing
      const dateValue = interview.scheduledDate ? new Date(interview.scheduledDate) : null;

      // Parse time string (HH:mm) into a Date object
      let timeValue = null;
      if (interview.scheduledTime) {
        const [hours, minutes] = interview.scheduledTime.split(':');
        timeValue = new Date();
        timeValue.setHours(parseInt(hours, 10));
        timeValue.setMinutes(parseInt(minutes, 10));
      }

      reset({
        scheduledDate: dateValue,
        scheduledTime: timeValue,
        duration: interview.duration || 60,
        meetingLink: interview.meetingLink || '',
        notes: interview.notes || '',
      });
    } else {
      reset({
        scheduledDate: null,
        scheduledTime: null,
        duration: 60,
        meetingLink: '',
        notes: '',
      });
    }
  }, [interview, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        stageUid,
        scheduledDate: data.scheduledDate ? data.scheduledDate.toISOString() : undefined,
        scheduledTime: data.scheduledTime ? format(data.scheduledTime, 'HH:mm') : undefined,
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
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Interview' : 'Schedule Interview'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="scheduledDate"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value) return true; // Optional
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return value >= today || 'Date must be in the future';
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="Interview Date"
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

              <Grid item xs={12}>
                <Controller
                  name="scheduledTime"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="Interview Time"
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

              <Grid item xs={12}>
                <Controller
                  name="duration"
                  control={control}
                  rules={{
                    min: { value: 1, message: 'Duration must be at least 1 minute' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Duration (minutes)"
                      type="number"
                      fullWidth
                      error={!!errors.duration}
                      helperText={errors.duration?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="meetingLink"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meeting Link (optional)"
                      placeholder="https://zoom.us/j/123456789"
                      fullWidth
                      error={!!errors.meetingLink}
                      helperText={errors.meetingLink?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (optional)"
                      placeholder="Additional information about the interview..."
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {isEditMode ? 'Update' : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;
