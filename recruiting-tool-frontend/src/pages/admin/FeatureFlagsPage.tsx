import React from "react";
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { FlagOutlined as FlagIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";
import {
  useFeatureFlags,
  useToggleFeatureFlag,
} from "../../hooks/api/useFeatureFlags";
import type { FeatureFlagRecord } from "../../types/featureFlags.types";
import PageHeader from "../../components/common/PageHeader";
import AccessDeniedMessage from "../../components/common/AccessDeniedMessage";

// Plan column configuration — order and colour matches PlanLimitsPage
const PLAN_ORDER = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"] as const;
type PlanType = (typeof PLAN_ORDER)[number];

const PLAN_COLORS: Record<
  PlanType,
  { main: string; light: string; contrastText: string }
> = {
  FREE: { main: "#757575", light: "#f5f5f5", contrastText: "#fff" },
  STARTER: { main: "#1976d2", light: "#e3f2fd", contrastText: "#fff" },
  PROFESSIONAL: { main: "#7b1fa2", light: "#f3e5f5", contrastText: "#fff" },
  ENTERPRISE: { main: "#f57f17", light: "#fff8e1", contrastText: "#fff" },
};

// Feature keys in display order
const FEATURE_KEYS = [
  "ai_screening",
  "bulk_import",
  "advanced_analytics",
  "custom_branding",
  "api_access",
  "priority_support",
] as const;
type FeatureKey = (typeof FEATURE_KEYS)[number];

// Map feature key to i18n translation key
function featureI18nKey(key: FeatureKey): string {
  return `feature_flags.${key}`;
}

// Build a lookup: featureKey -> planType -> FeatureFlagRecord
type FlagMatrix = Partial<
  Record<FeatureKey, Partial<Record<PlanType, FeatureFlagRecord>>>
>;

function buildMatrix(flags: FeatureFlagRecord[]): FlagMatrix {
  const matrix: FlagMatrix = {};
  for (const flag of flags) {
    const key = flag.key as FeatureKey;
    const plan = flag.planType as PlanType;
    if (!matrix[key]) {
      matrix[key] = {};
    }
    matrix[key]![plan] = flag;
  }
  return matrix;
}

// Loading skeleton — same dimensions as the real table
const LoadingSkeleton: React.FC = () => (
  <TableContainer component={Paper} elevation={2}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <Skeleton width={120} />
          </TableCell>
          {PLAN_ORDER.map((plan) => (
            <TableCell key={plan} align="center">
              <Skeleton width={80} sx={{ mx: "auto" }} />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {FEATURE_KEYS.map((key) => (
          <TableRow key={key}>
            <TableCell>
              <Skeleton width={140} />
              <Skeleton width={80} height={20} sx={{ mt: 0.5 }} />
            </TableCell>
            {PLAN_ORDER.map((plan) => (
              <TableCell key={plan} align="center">
                <Skeleton
                  variant="rectangular"
                  width={36}
                  height={20}
                  sx={{ mx: "auto", borderRadius: 10 }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

/**
 * FeatureFlagsPage — Manage feature flags per plan tier (SUPER_ADMIN only)
 *
 * Renders a matrix table: rows = feature keys, columns = plan tiers.
 * Each cell contains a Switch; toggling saves immediately via PATCH.
 */
const FeatureFlagsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  const { data: flags, isLoading, isError } = useFeatureFlags();
  const toggleFlag = useToggleFeatureFlag();

  // Permission check — SUPER_ADMIN only
  const isSuperAdmin = user?.roles?.includes(UserRoles.SUPER_ADMIN);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;
  }

  const handleToggle = (flag: FeatureFlagRecord) => {
    toggleFlag.mutate({ uid: flag.uid, dto: { enabled: !flag.enabled } });
  };

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <PageHeader
          title="feature_flags.title"
          subtitle="feature_flags.subtitle"
        />
        <LoadingSkeleton />
      </Box>
    );
  }

  // Error state
  if (isError || !flags) {
    return (
      <Box>
        <PageHeader
          title="feature_flags.title"
          subtitle="feature_flags.subtitle"
        />
        <Typography color="error">{t("feature_flags.load_error")}</Typography>
      </Box>
    );
  }

  const matrix = buildMatrix(flags);

  return (
    <Box>
      <PageHeader
        title="feature_flags.title"
        subtitle="feature_flags.subtitle"
      />

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Feature column header */}
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FlagIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <span>{t("feature_flags.feature_column")}</span>
                </Box>
              </TableCell>

              {/* Plan column headers */}
              {PLAN_ORDER.map((plan) => {
                const color = PLAN_COLORS[plan];
                return (
                  <TableCell key={plan} align="center" sx={{ minWidth: 120 }}>
                    <Chip
                      label={plan}
                      size="small"
                      sx={{
                        backgroundColor: color.main,
                        color: color.contrastText,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        px: 0.5,
                      }}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {FEATURE_KEYS.map((featureKey) => (
              <TableRow
                key={featureKey}
                sx={{
                  "&:hover": { backgroundColor: "action.hover" },
                  transition: "background-color 0.15s",
                }}
              >
                {/* Feature label cell */}
                <TableCell>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                    {t(featureI18nKey(featureKey))}
                  </Typography>
                  <Chip
                    label={featureKey}
                    variant="filled"
                    size="small"
                    sx={{
                      mt: 0.5,
                      fontSize: "0.7rem",
                      height: 20,
                      fontFamily: "monospace",
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  />
                </TableCell>

                {/* Switch cells per plan */}
                {PLAN_ORDER.map((plan) => {
                  const flag = matrix[featureKey]?.[plan];
                  const color = PLAN_COLORS[plan];

                  if (!flag) {
                    // Flag record doesn't exist for this feature+plan combination
                    return (
                      <TableCell key={plan} align="center">
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      </TableCell>
                    );
                  }

                  const updatedLabel = new Date(
                    flag.updatedAt,
                  ).toLocaleString();

                  return (
                    <TableCell key={plan} align="center">
                      <Tooltip
                        title={`${t("feature_flags.last_updated")}: ${updatedLabel}`}
                        placement="top"
                      >
                        <Switch
                          checked={flag.enabled}
                          onChange={() => handleToggle(flag)}
                          disabled={toggleFlag.isPending}
                          size="small"
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: color.main,
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: color.main,
                              },
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FeatureFlagsPage;
