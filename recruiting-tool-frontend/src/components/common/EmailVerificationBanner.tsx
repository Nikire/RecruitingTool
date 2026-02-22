import { useState } from "react";
import { Alert, AlertTitle, Button, Typography } from "@mui/material";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { useTranslation } from "react-i18next";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { useResendVerification } from "../../hooks/api/useAuth";
import toast from "react-hot-toast";

/**
 * EmailVerificationBanner — displays a warning banner when the authenticated
 * user has not yet verified their email address. Provides a button to resend
 * the verification email.
 *
 * Only renders when the user is logged in AND emailVerified is false.
 */
const EmailVerificationBanner: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [dismissed, setDismissed] = useState(false);

  const { mutate: doResend, isPending } = useResendVerification();

  // Do not show banner if user is not logged in, email is verified, or banner was dismissed
  if (!user || user.emailVerified === true || dismissed) {
    return null;
  }

  const handleResend = () => {
    doResend(undefined, {
      onSuccess: () => {
        toast.success(t("email_verification.resend_success"));
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? t("email_verification.resend_error");
        toast.error(message);
      },
    });
  };

  return (
    <Alert
      severity="warning"
      icon={<MarkEmailUnreadIcon />}
      onClose={() => setDismissed(true)}
      sx={{ mb: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={handleResend}
          disabled={isPending}
        >
          {isPending
            ? t("email_verification.resending")
            : t("email_verification.resend_button")}
        </Button>
      }
    >
      <AlertTitle>{t("email_verification.banner_title")}</AlertTitle>
      <Typography variant="body2">
        {t("email_verification.banner_message")}
      </Typography>
    </Alert>
  );
};

export default EmailVerificationBanner;
