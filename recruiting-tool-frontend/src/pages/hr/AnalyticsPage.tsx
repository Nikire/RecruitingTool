import { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/common";
import OverviewStatsRow from "../../components/analytics/OverviewStatsRow";
import PipelineFunnelChart from "../../components/analytics/PipelineFunnelChart";
import SourcesDonutChart from "../../components/analytics/SourcesDonutChart";

/**
 * Date range option type for the analytics filter
 */
type DateRangeOption = "30" | "90" | "180" | "365";

/**
 * Chart placeholder card props
 */
interface ChartPlaceholderProps {
  title: string;
}

/**
 * ChartPlaceholder - Displays a loading placeholder card for a chart
 * Will be replaced in subsequent issues (#294-#299) with actual chart components
 */
const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        height: "100%",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "action.hover",
            borderRadius: 1,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            {t("analytics.loading")}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

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
          <ChartPlaceholder title={t("analytics.time_to_hire_trend")} />
        </Grid>

        {/* Stage Duration Bottleneck */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartPlaceholder title={t("analytics.stage_duration")} />
        </Grid>

        {/* Source Effectiveness */}
        <Grid size={{ xs: 12 }}>
          <ChartPlaceholder title={t("analytics.source_effectiveness")} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
