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
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {
  useRequestEmailChange,
  useConfirmEmailChange,
} from "../../hooks/api/useAuth";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

interface ChangeEmailDialogProps {
  open: boolean;
  onClose: () => void;
}

const ChangeEmailDialog: React.FC<ChangeEmailDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");

  const { mutate: requestChange, isPending: isRequesting } =
    useRequestEmailChange();
  const { mutate: confirmChange, isPending: isConfirming } =
    useConfirmEmailChange();

  const handleClose = () => {
    setStep(1);
    setNewEmail("");
    setCode("");
    onClose();
  };

  const handleSendCode = () => {
    requestChange(
      { newEmail },
      {
        onSuccess: () => {
          showSuccessToast(t("auth.change_email_code_sent"));
          setStep(2);
        },
        onError: (error) => {
          showErrorToast(error, t("auth.add_email_error"));
        },
      },
    );
  };

  const handleConfirm = () => {
    confirmChange(
      { code },
      {
        onSuccess: () => {
          showSuccessToast(t("auth.change_email_success"));
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
          <EmailIcon color="primary" />
          {t("auth.change_email_title")}
        </Box>
      </DialogTitle>
      <DialogContent>
        {step === 1 ? (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("auth.change_email_step1_desc")}
            </Typography>
            <TextField
              fullWidth
              label={t("auth.change_email_new_email")}
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              variant="outlined"
              size="small"
              autoFocus
            />
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("auth.change_email_step2_desc")}
            </Typography>
            <TextField
              fullWidth
              label={t("auth.change_email_code")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              variant="outlined"
              size="small"
              autoFocus
              inputProps={{ maxLength: 6 }}
              placeholder="000000"
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
            disabled={!newEmail || isRequesting}
            startIcon={
              isRequesting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isRequesting
              ? t("common.submitting")
              : t("auth.change_email_send_code")}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!code || isConfirming}
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
              : t("auth.change_email_confirm")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangeEmailDialog;
