import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";
import { useResendVerification, useLogout } from "../../hooks/api/useAuth";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";

const PendingEmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const logout = useLogout();
  const [resendStatus, setResendStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const { mutate: resend, isPending } = useResendVerification();

  const handleResend = () => {
    setResendStatus("idle");
    resend(undefined, {
      onSuccess: () => setResendStatus("success"),
      onError: () => setResendStatus("error"),
    });
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 4, sm: 6 },
          maxWidth: 480,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          borderRadius: 2,
        }}
      >
        <MarkEmailUnreadIcon sx={{ fontSize: 64, color: "primary.main" }} />

        <Typography
          variant="h5"
          component="h1"
          fontWeight={600}
          textAlign="center"
        >
          {t("verify_email.title")}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ lineHeight: 1.7 }}
        >
          {t("verify_email.description", { email: user?.email ?? "" })}
        </Typography>

        {resendStatus === "success" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "success.main",
            }}
          >
            <CheckCircleOutlineIcon fontSize="small" />
            <Typography variant="body2">
              {t("verify_email.resend_success")}
            </Typography>
          </Box>
        )}

        {resendStatus === "error" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "error.main",
            }}
          >
            <ErrorOutlineIcon fontSize="small" />
            <Typography variant="body2">
              {t("verify_email.resend_error")}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleResend}
          disabled={isPending}
          startIcon={
            isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : undefined
          }
        >
          {isPending
            ? t("email_verification.resending")
            : t("verify_email.resend_button")}
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ fontStyle: "italic" }}
        >
          {t("verify_email.already_verified")}
        </Typography>

        <Button
          variant="text"
          color="inherit"
          size="small"
          onClick={handleLogout}
          sx={{ color: "text.secondary" }}
        >
          {t("verify_email.logout")}
        </Button>
      </Paper>
    </Box>
  );
};

export default PendingEmailVerificationPage;
