import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {
  useRequestPasswordChange,
  useConfirmPasswordChange,
} from "../../hooks/api/useAuth";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { mutate: requestChange, isPending: isRequesting } =
    useRequestPasswordChange();
  const { mutate: confirmChange, isPending: isConfirming } =
    useConfirmPasswordChange();

  const handleClose = () => {
    setStep(1);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    onClose();
  };

  const handleSendCode = () => {
    requestChange(undefined, {
      onSuccess: () => {
        showSuccessToast(t("auth.change_password_code_sent"));
        setStep(2);
      },
      onError: (error) => {
        showErrorToast(error, t("auth.add_email_error"));
      },
    });
  };

  const handleConfirm = () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError(t("auth.change_password_mismatch"));
      return;
    }
    confirmChange(
      { code, newPassword },
      {
        onSuccess: () => {
          showSuccessToast(t("auth.change_password_success"));
          handleClose();
        },
        onError: (error) => {
          showErrorToast(error, t("auth.add_email_error"));
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockIcon color="primary" />
          {t("auth.change_password_title")}
        </Box>
      </DialogTitle>
      <DialogContent>
        {step === 1 ? (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("auth.change_password_step1_desc")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t("auth.change_password_step2_desc")}
            </Typography>
            <TextField
              fullWidth
              label={t("auth.change_password_code")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              variant="outlined"
              size="small"
              autoFocus
              inputProps={{ maxLength: 6 }}
              placeholder="000000"
            />
            <TextField
              fullWidth
              label={t("auth.change_password_new")}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label={t("auth.change_password_confirm_label")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              size="small"
              error={!!passwordError}
              helperText={passwordError}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isRequesting || isConfirming}>
          {t("common.cancel")}
        </Button>
        {step === 1 ? (
          <Button
            variant="contained"
            onClick={handleSendCode}
            disabled={isRequesting}
            startIcon={
              isRequesting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isRequesting
              ? t("common.submitting")
              : t("auth.change_password_send_code")}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!code || !newPassword || !confirmPassword || isConfirming}
            startIcon={
              isConfirming ? (
                <CircularProgress size={16} />
              ) : (
                <VerifiedUserIcon />
              )
            }
          >
            {isConfirming
              ? t("common.submitting")
              : t("auth.change_password_confirm_btn")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
