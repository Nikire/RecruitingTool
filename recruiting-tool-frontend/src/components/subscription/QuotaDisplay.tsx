import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import {
  QuotaStatus,
  getQuotaByResource,
  isFeatureEnabled,
} from "../../types/subscription.types";

interface QuotaDisplayProps {
  quotaStatus: QuotaStatus;
  onUpgrade?: () => void;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  quotaStatus,
  onUpgrade,
}) => {
  const { t } = useTranslation();

  const getUsageColor = (
    percentage: number,
  ): "success" | "warning" | "error" => {
    if (percentage < 70) return "success";
    if (percentage < 90) return "warning";
    return "error";
  };

  const formatLimit = (limit: number): string => {
    if (limit === -1) return t("subscription.quota.unlimited");
    return String(limit);
  };

  const formatStorageSize = (mb: number): string => {
    if (mb === -1) return t("subscription.quota.unlimited");
    if (mb >= 1000) {
      return `${Math.round(mb / 1000)} GB`;
    }
    return `${Math.round(mb)} MB`;
  };

  // Get quota data with safe defaults
  const usersQuota = getQuotaByResource(quotaStatus.quotas, "users");
  const jobPositionsQuota = getQuotaByResource(
    quotaStatus.quotas,
    "jobPositions",
  );
  const candidatesPerPositionQuota = getQuotaByResource(
    quotaStatus.quotas,
    "candidatesPerPosition",
  );
  const storageQuota = getQuotaByResource(quotaStatus.quotas, "storage");
  const aiCreditsQuota = getQuotaByResource(
    quotaStatus.quotas,
    "aiScoringCredits",
  );

  const isApproachingLimit =
    (usersQuota?.percentageUsed ?? 0) >= 80 ||
    (jobPositionsQuota?.percentageUsed ?? 0) >= 80 ||
    (storageQuota?.percentageUsed ?? 0) >= 80 ||
    (aiCreditsQuota?.percentageUsed ?? 0) >= 80;

  // Feature flags
  const features = [
    {
      key: "emailTemplates",
      label: t("subscription.features.email_templates"),
    },
    { key: "analytics", label: t("subscription.features.analytics") },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("subscription.quota.title")}
        </Typography>

        {isApproachingLimit && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              onUpgrade && (
                <Chip
                  label={t("subscription.quota.upgrade_now")}
                  onClick={onUpgrade}
                  color="warning"
                  size="small"
                  clickable
                />
              )
            }
          >
            {t("subscription.quota.approaching_limit")}
          </Alert>
        )}

        {/* Users Quota */}
        {usersQuota && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2">
                {t("subscription.quota.users")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {usersQuota.used} / {formatLimit(usersQuota.limit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={usersQuota.limit === -1 ? 0 : usersQuota.percentageUsed}
              color={getUsageColor(usersQuota.percentageUsed)}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Job Positions Quota */}
        {jobPositionsQuota && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2">
                {t("subscription.quota.job_positions")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {jobPositionsQuota.used} /{" "}
                {formatLimit(jobPositionsQuota.limit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                jobPositionsQuota.limit === -1
                  ? 0
                  : jobPositionsQuota.percentageUsed
              }
              color={getUsageColor(jobPositionsQuota.percentageUsed)}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Candidates per Position Quota */}
        {candidatesPerPositionQuota && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2">
                {t("subscription.quota.candidates_per_position")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("subscription.quota.per_position_limit", {
                  limit: formatLimit(candidatesPerPositionQuota.limit),
                })}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={0}
              color="success"
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Storage Quota */}
        {storageQuota && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2">
                {t("subscription.quota.storage")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatStorageSize(storageQuota.used)} /{" "}
                {formatStorageSize(storageQuota.limit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                storageQuota.limit === -1 ? 0 : storageQuota.percentageUsed
              }
              color={getUsageColor(storageQuota.percentageUsed)}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* AI Scoring Credits */}
        {aiCreditsQuota && aiCreditsQuota.limit !== 0 && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2">
                {t("subscription.quota.ai_scoring_credits")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {aiCreditsQuota.used} / {formatLimit(aiCreditsQuota.limit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                aiCreditsQuota.limit === -1 ? 0 : aiCreditsQuota.percentageUsed
              }
              color={getUsageColor(aiCreditsQuota.percentageUsed)}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" gutterBottom>
          {t("subscription.quota.features")}
        </Typography>
        <List dense>
          {features.map(({ key, label }) => {
            const enabled = isFeatureEnabled(quotaStatus.features, key);
            return (
              <ListItem key={key} disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {enabled ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <CancelIcon color="disabled" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default QuotaDisplay;
