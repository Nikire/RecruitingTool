import {
  Box,
  Typography,
  Grid,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Skeleton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Email as EmailIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Backup as BackupIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  SettingsCard,
  StatusIndicator,
  TestConnectionButton,
  AIConfigCard,
  AIScoringWeightsCard,
} from "../../components/settings";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";
import { Navigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import AccessDeniedMessage from "../../components/common/AccessDeniedMessage";
import {
  useSystemSettings,
  useUpdateSystemSettings,
  useTestEmailConnection,
} from "../../hooks/api/useSystemSettings";

/**
 * SystemSettingsPage - System configuration and health monitoring (SUPER_ADMIN only)
 *
 * @description
 * Comprehensive system settings page displaying real configuration from the backend:
 * - Email configuration (SMTP host, port, sender, application emails toggle)
 * - AI settings (model, tier)
 * - Storage configuration (type, bucket)
 * - Rate limiting details
 * - Backup configuration
 * - Application info (environment, version)
 *
 * @access SUPER_ADMIN only
 */

const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  const { data: settings, isLoading, isError } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();
  const testEmail = useTestEmailConnection();

  // Permission check - SUPER_ADMIN only
  const isSuperAdmin = user?.roles?.includes(UserRoles.SUPER_ADMIN);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;
  }

  const handleToggleApplicationEmails = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateSettings.mutate({ applicationEmailsEnabled: event.target.checked });
  };

  const handleTestEmail = () => {
    testEmail.mutate();
  };

  // Loading skeleton while fetching settings
  if (isLoading) {
    return (
      <Box>
        <PageHeader
          title={t("settings.system_settings_title")}
          subtitle={t("settings.system_settings_subtitle")}
        />
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Error state
  if (isError || !settings) {
    return (
      <Box>
        <PageHeader
          title={t("settings.system_settings_title")}
          subtitle={t("settings.system_settings_subtitle")}
        />
        <Typography color="error">{t("settings.load_error")}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={t("settings.system_settings_title")}
        subtitle={t("settings.system_settings_subtitle")}
      />

      <Grid container spacing={3}>
        {/* Email Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsCard
            icon={<EmailIcon />}
            title={t("settings.email_configuration")}
            iconColor="info.main"
            action={
              <TestConnectionButton
                onTest={handleTestEmail}
                isLoading={testEmail.isPending}
                disabled={!settings.email.enabled}
              />
            }
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("settings.smtp_status")}
                </Typography>
                <StatusIndicator
                  status={settings.email.enabled ? "ok" : "error"}
                  label={
                    settings.email.enabled
                      ? "settings.status_configured"
                      : "settings.status_not_configured"
                  }
                />
              </Box>

              {settings.email.enabled && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.smtp_host")}
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {settings.email.host}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.smtp_port")}
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {settings.email.port}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.smtp_sender")}
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {settings.email.from}
                    </Typography>
                  </Box>
                </>
              )}

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.applicationEmailsEnabled}
                      onChange={handleToggleApplicationEmails}
                      disabled={
                        updateSettings.isPending || !settings.email.enabled
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t("settings.application_emails_enabled")}
                    </Typography>
                  }
                />
              </Box>
            </Stack>
          </SettingsCard>
        </Grid>

        {/* AI Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AIConfigCard aiSettings={settings.ai} isLoading={false} />
        </Grid>

        {/* AI Scoring Weights */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AIScoringWeightsCard />
        </Grid>

        {/* Storage Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsCard
            icon={<StorageIcon />}
            title={t("settings.storage_configuration")}
            iconColor="warning.main"
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("settings.storage_type")}
                </Typography>
                <Chip
                  label={settings.storage.type || t("common.n_a")}
                  size="small"
                  color="warning"
                  sx={{ fontFamily: "monospace" }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.storage_bucket")}
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {settings.storage.bucket || t("common.n_a")}
                </Typography>
              </Box>
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Rate Limiting */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsCard
            icon={<SpeedIcon />}
            title={t("settings.rate_limiting")}
            iconColor="error.main"
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("settings.rate_limit_general")}
                </Typography>
                <Typography variant="body1">
                  {settings.rateLimiting.general.limit}{" "}
                  {t("settings.requests_per_window")}{" "}
                  {Math.round(settings.rateLimiting.general.ttl / 1000)}
                  {t("settings.seconds")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.rate_limit_auth")}
                </Typography>
                <Typography variant="body1">
                  {settings.rateLimiting.auth.limit}{" "}
                  {t("settings.requests_per_window")}{" "}
                  {Math.round(settings.rateLimiting.auth.ttl / 1000)}
                  {t("settings.seconds")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.rate_limit_ai")}
                </Typography>
                <Typography variant="body1">
                  {settings.rateLimiting.ai.limit}{" "}
                  {t("settings.requests_per_window")}{" "}
                  {Math.round(settings.rateLimiting.ai.ttl / 1000)}
                  {t("settings.seconds")}
                </Typography>
              </Box>
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Backup Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsCard
            icon={<BackupIcon />}
            title={t("settings.backup_configuration")}
            iconColor="success.main"
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("settings.backup_status")}
                </Typography>
                <StatusIndicator
                  status={settings.backup.enabled ? "ok" : "warning"}
                  label={
                    settings.backup.enabled
                      ? "settings.backup_enabled"
                      : "settings.backup_disabled"
                  }
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.backup_schedule_label")}
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {settings.backup.schedule ??
                    t("settings.backup_not_configured")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.backup_retention_label")}
                </Typography>
                <Typography variant="body1">
                  {settings.backup.retentionDays} {t("settings.days")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.backup_last_backup")}
                </Typography>
                <Typography variant="body1">
                  {settings.backup.lastBackup
                    ? new Date(settings.backup.lastBackup).toLocaleString()
                    : t("settings.backup_never")}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              >
                <InfoIcon
                  sx={{
                    fontSize: 16,
                    color: "text.secondary",
                    mt: 0.25,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {t("settings.backup_env_note")}
                </Typography>
              </Box>
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Application Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsCard
            icon={<InfoIcon />}
            title={t("settings.app_info")}
            iconColor="primary.main"
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("settings.app_environment")}
                </Typography>
                <Chip
                  label={settings.app.environment}
                  size="small"
                  color={
                    settings.app.environment === "production"
                      ? "error"
                      : settings.app.environment === "staging"
                        ? "warning"
                        : "success"
                  }
                  sx={{ fontFamily: "monospace" }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.app_version")}
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  v{settings.app.version}
                </Typography>
              </Box>
            </Stack>
          </SettingsCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemSettingsPage;
