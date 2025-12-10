import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Rating,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FeedbackCategory, CreateFeedbackDto } from '../../types/feedback';
import { useCreateFeedback } from '../../hooks/useFeedback';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const createFeedback = useCreateFeedback();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFeedbackDto>({
    defaultValues: {
      content: '',
      category: undefined,
      rating: undefined,
    },
  });

  const onSubmit = async (data: CreateFeedbackDto) => {
    try {
      await createFeedback.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('feedback.modal_title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('feedback.modal_description')}
        </Typography>

        <form id="feedback-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Category Select */}
          <Controller
            name="category"
            control={control}
            rules={{
              required: t('feedback.validation.category_required'),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label={t('feedback.category_label')}
                placeholder={t('feedback.category_placeholder')}
                error={!!errors.category}
                helperText={errors.category?.message}
                sx={{ mb: 2 }}
              >
                <MenuItem value={FeedbackCategory.FEATURE_REQUEST}>
                  {t('feedback.categories.FEATURE_REQUEST')}
                </MenuItem>
                <MenuItem value={FeedbackCategory.BUG_REPORT}>
                  {t('feedback.categories.BUG_REPORT')}
                </MenuItem>
                <MenuItem value={FeedbackCategory.GENERAL}>
                  {t('feedback.categories.GENERAL')}
                </MenuItem>
              </TextField>
            )}
          />

          {/* Content TextArea */}
          <Controller
            name="content"
            control={control}
            rules={{
              required: t('feedback.validation.content_required'),
              minLength: {
                value: 10,
                message: t('feedback.validation.content_min_length'),
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label={t('feedback.content_label')}
                placeholder={t('feedback.content_placeholder')}
                helperText={errors.content?.message || t('feedback.content_helper')}
                error={!!errors.content}
                sx={{ mb: 2 }}
              />
            )}
          />

          {/* Optional Rating */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {t('feedback.rating_label')}
            </Typography>
            <Controller
              name="rating"
              control={control}
              rules={{
                min: {
                  value: 1,
                  message: t('feedback.validation.rating_invalid'),
                },
                max: {
                  value: 5,
                  message: t('feedback.validation.rating_invalid'),
                },
              }}
              render={({ field }) => (
                <Box>
                  <Rating
                    {...field}
                    value={field.value || 0}
                    onChange={(_, value) => field.onChange(value)}
                    size="large"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {t('feedback.rating_helper')}
                  </Typography>
                  {errors.rating && (
                    <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                      {errors.rating.message}
                    </Typography>
                  )}
                </Box>
              )}
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={createFeedback.isPending}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="feedback-form"
          variant="contained"
          disabled={createFeedback.isPending}
        >
          {createFeedback.isPending ? t('feedback.submitting') : t('feedback.submit_button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
