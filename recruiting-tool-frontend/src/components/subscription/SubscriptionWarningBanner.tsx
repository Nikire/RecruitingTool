import React, { useMemo } from "react";
import { Alert, AlertTitle, Button, Box, Typography } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Subscription,
  SubscriptionStatus,
} from "../../types/subscription.types";

interface SubscriptionWarningBannerProps {
  subscription: Subscription;
}

/**
 * Warning banner shown when subscription is PAST_DUE
 * Displays remaining days in grace period and link to billing page
 */
const SubscriptionWarningBanner: React.FC<SubscriptionWarningBannerProps> = ({
  subscription,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Calculate days remaining in grace period
  const daysRemaining = useMemo(() => {
    if (!subscription.gracePeriodEndsAt) return null;

    const now = new Date();
    const gracePeriodEnd = new Date(subscription.gracePeriodEndsAt);
    const diffTime = gracePeriodEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [subscription.gracePeriodEndsAt]);

  // Don't show banner if subscription is not PAST_DUE
  if (subscription.status !== SubscriptionStatus.PAST_DUE) {
    return null;
  }

  // Don't show if no grace period set
  if (!subscription.gracePeriodEndsAt || daysRemaining === null) {
    return null;
  }

  // Determine severity based on days remaining
  const severity = daysRemaining <= 1 ? "error" : "warning";

  return (
    <Alert
      severity={severity}
      icon={<WarningIcon />}
      sx={{
        mb: 3,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <AlertTitle sx={{ mb: 1 }}>
            {t("subscription.warning_banner.title")}
          </AlertTitle>
          <Typography variant="body2">
            {daysRemaining === 0
              ? t("subscription.warning_banner.expires_today")
              : daysRemaining === 1
                ? t("subscription.warning_banner.expires_tomorrow")
                : t("subscription.warning_banner.expires_in_days", {
                    days: daysRemaining,
                  })}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {t("subscription.warning_banner.update_payment_prompt")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color={severity === "error" ? "error" : "warning"}
          onClick={() => navigate("/billing")}
          sx={{ flexShrink: 0 }}
        >
          {t("subscription.warning_banner.update_payment_button")}
        </Button>
      </Box>
    </Alert>
  );
};

export default SubscriptionWarningBanner;
