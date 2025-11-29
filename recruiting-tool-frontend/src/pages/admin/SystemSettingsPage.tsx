import { Box, Typography, Grid, Stack, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  Psychology as PsychologyIcon,
  Extension as ExtensionIcon,
  HealthAndSafety as HealthIcon,
  Public as PublicIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { SettingsCard, StatusIndicator, TestConnectionButton } from '../../components/settings';
import { useUserAtom } from '../../hooks/api/state/useUserAtom';
import { Navigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

/**
 * SystemSettingsPage - System configuration and health monitoring (SUPER_ADMIN only)
 *
 * @description
 * Comprehensive system settings page displaying:
 * - General application settings (timezone, language, date format)
 * - Email configuration status and testing
 * - AI settings and quotas
 * - Integration status (Google Calendar, n8n, MinIO)
 * - System health monitoring (Database, API, Storage)
 *
 * @access SUPER_ADMIN only
 */

// Mock data - will be replaced with real API calls
interface SystemSettings {
  general: {
    applicationName: string;
    defaultTimezone: string;
    defaultLanguage: string;
    dateFormat: string;
  };
  email: {
    configured: boolean;
    smtpHost?: string;
    smtpPort?: number;
  };
  ai: {
    enabled: boolean;
    defaultQuota: number;
    model: string;
  };
  integrations: {
    googleCalendar: 'connected' | 'error' | 'not_configured';
    n8nWebhook: 'connected' | 'error' | 'not_configured';
    minioStorage: 'connected' | 'error' | 'not_configured';
  };
  health: {
    database: 'ok' | 'error' | 'warning';
    backend: 'ok' | 'error' | 'warning';
    storage: 'ok' | 'error' | 'warning';
  };
}

const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [isLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Permission check - SUPER_ADMIN only
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={['SUPER_ADMIN']} />;
  }

  // Mock settings data - TODO: Replace with API call
  const settings: SystemSettings = {
    general: {
      applicationName: 'Recruiting Tool',
      defaultTimezone: 'America/New_York',
      defaultLanguage: 'en',
      dateFormat: 'MM/DD/YYYY',
    },
    email: {
      configured: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
    },
    ai: {
      enabled: true,
      defaultQuota: 100,
      model: 'gpt-4',
    },
    integrations: {
      googleCalendar: 'connected',
      n8nWebhook: 'connected',
      minioStorage: 'connected',
    },
    health: {
      database: 'ok',
      backend: 'ok',
      storage: 'ok',
    },
  };

  // Test email connection handler
  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      // TODO: Implement actual email test API call
      // await testEmailConnection();
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      toast.success(t('settings.email_test_success'));
    } catch (error) {
      toast.error(t('settings.email_test_failed'));
    } finally {
      setTestingEmail(false);
    }
  };

  // Helper function to map integration status to StatusType
  const getStatusType = (
    status: 'connected' | 'error' | 'not_configured'
  ): 'ok' | 'error' | 'warning' => {
    if (status === 'connected') return 'ok';
    if (status === 'error') return 'error';
    return 'warning';
  };

  if (isLoading) {
    return <LoadingSpinner message={t('settings.loading_settings')} />;
  }

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={t('settings.system_settings_title')}
        subtitle={t('settings.system_settings_subtitle')}
      />

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<SettingsIcon />}
            title={t('settings.general_settings')}
            iconColor="primary.main"
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.application_name')}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {settings.general.applicationName}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublicIcon fontSize="small" color="action" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.default_timezone')}
                  </Typography>
                  <Typography variant="body1">
                    {settings.general.defaultTimezone}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon fontSize="small" color="action" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.default_language')}
                  </Typography>
                  <Chip
                    label={t(`language.${settings.general.defaultLanguage}`)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.date_format')}
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {settings.general.dateFormat}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<EmailIcon />}
            title={t('settings.email_configuration')}
            iconColor="info.main"
            action={
              <TestConnectionButton
                onTest={handleTestEmail}
                isLoading={testingEmail}
                disabled={!settings.email.configured}
              />
            }
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.smtp_status')}
                </Typography>
                <StatusIndicator
                  status={settings.email.configured ? 'ok' : 'error'}
                  label={
                    settings.email.configured
                      ? 'settings.status_configured'
                      : 'settings.status_not_configured'
                  }
                />
              </Box>

              {settings.email.configured && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.smtp_host')}
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {settings.email.smtpHost}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.smtp_port')}
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {settings.email.smtpPort}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </SettingsCard>
        </Grid>

        {/* AI Settings */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<PsychologyIcon />}
            title={t('settings.ai_configuration')}
            iconColor="secondary.main"
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.ai_status')}
                </Typography>
                <StatusIndicator
                  status={settings.ai.enabled ? 'ok' : 'warning'}
                  label={
                    settings.ai.enabled
                      ? 'settings.status_enabled'
                      : 'settings.status_disabled'
                  }
                />
              </Box>

              {settings.ai.enabled && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.ai_model')}
                    </Typography>
                    <Chip
                      label={settings.ai.model}
                      size="small"
                      color="secondary"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.default_quota')}
                    </Typography>
                    <Typography variant="body1">
                      {settings.ai.defaultQuota} {t('settings.requests_per_month')}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Integration Status */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<ExtensionIcon />}
            title={t('settings.integrations')}
            iconColor="warning.main"
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.google_calendar')}
                </Typography>
                <StatusIndicator
                  status={getStatusType(settings.integrations.googleCalendar)}
                  label={`settings.status_${settings.integrations.googleCalendar}`}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.n8n_webhook')}
                </Typography>
                <StatusIndicator
                  status={getStatusType(settings.integrations.n8nWebhook)}
                  label={`settings.status_${settings.integrations.n8nWebhook}`}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.minio_storage')}
                </Typography>
                <StatusIndicator
                  status={getStatusType(settings.integrations.minioStorage)}
                  label={`settings.status_${settings.integrations.minioStorage}`}
                />
              </Box>
            </Stack>
          </SettingsCard>
        </Grid>

        {/* System Health */}
        <Grid item xs={12}>
          <SettingsCard
            icon={<HealthIcon />}
            title={t('settings.system_health')}
            iconColor="success.main"
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('settings.database_status')}
                  </Typography>
                  <StatusIndicator
                    status={settings.health.database}
                    label={`settings.status_${settings.health.database}`}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('settings.backend_api_status')}
                  </Typography>
                  <StatusIndicator
                    status={settings.health.backend}
                    label={`settings.status_${settings.health.backend}`}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('settings.storage_service_status')}
                  </Typography>
                  <StatusIndicator
                    status={settings.health.storage}
                    label={`settings.status_${settings.health.storage}`}
                  />
                </Box>
              </Grid>
            </Grid>
          </SettingsCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemSettingsPage;
