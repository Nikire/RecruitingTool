import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useValidationRules } from '../../utils/validation';
import FormErrorSummary from '../common/FormErrorSummary';
import { RolesType } from '../../types/invitations';
import { useCreateInvitation } from '../../hooks/useInvitations';

interface InviteTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  companyUid: string;
}

interface InvitationFormData {
  email: string;
  role: RolesType;
}

const InviteTeamMemberDialog: React.FC<InviteTeamMemberDialogProps> = ({
  open,
  onClose,
  companyUid,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InvitationFormData>({
    defaultValues: {
      email: '',
      role: RolesType.HR,
    },
  });

  const { mutate: createInvitation, isPending } = useCreateInvitation(companyUid);

  const onSubmit = (data: InvitationFormData) => {
    createInvitation(data, {
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

  // Available roles for invitation (excluding super admin and user)
  const invitableRoles = [
    RolesType.HR,
    RolesType.HR_MANAGER,
    RolesType.RECRUITER,
    RolesType.COMPANY_ADMIN,
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('team.invite_member_title')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormErrorSummary errors={errors} />

          <TextField
            label={t('team.email_label')}
            type="email"
            fullWidth
            margin="normal"
            {...register('email', validationRules.email())}
            error={!!errors.email}
            helperText={errors.email?.message || t('team.email_helper')}
          />

          <Controller
            name="role"
            control={control}
            rules={{
              required: t('validation.required'),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('team.role_label')}
                fullWidth
                margin="normal"
                error={!!errors.role}
                helperText={errors.role?.message || t('team.role_helper')}
              >
                {invitableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {t(`roles.${role.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? t('common.sending') : t('team.send_invitation')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteTeamMemberDialog;
