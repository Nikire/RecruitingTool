import React from 'react';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import MetricCard from './MetricCard';
import ConversionFunnel from './ConversionFunnel';
import TimeToHireChart from './TimeToHireChart';
import HiringTrendsChart from './HiringTrendsChart';
import SourceDistributionChart from './SourceDistributionChart';
import { AnalyticsData, MetricCardData, MetricTrend } from '../../types/analytics';

interface AnalyticsDashboardProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

/**
 * AnalyticsDashboard Component
 *
 * Main analytics dashboard layout displaying all analytics components.
 * Shows overview metrics, charts, and insights.
 */
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Convert trend value to trend direction
  const getTrend = (trendValue?: number): MetricTrend => {
    if (!trendValue) return 'neutral';
    if (trendValue > 0) return 'up';
    if (trendValue < 0) return 'down';
    return 'neutral';
  };

  // Prepare metric cards data
  const metricCards: MetricCardData[] = data
    ? [
        {
          title: t('analytics.total_candidates'),
          value: data.overview.totalCandidates,
          trend: getTrend(data.overview.candidatesTrend),
          trendValue: data.overview.candidatesTrend,
          icon: <PeopleIcon fontSize="large" />,
          color: 'primary.main',
        },
        {
          title: t('analytics.active_positions'),
          value: data.overview.activeJobPositions,
          trend: getTrend(data.overview.positionsTrend),
          trendValue: data.overview.positionsTrend,
          icon: <WorkIcon fontSize="large" />,
          color: 'info.main',
        },
        {
          title: t('analytics.hiring_processes'),
          value: data.overview.totalHiringProcesses,
          trend: getTrend(data.overview.processesTrend),
          trendValue: data.overview.processesTrend,
          icon: <AssignmentIcon fontSize="large" />,
          color: 'warning.main',
        },
        {
          title: t('analytics.hired_this_month'),
          value: data.overview.hiredThisMonth,
          trend: getTrend(data.overview.hiredTrend),
          trendValue: data.overview.hiredTrend,
          icon: <CheckCircleIcon fontSize="large" />,
          color: 'success.main',
        },
        {
          title: t('analytics.avg_time_to_hire'),
          value: data.overview.avgTimeToHire,
          unit: t('analytics.days'),
          trend: getTrend(data.overview.timeToHireTrend),
          trendValue: data.overview.timeToHireTrend,
          icon: <TimerIcon fontSize="large" />,
          color: 'secondary.main',
        },
      ]
    : [];

  // Loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // No data state
  if (!data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography variant="body1" color="text.secondary">
          {t('analytics.no_data')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Overview Metrics */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
          {t('analytics.overview')}
        </Typography>
        <Grid container spacing={3}>
          {metricCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <MetricCard data={card} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Hiring Metrics */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
          {t('analytics.hiring_metrics')}
        </Typography>
        <Grid container spacing={3}>
          {/* Conversion Funnel */}
          <Grid item xs={12} lg={6}>
            <ConversionFunnel data={data.hiring.conversionRates} />
          </Grid>

          {/* Time to Hire Chart */}
          <Grid item xs={12} lg={6}>
            <TimeToHireChart data={data.hiring.timeToHireByPosition} />
          </Grid>

          {/* Hiring Trends */}
          <Grid item xs={12}>
            <HiringTrendsChart data={data.hiring.hiresOverTime} />
          </Grid>
        </Grid>
      </Box>

      {/* Candidate Metrics */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
          {t('analytics.candidate_metrics')}
        </Typography>
        <Grid container spacing={3}>
          {/* Source Distribution */}
          <Grid item xs={12} md={6}>
            <SourceDistributionChart data={data.candidates.sourceDistribution} />
          </Grid>

          {/* Status Distribution */}
          <Grid item xs={12} md={6}>
            <SourceDistributionChart data={data.candidates.statusDistribution.map(item => ({
              source: item.status,
              count: item.count,
              percentage: item.percentage,
            }))} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;
