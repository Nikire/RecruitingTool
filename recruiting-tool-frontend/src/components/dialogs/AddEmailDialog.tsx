import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Email as EmailIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAddEmail } from "../../hooks/api/useAuth";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

interface AddEmailDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  email: string;
}

const AddEmailDialog: React.FC<AddEmailDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { mutate: addEmail, isPending } = useAddEmail();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ defaultValues: { email: "" } });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormValues) => {
    addEmail(
      { email: data.email },
      {
        onSuccess: () => {
          showSuccessToast(t("auth.add_email_success"));
          handleClose();
        },
        onError: (error) => {
          showErrorToast(error, t("auth.add_email_error"));
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("auth.add_email_dialog_title")}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {t("auth.add_email_dialog_description")}
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          label={t("auth.add_email_label")}
          type="email"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          {...register("email", {
            required: t("validation.email_required"),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("validation.email_invalid"),
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending ? t("common.saving") : t("auth.add_email_action")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmailDialog;
