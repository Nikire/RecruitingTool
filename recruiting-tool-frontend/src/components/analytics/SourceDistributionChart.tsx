import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { SourceData } from "../../types/analytics";

interface SourceDistributionChartProps {
  data: SourceData[];
}

/**
 * SourceDistributionChart Component
 *
 * Pie chart showing distribution of candidate sources.
 * Helps identify most effective recruitment channels.
 */
const SourceDistributionChart: React.FC<SourceDistributionChartProps> = ({
  data,
}) => {
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

  // Define color palette
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Custom label for pie slices
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if slice is large enough
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: SourceData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" fontWeight={600}>
            {data.source}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("analytics.candidates")}: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.percentage}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Custom legend
  interface LegendEntry {
    color: string;
    value: string;
    payload: SourceData;
  }
  const renderLegend = (props: { payload?: LegendEntry[] }) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mt: 2,
        }}
      >
        {payload.map((entry: LegendEntry, index: number) => (
          <Box
            key={`legend-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: 0.5,
                }}
              />
              <Typography variant="body2">{entry.value}</Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Typography variant="body2" fontWeight={600}>
                {entry.payload.count}
              </Typography>
              <Typography variant="body2" color="text.secondary" minWidth={40}>
                ({entry.payload.percentage}%)
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
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
          {t("analytics.source_distribution")}
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
            {t("analytics.total_candidates")}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {total}
          </Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="source"
            cx="50%"
            cy="50%"
            outerRadius={100}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={renderCustomLabel as any}
            labelLine={false}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{
                  filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <Box mt={1}>
        {/* Recharts Legend requires payload prop not in its TypeScript type definition */}
        {/* eslint-disable @typescript-eslint/no-explicit-any */}
        {React.createElement(Legend as any, {
          content: renderLegend as any,
          payload: data.map((item, index) => ({
            value: item.source,
            color: COLORS[index % COLORS.length],
            payload: item,
          })),
        })}
        {/* eslint-enable @typescript-eslint/no-explicit-any */}
      </Box>

      {/* Top Source Highlight */}
      <Box
        sx={{
          mt: 3,
          pt: 3,
          borderTop: `2px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {t("analytics.top_source")}
        </Typography>
        <Box
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : COLORS[0] + "20",
            px: 2.5,
            py: 1.5,
            borderRadius: 2,
            border: `2px solid ${COLORS[0]}`,
          }}
        >
          <Typography variant="body2" fontWeight={700} color={COLORS[0]}>
            {data[0]?.source} ({data[0]?.percentage}%)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SourceDistributionChart;
