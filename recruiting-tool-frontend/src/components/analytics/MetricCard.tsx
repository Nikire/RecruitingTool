import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { MetricCardData } from '../../types/analytics';

interface MetricCardProps {
  data: MetricCardData;
}

/**
 * MetricCard Component
 *
 * Displays a single metric with optional trend indicator.
 * Used in analytics overview section to show key metrics.
 */
const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getTrendIcon = () => {
    if (!data.trend) return null;

    switch (data.trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'neutral':
        return <TrendingFlatIcon fontSize="small" sx={{ color: 'text.secondary' }} />;
    }
  };

  const getTrendColor = () => {
    if (!data.trend) return undefined;

    switch (data.trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      case 'neutral':
        return 'default';
    }
  };

  const formatTrendValue = () => {
    if (data.trendValue === undefined) return null;

    const sign = data.trendValue >= 0 ? '+' : '';
    return `${sign}${data.trendValue}%`;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {data.title}
          </Typography>
          {data.icon && (
            <Box
              sx={{
                color: data.color || theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {data.icon}
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="baseline" gap={1} mb={1}>
          <Typography variant="h3" component="div" fontWeight={700}>
            {data.value}
          </Typography>
          {data.unit && (
            <Typography variant="body1" color="text.secondary">
              {data.unit}
            </Typography>
          )}
        </Box>

        {data.trend && data.trendValue !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Chip
              icon={getTrendIcon() || undefined}
              label={formatTrendValue()}
              size="small"
              color={getTrendColor()}
              variant="outlined"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('analytics.vs_last_period')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
