import { Box, LinearProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuota } from "../../api/subscription";
import { getQuotaByResource } from "../../types/subscription.types";

interface QuotaBannerProps {
  resource: string;
  labelKey: string;
  unit?: string;
  precision?: number;
}

const QuotaBanner: React.FC<QuotaBannerProps> = ({
  resource,
  labelKey,
  unit = "",
  precision = 0,
}) => {
  const { t } = useTranslation();
  const { data: quotaData } = useQuota();
  const quota = quotaData
    ? getQuotaByResource(quotaData.quotas, resource)
    : undefined;

  if (!quota) return null;

  const isUnlimited = quota.limit < 0;
  const percentage = isUnlimited ? 0 : Math.min(quota.percentageUsed, 100);
  const color =
    isUnlimited || quota.percentageUsed < 70
      ? "success"
      : quota.percentageUsed < 90
        ? "warning"
        : "error";

  const fmt = (n: number) => n.toFixed(precision);
  const label = t(labelKey);
  const usageText = isUnlimited
    ? t("quota_banner.unlimited", { used: fmt(quota.used), unit, label })
    : t("quota_banner.used_of", {
        used: fmt(quota.used),
        limit: fmt(quota.limit),
        unit,
        label,
      });

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: quota.isExceeded ? "error.main" : "divider",
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color as "success" | "warning" | "error"}
        sx={{ mb: 1, height: 8, borderRadius: 4 }}
      />
      <Typography variant="body2" color="text.secondary">
        {usageText}
      </Typography>
    </Box>
  );
};

export default QuotaBanner;
