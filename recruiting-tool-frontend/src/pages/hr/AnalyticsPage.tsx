import { useState, useMemo } from "react";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/common";
import OverviewStatsRow from "../../components/analytics/OverviewStatsRow";
import PipelineFunnelChart from "../../components/analytics/PipelineFunnelChart";
import SourcesDonutChart from "../../components/analytics/SourcesDonutChart";
import SourceEffectivenessTable from "../../components/analytics/SourceEffectivenessTable";
import StageDurationTable from "../../components/analytics/StageDurationTable";
import TimeToHireChart from "../../components/analytics/TimeToHireChart";

/**
 * Date range option type for the analytics filter
 */
type DateRangeOption = "30" | "90" | "180" | "365";

/**
 * AnalyticsPage - Analytics & Reporting dashboard for HR users
 * Scaffold with date range filter and placeholder chart sections.
 * Charts will be implemented in issues #294-#299.
 */
const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRangeOption>("30");

  const handleDateRangeChange = (event: SelectChangeEvent<DateRangeOption>) => {
    setDateRange(event.target.value as DateRangeOption);
  };

  // Convert dateRange string (days) to ISO date range object
  const computedDateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [dateRange]);

  const dateRangeOptions: { value: DateRangeOption; label: string }[] = [
    { value: "30", label: t("analytics.last_30_days") },
    { value: "90", label: t("analytics.last_90_days") },
    { value: "180", label: t("analytics.last_6_months") },
    { value: "365", label: t("analytics.last_year") },
  ];

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="analytics.title"
        subtitle="analytics.subtitle"
        translate={true}
        secondaryActions={
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="date-range-label">
              {t("analytics.date_range")}
            </InputLabel>
            <Select<DateRangeOption>
              labelId="date-range-label"
              id="date-range-select"
              value={dateRange}
              label={t("analytics.date_range")}
              onChange={handleDateRangeChange}
            >
              {dateRangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Overview Stats - Full width row */}
        <Grid size={{ xs: 12 }}>
          <OverviewStatsRow dateRange={computedDateRange} />
        </Grid>

        {/* Pipeline Funnel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PipelineFunnelChart dateRange={computedDateRange} />
        </Grid>

        {/* Applications by Source */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SourcesDonutChart dateRange={computedDateRange} />
        </Grid>

        {/* Time to Hire Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TimeToHireChart dateRange={computedDateRange} />
        </Grid>

        {/* Stage Duration Bottleneck */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StageDurationTable dateRange={computedDateRange} />
        </Grid>

        {/* Source Effectiveness */}
        <Grid size={{ xs: 12 }}>
          <SourceEffectivenessTable dateRange={computedDateRange} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
