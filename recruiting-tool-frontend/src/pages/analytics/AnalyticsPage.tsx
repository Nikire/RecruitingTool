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
            p: { xs: 2, sm: 3 },
            mb: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.01)",
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 2, sm: 2, md: 3 }}
            alignItems={{ xs: "stretch", sm: "flex-start", md: "center" }}
            flexWrap="wrap"
          >
            {/* Date Range Filter */}
            <Box
              display="flex"
              gap={2}
              flexGrow={1}
              flexWrap="wrap"
              alignItems="center"
            >
              <DatePicker
                label={t("analytics.start_date")}
                value={dateRange.startDate}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, startDate: date }))
                }
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      minWidth: { xs: "100%", sm: 180, md: 200 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    },
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
                    sx: {
                      minWidth: { xs: "100%", sm: 180, md: 200 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box
              display="flex"
              gap={1.5}
              flexWrap="wrap"
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                variant="contained"
                onClick={handleApplyDateRange}
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  flex: { xs: 1, sm: "unset" },
                }}
              >
                {t("common.apply")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  flex: { xs: 1, sm: "unset" },
                }}
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
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  flex: { xs: 1, sm: "unset" },
                }}
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
