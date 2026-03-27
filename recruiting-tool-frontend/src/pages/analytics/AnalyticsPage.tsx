import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import RefreshIcon from "@mui/icons-material/Refresh";
import AnalyticsDashboard from "../../components/analytics/AnalyticsDashboard";
import AnalyticsDateRangePicker, {
  DateRangeValue,
} from "../../components/analytics/AnalyticsDateRangePicker";
import { useAnalyticsOverview } from "../../hooks/api/useAnalytics";
import { startOfDay, endOfDay, subDays } from "date-fns";
import toast from "react-hot-toast";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const toIso = (date: Date): string => date.toISOString();

/** Build the default "Last 7 days" range value */
function buildDefaultRange(label: string): DateRangeValue {
  const now = new Date();
  return {
    preset: "7d",
    startDate: toIso(startOfDay(subDays(now, 6))),
    endDate: toIso(endOfDay(now)),
    label,
  };
}

// -----------------------------------------------------------------------
// AnalyticsPage
// -----------------------------------------------------------------------

/**
 * AnalyticsPage
 *
 * Main page for displaying analytics dashboard.
 * Includes a date range picker with preset periods and a custom range option.
 * Wires the selected date range to React Query hooks for real backend data.
 */
const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  // The initial default is "Last 7 days" as specified in the issue
  const [dateRangeValue, setDateRangeValue] = useState<DateRangeValue>(() =>
    buildDefaultRange(t("analytics.period_7d")),
  );

  // Convert to API format — only pass dates that are defined
  const apiDateRange = useMemo(() => {
    const { startDate, endDate } = dateRangeValue;
    if (!startDate && !endDate) return undefined;
    return { startDate, endDate };
  }, [dateRangeValue]);

  // Fetch analytics data using React Query
  const {
    data: overviewData,
    isLoading,
    refetch,
  } = useAnalyticsOverview(apiDateRange);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast.success(t("analytics.data_refreshed"));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ---- Header ------------------------------------------------- */}
      <Box
        mb={3}
        display="flex"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={1}
      >
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            {t("analytics.title")}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="body1" color="text.secondary">
              {t("analytics.subtitle")}
            </Typography>
          </Box>
        </Box>

        {/* Refresh button — top-right */}
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={16} /> : <RefreshIcon />
          }
          sx={{ borderRadius: 2, px: 2.5, mt: { xs: 0, sm: 0.5 } }}
        >
          {t("common.refresh")}
        </Button>
      </Box>

      {/* ---- Date range picker -------------------------------------- */}
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
        <AnalyticsDateRangePicker
          value={dateRangeValue}
          onChange={(newValue) => {
            setDateRangeValue(newValue);
            // Auto-refetch when a preset is chosen (not custom pending apply)
            if (
              newValue.preset !== "custom" ||
              (newValue.startDate && newValue.endDate)
            ) {
              // React Query will automatically refetch because queryKey changes
            }
          }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Currently selected period display */}
        <Typography variant="caption" color="text.secondary">
          {t("analytics.showing_period")}:{" "}
          <strong>{dateRangeValue.label}</strong>
        </Typography>
      </Paper>

      {/* ---- Analytics Dashboard ------------------------------------ */}
      <AnalyticsDashboard
        data={overviewData}
        isLoading={isLoading}
        dateRange={apiDateRange}
      />
    </Container>
  );
};

export default AnalyticsPage;
