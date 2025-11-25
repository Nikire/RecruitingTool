import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreateEmailTemplate, useUpdateEmailTemplate } from '../../hooks/api/useEmailTemplates';
import { EmailTemplate } from '../../types/emailTemplate.types';
import { useUserAtom } from '../../hooks/api/state/useUserAtom';

interface EmailTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
}

interface EmailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  isDefault: boolean;
}

const EmailTemplateDialog: React.FC<EmailTemplateDialogProps> = ({ open, onClose, template }) => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  const AVAILABLE_VARIABLES = [
    { key: '{{candidateName}}', description: t('email_template.variable_candidate_name') },
    { key: '{{positionTitle}}', description: t('email_template.variable_position_title') },
    { key: '{{companyName}}', description: t('email_template.variable_company_name') },
    { key: '{{hrName}}', description: t('email_template.variable_hr_name') },
    { key: '{{interviewDate}}', description: t('email_template.variable_interview_date') },
    { key: '{{interviewTime}}', description: t('email_template.variable_interview_time') },
  ];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailTemplateFormData>({
    defaultValues: {
      name: template?.name || '',
      subject: template?.subject || '',
      body: template?.body || '',
      isDefault: template?.isDefault || false,
    },
  });

  const { mutate: createTemplate, isPending: isCreating } = useCreateEmailTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateEmailTemplate();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!template;

  const onSubmit = (data: EmailTemplateFormData) => {
    if (!user?.company?.uid) {
      return;
    }

    if (isEditMode && template) {
      updateTemplate(
        {
          uid: template.uid,
          data: {
            name: data.name,
            subject: data.subject,
            body: data.body,
            isDefault: data.isDefault,
          },
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        }
      );
    } else {
      createTemplate(
        {
          name: data.name,
          subject: data.subject,
          body: data.body,
          companyUid: user.company.uid,
          isDefault: data.isDefault,
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        }
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const insertVariable = (variable: string) => {
    const currentBody = watch('body') || '';
    setValue('body', currentBody + variable);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? t('email_template.edit_title') : t('email_template.create_title')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label={t('email_template.template_name')}
            fullWidth
            margin="normal"
            {...register('name', {
              required: t('email_template.name_required'),
              minLength: {
                value: 3,
                message: t('email_template.name_min_length', {min: 3}),
              },
              maxLength: {
                value: 200,
                message: t('email_template.name_max_length', {max: 200}),
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
            placeholder={t('email_template.template_name_placeholder')}
          />

          <TextField
            label={t('email_template.subject')}
            fullWidth
            margin="normal"
            {...register('subject', {
              required: t('email_template.subject_required'),
              minLength: {
                value: 3,
                message: t('email_template.subject_min_length', {min: 3}),
              },
              maxLength: {
                value: 500,
                message: t('email_template.subject_max_length', {max: 500}),
              },
            })}
            error={!!errors.subject}
            helperText={errors.subject?.message}
            placeholder={t('email_template.subject_placeholder')}
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('email_template.available_variables')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {AVAILABLE_VARIABLES.map((variable) => (
                <Chip
                  key={variable.key}
                  label={variable.key}
                  onClick={() => insertVariable(variable.key)}
                  size="small"
                  sx={{ mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          <TextField
            label={t('email_template.body')}
            fullWidth
            margin="normal"
            multiline
            rows={12}
            {...register('body', {
              required: t('email_template.body_required'),
            })}
            error={!!errors.body}
            helperText={errors.body?.message || t('email_template.body_helper')}
            placeholder={t('email_template.body_placeholder')}
          />

          <FormControlLabel
            control={<Checkbox {...register('isDefault')} defaultChecked={template?.isDefault || false} />}
            label={t('email_template.mark_default')}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending} startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}>
            {isPending ? t('common.saving') : isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmailTemplateDialog;
