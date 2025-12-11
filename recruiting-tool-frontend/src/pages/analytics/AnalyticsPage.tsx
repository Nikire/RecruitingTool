import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";
import RefreshIcon from "@mui/icons-material/Refresh";
import AnalyticsDashboard from "../../components/analytics/AnalyticsDashboard";
import { useAnalyticsOverview } from "../../hooks/api/useAnalytics";
import toast from "react-hot-toast";

/**
 * AnalyticsPage
 *
 * Main page for displaying analytics dashboard.
 * Includes date range filtering and data refresh functionality.
 * Now uses React Query for data fetching with real backend API.
 */
const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Convert Date objects to ISO strings for API
  const apiDateRange = useMemo(() => {
    if (!dateRange.startDate && !dateRange.endDate) {
      return undefined;
    }
    return {
      startDate: dateRange.startDate?.toISOString(),
      endDate: dateRange.endDate?.toISOString(),
    };
  }, [dateRange]);

  // Fetch analytics data using React Query
  const {
    data: overviewData,
    isLoading,
    refetch,
  } = useAnalyticsOverview(apiDateRange);

  // Handle date range apply
  const handleApplyDateRange = () => {
    refetch();
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast.success(t("analytics.data_refreshed"));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            {t("analytics.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("analytics.subtitle")}
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
            flexDirection={{ xs: "column", md: "row" }}
            gap={2}
            alignItems={{ xs: "stretch", md: "center" }}
            flexWrap="wrap"
          >
            {/* Date Range Filter */}
            <Box display="flex" gap={2} flexGrow={1} flexWrap="wrap">
              <DatePicker
                label={t("analytics.start_date")}
                value={dateRange.startDate}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, startDate: date }))
                }
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 200 },
                  },
                }}
              />
              <DatePicker
                label={t("analytics.end_date")}
                value={dateRange.endDate}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, endDate: date }))
                }
                minDate={dateRange.startDate || undefined}
                slotProps={{
                  textField: {
                    size: "small",
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
                {t("common.apply")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                {t("common.clear")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleRefresh}
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={16} /> : <RefreshIcon />
                }
              >
                {t("common.refresh")}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard
          data={overviewData}
          isLoading={isLoading}
          dateRange={apiDateRange}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;
