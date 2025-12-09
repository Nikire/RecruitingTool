import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreateConnectionRequest } from '../../hooks/connection-requests';
import { CreateConnectionRequestDto, RolesType } from '../../types/connection-requests';
import { useValidationRules } from '../../utils/validation';
import FormErrorSummary from '../common/FormErrorSummary';

interface RequestToJoinDialogProps {
  open: boolean;
  onClose: () => void;
  companyUid: string;
  companyName: string;
}

const ROLE_OPTIONS: RolesType[] = [
  RolesType.HR,
  RolesType.HR_MANAGER,
  RolesType.RECRUITER,
];

const RequestToJoinDialog: React.FC<RequestToJoinDialogProps> = ({
  open,
  onClose,
  companyUid,
  companyName,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateConnectionRequestDto>({
    defaultValues: {
      companyUid,
      requestedRole: RolesType.HR,
      message: '',
    },
  });

  const { mutate: createRequest, isPending } = useCreateConnectionRequest();

  const onSubmit = (data: CreateConnectionRequestDto) => {
    createRequest(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('connection_requests.request_to_join')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormErrorSummary errors={errors} />

          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('connection_requests.request_description', { companyName })}
          </Typography>

          <input type="hidden" {...register('companyUid')} />

          <Controller
            name="requestedRole"
            control={control}
            rules={validationRules.required(t('connection_requests.fields.role'))}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label={t('connection_requests.fields.role')}
                fullWidth
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {t(`roles.${role.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label={t('connection_requests.fields.message')}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            {...register(
              'message',
              validationRules.maxLength(500),
            )}
            error={!!errors.message}
            helperText={
              errors.message?.message ||
              t('connection_requests.fields.message_help')
            }
            placeholder={t('connection_requests.fields.message_placeholder')}
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {t('connection_requests.approval_notice')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? t('common.sending') : t('common.send')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RequestToJoinDialog;
