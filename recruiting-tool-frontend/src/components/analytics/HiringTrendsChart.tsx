import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { HiringTrendData } from "../../types/analytics";

interface HiringTrendsChartProps {
  data: HiringTrendData[];
}

/**
 * HiringTrendsChart Component
 *
 * Line chart showing hiring trends over time.
 * Optionally displays target hiring goals.
 */
const HiringTrendsChart: React.FC<HiringTrendsChartProps> = ({ data }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("analytics.no_data")}
        </Typography>
      </Paper>
    );
  }

  // Calculate total hires
  const totalHires = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate average
  const avgHires = Math.round(totalHires / data.length);

  // Check if there's a target in the data
  const hasTarget = data.some((item) => item.target !== undefined);

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: HiringTrendData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" fontWeight={600}>
            {data.month}
          </Typography>
          <Typography variant="body2" color="primary">
            {t("analytics.hires")}: {data.count}
          </Typography>
          {data.target !== undefined && (
            <Typography variant="body2" color="text.secondary">
              {t("analytics.target")}: {data.target}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        background:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(0, 0, 0, 0.01)",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight={600}>
          {t("analytics.hiring_trends")}
        </Typography>
        <Box
          textAlign="right"
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : theme.palette.primary.light + "20",
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {t("analytics.total_hires")}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {totalHires}
          </Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="month"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          <YAxis
            label={{
              value: t("analytics.number_of_hires"),
              angle: -90,
              position: "insideLeft",
              style: { fill: theme.palette.text.secondary },
            }}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

          {/* Average reference line */}
          <ReferenceLine
            y={avgHires}
            stroke={theme.palette.warning.main}
            strokeDasharray="5 5"
            label={{
              value: t("analytics.average"),
              fill: theme.palette.warning.main,
              fontSize: 12,
            }}
          />

          {/* Actual hires line */}
          <Line
            type="monotone"
            dataKey="count"
            name={t("analytics.actual_hires")}
            stroke={theme.palette.primary.main}
            strokeWidth={3}
            dot={{
              fill: theme.palette.primary.main,
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{ r: 7 }}
          />

          {/* Target line (if present) */}
          {hasTarget && (
            <Line
              type="monotone"
              dataKey="target"
              name={t("analytics.target")}
              stroke={theme.palette.success.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{
                fill: theme.palette.success.main,
                strokeWidth: 2,
                r: 4,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Trend Analysis */}
      <Box
        sx={{
          mt: 3,
          pt: 3,
          borderTop: `2px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box
          textAlign="center"
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
            px: 3,
            py: 2,
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {t("analytics.average_per_month")}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="info.main" mt={0.5}>
            {avgHires}
          </Typography>
        </Box>
        <Box
          textAlign="center"
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
            px: 3,
            py: 2,
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {t("analytics.best_month")}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            color="success.main"
            mt={0.5}
          >
            {Math.max(...data.map((d) => d.count))}
          </Typography>
        </Box>
        <Box
          textAlign="center"
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
            px: 3,
            py: 2,
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {t("analytics.total_period")}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary.main"
            mt={0.5}
          >
            {totalHires}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default HiringTrendsChart;
