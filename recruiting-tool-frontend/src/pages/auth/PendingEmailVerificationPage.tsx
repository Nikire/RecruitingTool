import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { authKeys } from "../../api/queryKeys";
import { getCurrentUser } from "../../api/auth";
import { User } from "../../types/user.types";
import { getDefaultDashboard } from "../../utils/permissions";

// How often the gate re-checks /auth/me while the user verifies on another
// tab or device.
const VERIFICATION_POLL_INTERVAL_MS = 10_000;

const PendingEmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const logout = useLogout();
  const navigate = useNavigate();
  const [resendStatus, setResendStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [checkStatus, setCheckStatus] = useState<"idle" | "not_verified">(
    "idle",
  );

  const { mutate: resend, isPending } = useResendVerification();

  // useAuthMe caches /auth/me for 5 minutes and the global client does not
  // refetch on focus, so nothing would notice the verification without a hard
  // reload. This observer shares the same cache entry but polls and refetches
  // on focus so the gate lifts itself.
  const hasToken = !!localStorage.getItem("authToken");
  const {
    data: freshUser,
    refetch: recheckVerification,
    isFetching: isChecking,
  } = useQuery<User>({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: 0,
    refetchInterval: VERIFICATION_POLL_INTERVAL_MS,
    refetchOnWindowFocus: "always",
  });

  useEffect(() => {
    if (freshUser?.emailVerified) {
      navigate(getDefaultDashboard(freshUser), { replace: true });
    }
  }, [freshUser, navigate]);

  const handleCheckVerification = async () => {
    setCheckStatus("idle");
    const result = await recheckVerification();
    if (result.data && !result.data.emailVerified) {
      setCheckStatus("not_verified");
    }
  };

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
        // Rendered inside MainLayout: subtract the navbar spacer (64/70px)
        // and the Container's vertical padding (2 * 16px) so the card is
        // centred in the visible area without forcing a scrollbar.
        minHeight: { xs: "calc(100vh - 96px)", sm: "calc(100vh - 102px)" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
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

        {checkStatus === "not_verified" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "warning.main",
            }}
          >
            <ErrorOutlineIcon fontSize="small" />
            <Typography variant="body2">
              {t("verify_email.not_verified_yet")}
            </Typography>
          </Box>
        )}

        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={handleCheckVerification}
          disabled={isChecking}
          startIcon={
            isChecking ? (
              <CircularProgress size={18} color="inherit" />
            ) : undefined
          }
        >
          {isChecking
            ? t("verify_email.checking_status")
            : t("verify_email.check_status_button")}
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ fontStyle: "italic" }}
        >
          {t("verify_email.auto_check_hint")}
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
