import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import RefreshIcon from '@mui/icons-material/Refresh';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import { getAnalyticsData } from '../../services/analyticsService';
import { AnalyticsData, DateRangeFilter } from '../../types/analytics';
import toast from 'react-hot-toast';

/**
 * AnalyticsPage
 *
 * Main page for displaying analytics dashboard.
 * Includes date range filtering and data refresh functionality.
 */
const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: null,
    endDate: null,
  });

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await getAnalyticsData(dateRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error(t('analytics.fetch_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Handle date range apply
  const handleApplyDateRange = () => {
    fetchAnalytics();
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics();
    toast.success(t('analytics.data_refreshed'));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
    // Will trigger a fetch after state update
    setTimeout(() => {
      fetchAnalytics();
    }, 100);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            {t('analytics.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('analytics.subtitle')}
          </Typography>
        </Box>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            gap={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            flexWrap="wrap"
          >
            {/* Date Range Filter */}
            <Box display="flex" gap={2} flexGrow={1} flexWrap="wrap">
              <DatePicker
                label={t('analytics.start_date')}
                value={dateRange.startDate}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, startDate: date }))
                }
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 200 },
                  },
                }}
              />
              <DatePicker
                label={t('analytics.end_date')}
                value={dateRange.endDate}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, endDate: date }))
                }
                minDate={dateRange.startDate || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 200 },
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                onClick={handleApplyDateRange}
                disabled={isLoading}
              >
                {t('common.apply')}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                {t('common.clear')}
              </Button>
              <Button
                variant="outlined"
                onClick={handleRefresh}
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshIcon />
                  )
                }
              >
                {t('common.refresh')}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard data={analyticsData} isLoading={isLoading} />
      </Container>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;
