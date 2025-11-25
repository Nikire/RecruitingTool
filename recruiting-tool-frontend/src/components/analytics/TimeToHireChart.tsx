import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { TimeToHireData } from '../../types/analytics';

interface TimeToHireChartProps {
  data: TimeToHireData[];
}

/**
 * TimeToHireChart Component
 *
 * Bar chart showing average time-to-hire by job position.
 * Helps identify which positions take longer to fill.
 */
const TimeToHireChart: React.FC<TimeToHireChartProps> = ({ data }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('analytics.no_data')}
        </Typography>
      </Paper>
    );
  }

  // Calculate average time to hire
  const avgTimeToHire =
    data.reduce((sum, item) => sum + item.days, 0) / data.length;

  // Color bars based on comparison to average
  const getBarColor = (days: number): string => {
    if (days <= avgTimeToHire * 0.8) {
      return theme.palette.success.main; // Fast
    } else if (days <= avgTimeToHire * 1.2) {
      return theme.palette.warning.main; // Average
    } else {
      return theme.palette.error.main; // Slow
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" fontWeight={600}>
            {data.position}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('analytics.avg_time_to_hire')}: {data.days} {t('analytics.days')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('analytics.hires_count', { defaultValue: 'Hires' })}: {data.count}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          {t('analytics.time_to_hire')}
        </Typography>
        <Box textAlign="right">
          <Typography variant="caption" color="text.secondary" display="block">
            {t('analytics.average')}
          </Typography>
          <Typography variant="h6" fontWeight={600} color="primary">
            {Math.round(avgTimeToHire)} {t('analytics.days')}
          </Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="position"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          <YAxis
            label={{
              value: t('analytics.days'),
              angle: -90,
              position: 'insideLeft',
              style: { fill: theme.palette.text.secondary },
            }}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            content={() => (
              <Box display="flex" justifyContent="center" gap={2} mt={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: theme.palette.success.main,
                      borderRadius: 0.5,
                    }}
                  />
                  <Typography variant="caption">
                    {t('analytics.fast_hiring', { defaultValue: 'Fast' })}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: theme.palette.warning.main,
                      borderRadius: 0.5,
                    }}
                  />
                  <Typography variant="caption">
                    {t('analytics.average_hiring', { defaultValue: 'Average' })}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: theme.palette.error.main,
                      borderRadius: 0.5,
                    }}
                  />
                  <Typography variant="caption">
                    {t('analytics.slow_hiring', { defaultValue: 'Slow' })}
                  </Typography>
                </Box>
              </Box>
            )}
          />
          <Bar dataKey="days" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.days)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TimeToHireChart;
