import React from "react";
import { Grid, Skeleton, Card, CardContent, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useAnalyticsOverview, DateRange } from "../../hooks/api/useAnalytics";
import MetricCard from "./MetricCard";
import { MetricCardData } from "../../types/analytics";

interface OverviewStatsRowProps {
  /** Optional date range filter for the metrics */
  dateRange?: DateRange;
}

/**
 * OverviewStatsRow - Displays a row of 5 key recruitment stat cards
 *
 * Fetches data from the analytics overview endpoint and renders:
 * - Total Applications This Month
 * - Hired This Month
 * - Active Processes
 * - Avg. Time to Hire
 * - Conversion Rate
 */
const OverviewStatsRow: React.FC<OverviewStatsRowProps> = ({ dateRange }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useAnalyticsOverview(dateRange);

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 12 / 5 }}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                height: "100%",
              }}
            >
              <CardContent sx={{ pt: 3, pb: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2.5}
                >
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="rounded" width={40} height={40} />
                </Box>
                <Skeleton variant="text" width="40%" height={48} />
                <Skeleton
                  variant="text"
                  width="50%"
                  height={26}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const metrics: MetricCardData[] = [
    {
      title: t("analytics.total_applications"),
      value: data?.volumeMetrics?.totalApplicationsThisMonth ?? 0,
      icon: <AssignmentIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: t("analytics.hired_this_month"),
      value: data?.volumeMetrics?.totalHiredThisMonth ?? 0,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
    },
    {
      title: t("analytics.active_processes"),
      value: data?.volumeMetrics?.totalActiveProcesses ?? 0,
      icon: <WorkIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: t("analytics.avg_time_to_hire"),
      value: Math.round(data?.timeMetrics?.averageTimeToHire ?? 0),
      unit: t("analytics.days"),
      icon: <AccessTimeIcon />,
      color: theme.palette.info.main,
    },
    {
      title: t("analytics.conversion_rate"),
      value: `${Math.round(data?.conversionMetrics?.overallConversionRate ?? 0)}%`,
      icon: <TrendingUpIcon />,
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 12 / 5 }}>
          <MetricCard data={metric} />
        </Grid>
      ))}
    </Grid>
  );
};

export default OverviewStatsRow;
