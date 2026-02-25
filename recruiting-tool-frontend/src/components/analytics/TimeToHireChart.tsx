import React from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useAnalyticsTimeToHire,
  type DateRange,
  type TimeToHireTrendDto,
} from "../../hooks/api/useAnalytics";

/**
 * Props for the TimeToHireChart component
 */
interface TimeToHireChartProps {
  /** Optional date range filter */
  dateRange?: DateRange;
}

/**
 * Custom tooltip payload type for the area chart
 */
interface TooltipPayloadItem {
  payload: TimeToHireTrendDto;
  value: number;
  name: string;
}

/**
 * Custom tooltip for the time-to-hire area chart.
 * Displays period, average days, and hires count.
 */
const TimeToHireTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1.5,
          boxShadow: theme.shadows[3],
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          {item.period}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("analytics.avg_time_to_hire")}: {item.averageTimeToHire}{" "}
          {t("analytics.days")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("analytics.hires_count_label", { count: item.hiresCount })}
        </Typography>
      </Box>
    );
  }
  return null;
};

/**
 * ComparisonCard - Mini stat box used in the comparison row above the chart.
 */
const ComparisonCard = ({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number | string;
  unit?: string;
  highlight?: "positive" | "negative" | "neutral";
}) => {
  const theme = useTheme();

  const color =
    highlight === "positive"
      ? theme.palette.success.main
      : highlight === "negative"
        ? theme.palette.error.main
        : theme.palette.text.primary;

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "action.hover",
        borderRadius: 1.5,
        p: { xs: 1, sm: 1.5 },
        textAlign: "center",
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 600,
          mb: 0.25,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "0.95rem", sm: "1.1rem" },
          color,
          lineHeight: 1.2,
        }}
      >
        {value}
        {unit && (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ ml: 0.5, fontWeight: 400 }}
          >
            {unit}
          </Typography>
        )}
      </Typography>
    </Box>
  );
};

/**
 * TimeToHireChart - Connected chart component that fetches and displays
 * the time-to-hire trend over time as an area chart.
 *
 * Includes a comparison row (current avg, previous period, change) above
 * the chart and a Recharts AreaChart for the trend line.
 *
 * @example
 * ```tsx
 * <TimeToHireChart dateRange={{ startDate: '2025-01-01', endDate: '2025-12-31' }} />
 * ```
 */
const TimeToHireChart: React.FC<TimeToHireChartProps> = ({ dateRange }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data, isLoading, isError } = useAnalyticsTimeToHire(dateRange);

  // Determine the change trend icon and color
  const percentageChange = data?.percentageChange ?? 0;
  // Lower time-to-hire is better: negative change = improvement = green
  const changeHighlight: "positive" | "negative" | "neutral" =
    percentageChange === 0
      ? "neutral"
      : percentageChange < 0
        ? "positive"
        : "negative";

  const TrendIcon =
    percentageChange === 0
      ? TrendingFlatIcon
      : percentageChange < 0
        ? TrendingDownIcon
        : TrendingUpIcon;

  // Loading state
  if (isLoading) {
    return (
      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          height: "100%",
          transition: "box-shadow 0.3s ease",
          "&:hover": { boxShadow: 4 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Skeleton
              variant="rectangular"
              height={60}
              sx={{ borderRadius: 1.5, flex: 1 }}
            />
            <Skeleton
              variant="rectangular"
              height={60}
              sx={{ borderRadius: 1.5, flex: 1 }}
            />
            <Skeleton
              variant="rectangular"
              height={60}
              sx={{ borderRadius: 1.5, flex: 1 }}
            />
          </Box>
          <Skeleton
            variant="rectangular"
            height={260}
            sx={{ borderRadius: 1 }}
          />
        </CardContent>
      </Card>
    );
  }

  // Error or empty state
  if (isError || !data || !data.trend || data.trend.length === 0) {
    return (
      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          height: "100%",
          transition: "box-shadow 0.3s ease",
          "&:hover": { boxShadow: 4 },
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
            {t("analytics.time_to_hire_trend")}
          </Typography>
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("analytics.no_time_to_hire_data")}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        height: "100%",
        transition: "box-shadow 0.3s ease",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          {t("analytics.time_to_hire_trend")}
        </Typography>

        {/* Comparison cards row */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <ComparisonCard
            label={t("analytics.current_avg")}
            value={data.current}
            unit={t("analytics.days")}
          />
          <ComparisonCard
            label={t("analytics.prev_period")}
            value={data.previous}
            unit={t("analytics.days")}
          />
          <ComparisonCard
            label={t("analytics.change")}
            value={
              <Box
                component="span"
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}
              >
                <TrendIcon
                  sx={{
                    fontSize: "1rem",
                    color:
                      changeHighlight === "positive"
                        ? theme.palette.success.main
                        : changeHighlight === "negative"
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                  }}
                />
                {Math.abs(percentageChange).toFixed(1)}%
              </Box>
            }
            highlight={changeHighlight}
          />
        </Box>

        {/* Area chart */}
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data.trend}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id="timeToHireGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              tickFormatter={(value: number) => `${value}d`}
            />
            <Tooltip content={<TimeToHireTooltip />} />
            <Area
              type="monotone"
              dataKey="averageTimeToHire"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fill="url(#timeToHireGradient)"
              dot={{
                r: 3,
                fill: theme.palette.primary.main,
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
                fill: theme.palette.primary.main,
                stroke: theme.palette.background.paper,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TimeToHireChart;
