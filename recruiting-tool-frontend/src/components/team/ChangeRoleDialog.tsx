import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormErrorSummary from "../common/FormErrorSummary";
import { UserRoles } from "../../types/user.types";

interface ChangeRoleDialogProps {
  open: boolean;
  onClose: () => void;
  memberName: string;
  memberUid: string;
  currentRoles: string[];
  onConfirm: (memberUid: string, roles: UserRoles[]) => void;
  isPending?: boolean;
}

interface ChangeRoleFormData {
  role: UserRoles;
}

const ASSIGNABLE_ROLES: UserRoles[] = [
  UserRoles.HR,
  UserRoles.HR_MANAGER,
  UserRoles.RECRUITER,
  UserRoles.COMPANY_ADMIN,
];

const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({
  open,
  onClose,
  memberName,
  memberUid,
  currentRoles,
  onConfirm,
  isPending = false,
}) => {
  const { t } = useTranslation();

  const primaryRole = (currentRoles?.[0] as UserRoles) || UserRoles.HR;

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ChangeRoleFormData>({
    defaultValues: {
      role: ASSIGNABLE_ROLES.includes(primaryRole) ? primaryRole : UserRoles.HR,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: ChangeRoleFormData) => {
    onConfirm(memberUid, [data.role]);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("team.change_role_title", { name: memberName })}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormErrorSummary errors={errors} />

          <Controller
            name="role"
            control={control}
            rules={{ required: t("validation.required") }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t("team.role_label")}
                fullWidth
                margin="normal"
                error={!!errors.role}
                helperText={errors.role?.message || t("team.role_helper")}
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {t(`team.roles.${role}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangeRoleDialog;
