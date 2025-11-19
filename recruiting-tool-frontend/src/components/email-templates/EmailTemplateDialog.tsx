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
} from '@mui/material';
import { useForm } from 'react-hook-form';
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

const AVAILABLE_VARIABLES = [
  { key: '{{candidateName}}', description: 'Candidate name' },
  { key: '{{positionTitle}}', description: 'Position title' },
  { key: '{{companyName}}', description: 'Company name' },
  { key: '{{hrName}}', description: 'HR recruiter name' },
  { key: '{{interviewDate}}', description: 'Interview date' },
  { key: '{{interviewTime}}', description: 'Interview time' },
];

const EmailTemplateDialog: React.FC<EmailTemplateDialogProps> = ({ open, onClose, template }) => {
  const { user } = useUserAtom();
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
      <DialogTitle>{isEditMode ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label="Template Name"
            fullWidth
            margin="normal"
            {...register('name', {
              required: 'Template name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters',
              },
              maxLength: {
                value: 200,
                message: 'Name must be less than 200 characters',
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
            placeholder="e.g., Interview Invitation"
          />

          <TextField
            label="Subject"
            fullWidth
            margin="normal"
            {...register('subject', {
              required: 'Subject is required',
              minLength: {
                value: 3,
                message: 'Subject must be at least 3 characters',
              },
              maxLength: {
                value: 500,
                message: 'Subject must be less than 500 characters',
              },
            })}
            error={!!errors.subject}
            helperText={errors.subject?.message}
            placeholder="e.g., Interview Invitation - {{positionTitle}}"
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Available Variables (click to insert):
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
            label="Body"
            fullWidth
            margin="normal"
            multiline
            rows={12}
            {...register('body', {
              required: 'Body is required',
            })}
            error={!!errors.body}
            helperText={errors.body?.message || 'Use variables above for personalization'}
            placeholder="Dear {{candidateName}},&#10;&#10;Thank you for applying to the {{positionTitle}} position at {{companyName}}..."
          />

          <FormControlLabel
            control={<Checkbox {...register('isDefault')} defaultChecked={template?.isDefault || false} />}
            label="Mark as default template"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmailTemplateDialog;
