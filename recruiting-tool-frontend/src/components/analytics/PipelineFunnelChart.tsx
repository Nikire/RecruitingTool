import React, { useMemo } from "react";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  useAnalyticsPipeline,
  type DateRange,
  type PipelineStageDto,
} from "../../hooks/api/useAnalytics";

interface PipelineFunnelChartProps {
  /** Optional date range filter */
  dateRange?: DateRange;
}

/**
 * Custom tooltip content for the pipeline funnel bar chart.
 * Displays count and conversion rate for each stage.
 */
const PipelineFunnelTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PipelineStageDto }>;
}) => {
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 1.5,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {item.stage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("analytics.count")}: {item.count}
        </Typography>
        {item.conversionRate !== undefined && (
          <Typography variant="body2" color="primary">
            {t("analytics.conversion_rate")}: {item.conversionRate.toFixed(1)}%
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

/**
 * PipelineFunnelChart - Connected chart component that fetches and displays
 * the recruitment pipeline funnel with stage-by-stage candidate counts.
 *
 * Uses useAnalyticsPipeline hook to fetch real data and renders a horizontal
 * bar chart (layout="vertical") via Recharts.
 *
 * @example
 * ```tsx
 * <PipelineFunnelChart dateRange={{ startDate: '2025-01-01', endDate: '2025-12-31' }} />
 * ```
 */
const PipelineFunnelChart: React.FC<PipelineFunnelChartProps> = ({
  dateRange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data, isLoading, isError } = useAnalyticsPipeline(dateRange);

  // Build progressively-shaded color array for bars
  const stageColors = useMemo(
    () => [
      theme.palette.primary.light,
      theme.palette.primary.main,
      theme.palette.primary.dark,
      theme.palette.success.main,
    ],
    [theme],
  );

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
          <Skeleton variant="text" width="50%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  // Error or empty state
  if (isError || !data || !data.stages || data.stages.length === 0) {
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
            {t("analytics.pipeline_funnel")}
          </Typography>
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("analytics.no_pipeline_data")}
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
            mb: 0.5,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          {t("analytics.pipeline_funnel")}
        </Typography>

        {/* Subtitle */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("analytics.pipeline_funnel_subtitle")}
        </Typography>

        {/* Horizontal bar chart */}
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data.stages}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={110} />
            <Tooltip content={<PipelineFunnelTooltip />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.stages.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={stageColors[index % stageColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Overall conversion rate caption */}
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            {t("analytics.overall_conversion", {
              rate: data.overallConversionRate.toFixed(1),
            })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PipelineFunnelChart;
