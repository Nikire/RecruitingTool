import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Skeleton,
  Chip,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  WorkOutline as JobIcon,
  PeopleOutline as CandidatesIcon,
  GroupOutlined as UsersIcon,
  StorageOutlined as StorageIcon,
  Psychology as AiIcon,
  AutoAwesome as AiCreditsIcon,
  EmailOutlined as EmailIcon,
  BarChart as AnalyticsIcon,
  AccessTime as ClockIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";
import {
  useAdminPlanLimits,
  useUpdatePlanLimit,
} from "../../hooks/api/useAdminPlanLimits";
import type {
  PlanLimitRecord,
  UpdatePlanLimitDto,
} from "../../types/planLimits.types";
import PageHeader from "../../components/common/PageHeader";
import AccessDeniedMessage from "../../components/common/AccessDeniedMessage";

// Plan color configuration
const PLAN_COLORS: Record<
  string,
  { main: string; light: string; contrastText: string }
> = {
  FREE: { main: "#757575", light: "#f5f5f5", contrastText: "#fff" },
  STARTER: { main: "#1976d2", light: "#e3f2fd", contrastText: "#fff" },
  PROFESSIONAL: { main: "#7b1fa2", light: "#f3e5f5", contrastText: "#fff" },
  ENTERPRISE: { main: "#f57f17", light: "#fff8e1", contrastText: "#fff" },
};

const DEFAULT_COLOR = {
  main: "#9e9e9e",
  light: "#fafafa",
  contrastText: "#fff",
};

function getPlanColor(planType: string) {
  return PLAN_COLORS[planType] ?? DEFAULT_COLOR;
}

// Inline editable numeric field
interface EditableNumberFieldProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  onSave: (newValue: number) => void;
  disabled?: boolean;
}

const EditableNumberField: React.FC<EditableNumberFieldProps> = ({
  label,
  value,
  icon,
  onSave,
  disabled = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));

  const handleBlur = useCallback(() => {
    setEditing(false);
    const parsed = parseInt(localValue, 10);
    if (!isNaN(parsed) && parsed !== value) {
      onSave(parsed);
    } else {
      setLocalValue(String(value));
    }
  }, [localValue, onSave, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      } else if (e.key === "Escape") {
        setLocalValue(String(value));
        setEditing(false);
      }
    },
    [value],
  );

  const handleFocus = useCallback(() => {
    setEditing(true);
  }, []);

  React.useEffect(() => {
    if (!editing) {
      setLocalValue(String(value));
    }
  }, [value, editing]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <TextField
          variant="standard"
          size="small"
          value={localValue}
          disabled={disabled}
          type="number"
          inputProps={{ min: -1, step: 1 }}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          sx={{
            "& .MuiInput-root": {
              fontSize: "1rem",
              fontWeight: 600,
            },
            "& .MuiInput-root::before": {
              borderBottom: editing ? undefined : "1px dashed rgba(0,0,0,0.2)",
            },
          }}
        />
      </Box>
    </Box>
  );
};

// Single plan card
interface PlanCardProps {
  record: PlanLimitRecord;
  onUpdate: (uid: string, dto: UpdatePlanLimitDto) => void;
  isUpdating: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  record,
  onUpdate,
  isUpdating,
}) => {
  const { t } = useTranslation();
  const color = getPlanColor(record.planType);

  const handleNumericSave = useCallback(
    (field: keyof UpdatePlanLimitDto, newValue: number) => {
      onUpdate(record.uid, { [field]: newValue });
    },
    [onUpdate, record.uid],
  );

  const handleToggle = useCallback(
    (
      field: "aiScoringEnabled" | "emailTemplatesEnabled" | "analyticsEnabled",
    ) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(record.uid, { [field]: event.target.checked });
      },
    [onUpdate, record.uid],
  );

  const formattedDate = new Date(record.updatedAt).toLocaleString();

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderTop: `4px solid ${color.main}`,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={record.planType}
              size="small"
              sx={{
                backgroundColor: color.main,
                color: color.contrastText,
                fontWeight: 700,
                fontSize: "0.85rem",
                px: 0.5,
              }}
            />
          </Box>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ flex: 1, pt: 2 }}>
        <Stack spacing={2.5}>
          {/* Numeric limits */}
          <EditableNumberField
            label={t("plan_limits.max_job_positions")}
            value={record.maxJobPositions}
            icon={<JobIcon fontSize="small" />}
            onSave={(v) => handleNumericSave("maxJobPositions", v)}
            disabled={isUpdating}
          />
          <EditableNumberField
            label={t("plan_limits.max_candidates_per_position")}
            value={record.maxCandidatesPerPosition}
            icon={<CandidatesIcon fontSize="small" />}
            onSave={(v) => handleNumericSave("maxCandidatesPerPosition", v)}
            disabled={isUpdating}
          />
          <EditableNumberField
            label={t("plan_limits.max_users")}
            value={record.maxUsers}
            icon={<UsersIcon fontSize="small" />}
            onSave={(v) => handleNumericSave("maxUsers", v)}
            disabled={isUpdating}
          />
          <EditableNumberField
            label={t("plan_limits.max_storage_mb")}
            value={record.maxStorageMB}
            icon={<StorageIcon fontSize="small" />}
            onSave={(v) => handleNumericSave("maxStorageMB", v)}
            disabled={isUpdating}
          />
          <EditableNumberField
            label={t("plan_limits.ai_credits_per_month")}
            value={record.aiScoringCreditsPerMonth}
            icon={<AiCreditsIcon fontSize="small" />}
            onSave={(v) => handleNumericSave("aiScoringCreditsPerMonth", v)}
            disabled={isUpdating}
          />

          <Divider />

          {/* Boolean toggles */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={record.aiScoringEnabled}
                  onChange={handleToggle("aiScoringEnabled")}
                  disabled={isUpdating}
                  color="secondary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <AiIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2">
                    {t("plan_limits.ai_scoring_enabled")}
                  </Typography>
                </Box>
              }
            />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={record.emailTemplatesEnabled}
                  onChange={handleToggle("emailTemplatesEnabled")}
                  disabled={isUpdating}
                  color="secondary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <EmailIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    {t("plan_limits.email_templates_enabled")}
                  </Typography>
                </Box>
              }
            />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={record.analyticsEnabled}
                  onChange={handleToggle("analyticsEnabled")}
                  disabled={isUpdating}
                  color="secondary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <AnalyticsIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    {t("plan_limits.analytics_enabled")}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Stack>
      </CardContent>

      {/* Last updated footer */}
      <Box
        sx={{
          px: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          borderTop: "1px solid",
          borderColor: "divider",
          mt: "auto",
        }}
      >
        <Tooltip title={formattedDate}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ClockIcon sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled">
              {t("plan_limits.last_updated")}: {formattedDate}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Card>
  );
};

/**
 * PlanLimitsPage — Manage plan limits for each subscription tier (SUPER_ADMIN only)
 */
const PlanLimitsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  const { data: planLimits, isLoading, isError } = useAdminPlanLimits();
  const updatePlanLimit = useUpdatePlanLimit();

  const isSuperAdmin = user?.roles?.includes(UserRoles.SUPER_ADMIN);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;
  }

  const handleUpdate = (uid: string, dto: UpdatePlanLimitDto) => {
    updatePlanLimit.mutate({ uid, dto });
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="plan_limits.title" subtitle="plan_limits.subtitle" />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton
                variant="rectangular"
                height={420}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError || !planLimits) {
    return (
      <Box>
        <PageHeader title="plan_limits.title" subtitle="plan_limits.subtitle" />
        <Typography color="error">{t("plan_limits.load_error")}</Typography>
      </Box>
    );
  }

  const PLAN_ORDER = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];
  const sortedPlans = [...planLimits].sort(
    (a, b) => PLAN_ORDER.indexOf(a.planType) - PLAN_ORDER.indexOf(b.planType),
  );

  return (
    <Box>
      <PageHeader title="plan_limits.title" subtitle="plan_limits.subtitle" />

      <Grid container spacing={3}>
        {sortedPlans.map((record) => (
          <Grid key={record.uid} size={{ xs: 12, sm: 6, lg: 3 }}>
            <PlanCard
              record={record}
              onUpdate={handleUpdate}
              isUpdating={updatePlanLimit.isPending}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlanLimitsPage;
