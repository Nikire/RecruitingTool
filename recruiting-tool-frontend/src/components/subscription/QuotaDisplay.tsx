import React from 'react';
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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';
import { QuotaStatus, getQuotaByResource, isFeatureEnabled } from '../../types/subscription.types';

interface QuotaDisplayProps {
  quotaStatus: QuotaStatus;
  onUpgrade?: () => void;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ quotaStatus, onUpgrade }) => {
  const { t } = useTranslation();

  const getUsageColor = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'error';
  };

  const formatLimit = (limit: number): string => {
    if (limit === -1) return t('subscription.quota.unlimited');
    return String(limit);
  };

  const formatStorageSize = (mb: number): string => {
    if (mb === -1) return t('subscription.quota.unlimited');
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Get quota data with safe defaults
  const usersQuota = getQuotaByResource(quotaStatus.quotas, 'users');
  const jobPositionsQuota = getQuotaByResource(quotaStatus.quotas, 'jobPositions');
  const storageQuota = getQuotaByResource(quotaStatus.quotas, 'storage');

  const isApproachingLimit =
    (usersQuota?.percentageUsed ?? 0) >= 80 ||
    (jobPositionsQuota?.percentageUsed ?? 0) >= 80 ||
    (storageQuota?.percentageUsed ?? 0) >= 80;

  // Feature flags
  const features = [
    { key: 'aiScoring', label: t('subscription.features.ai_scoring') },
    { key: 'emailTemplates', label: t('subscription.features.email_templates') },
    { key: 'analytics', label: t('subscription.features.analytics') },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('subscription.quota.title')}
        </Typography>

        {isApproachingLimit && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              onUpgrade && (
                <Chip
                  label={t('subscription.quota.upgrade_now')}
                  onClick={onUpgrade}
                  color="warning"
                  size="small"
                  clickable
                />
              )
            }
          >
            {t('subscription.quota.approaching_limit')}
          </Alert>
        )}

        {/* Users Quota */}
        {usersQuota && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('subscription.quota.users')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={usersQuota.limit === -1 ? 0 : usersQuota.percentageUsed}
                  color={getUsageColor(usersQuota.percentageUsed)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
                {usersQuota.used} / {formatLimit(usersQuota.limit)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Job Positions Quota */}
        {jobPositionsQuota && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('subscription.quota.job_positions')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={jobPositionsQuota.limit === -1 ? 0 : jobPositionsQuota.percentageUsed}
                  color={getUsageColor(jobPositionsQuota.percentageUsed)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
                {jobPositionsQuota.used} / {formatLimit(jobPositionsQuota.limit)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Storage Quota */}
        {storageQuota && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('subscription.quota.storage')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={storageQuota.limit === -1 ? 0 : storageQuota.percentageUsed}
                  color={getUsageColor(storageQuota.percentageUsed)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, textAlign: 'right' }}>
                {formatStorageSize(storageQuota.used)} / {formatStorageSize(storageQuota.limit)}
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" gutterBottom>
          {t('subscription.quota.features')}
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
                  primaryTypographyProps={{ variant: 'body2' }}
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
