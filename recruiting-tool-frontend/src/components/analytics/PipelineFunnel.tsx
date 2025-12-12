import React from "react";
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

export interface PipelineFunnelData {
  /** Stage name */
  stage: string;
  /** Number of candidates at this stage */
  count: number;
  /** Conversion rate from previous stage (optional) */
  conversionRate?: number;
}

export interface PipelineFunnelProps {
  /** Funnel data for each stage */
  data: PipelineFunnelData[];
  /** Loading state */
  isLoading?: boolean;
  /** Chart title */
  title?: string;
}

/**
 * PipelineFunnel - Displays recruitment pipeline as a funnel chart
 *
 * Shows the conversion funnel from applications to hires:
 * - Applications
 * - Interviews
 * - Offers
 * - Hires
 *
 * Visualizes drop-off rates at each stage.
 *
 * @example
 * ```tsx
 * const funnelData = [
 *   { stage: 'Applications', count: 1000 },
 *   { stage: 'Interviews', count: 250, conversionRate: 25 },
 *   { stage: 'Offers', count: 50, conversionRate: 20 },
 *   { stage: 'Hires', count: 45, conversionRate: 90 },
 * ];
 *
 * <PipelineFunnel data={funnelData} title={t('analytics.conversion_funnel')} />
 * ```
 */
const PipelineFunnel: React.FC<PipelineFunnelProps> = ({
  data,
  isLoading = false,
  title,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Colors for each stage (progressively darker shades)
  const stageColors = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
    theme.palette.success.main,
  ];

  if (isLoading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          {title && (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("analytics.no_data")}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: PipelineFunnelData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.stage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("analytics.count")}: {data.count}
          </Typography>
          {data.conversionRate !== undefined && (
            <Typography variant="body2" color="primary">
              {t("analytics.conversion_rate")}: {data.conversionRate.toFixed(1)}
              %
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={stageColors[index % stageColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        {data.length > 1 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              {t("analytics.funnel_summary")}:{" "}
              <Typography
                component="span"
                variant="body2"
                fontWeight="bold"
                color="primary"
              >
                {((data[data.length - 1].count / data[0].count) * 100).toFixed(
                  1,
                )}
                %
              </Typography>
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PipelineFunnel;
