import React from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAnalyticsSources, DateRange } from "../../hooks/api/useAnalytics";

/**
 * Color palette for donut chart slices
 */
const COLORS = [
  "#325CE7",
  "#B6C5F6",
  "#7CEA9C",
  "#FB5012",
  "#FEC4AF",
  "#96B59E",
];

/**
 * Props for the SourcesDonutChart component
 */
interface SourcesDonutChartProps {
  dateRange?: DateRange;
}

/**
 * Custom tooltip for the donut chart
 */
interface TooltipPayload {
  name: string;
  value: number;
  payload: { source: string; count: number; conversionRate: number };
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
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
        <Typography variant="body2" fontWeight={600}>
          {item.source}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("analytics.count")}: {item.count}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("analytics.conversion_rate")}:{" "}
          {(item.conversionRate * 100).toFixed(1)}%
        </Typography>
      </Box>
    );
  }
  return null;
};

/**
 * SourcesDonutChart - Applications by Source donut chart card
 *
 * Fetches source analytics via useAnalyticsSources and displays a donut chart
 * with an inner radius, plus a summary table below the chart.
 */
const SourcesDonutChart: React.FC<SourcesDonutChartProps> = ({ dateRange }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useAnalyticsSources(dateRange);

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
          {t("analytics.applications_by_source")}
        </Typography>

        {/* Loading state */}
        {isLoading && (
          <Box>
            <Skeleton
              variant="rectangular"
              height={260}
              sx={{ borderRadius: 1 }}
            />
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={32}
                  sx={{ borderRadius: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && (!data || data.length === 0) && (
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("analytics.no_source_data")}
            </Typography>
          </Box>
        )}

        {/* Chart and legend */}
        {!isLoading && data && data.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Summary table */}
            <Box
              sx={{
                mt: 1,
                borderTop: `1px solid ${theme.palette.divider}`,
                pt: 1.5,
              }}
            >
              {/* Table header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 1,
                  px: 1,
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  {t("analytics.source")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    textAlign: "right",
                  }}
                >
                  {t("analytics.count")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    textAlign: "right",
                    minWidth: 70,
                  }}
                >
                  {t("analytics.conversion_rate")}
                </Typography>
              </Box>

              {/* Table rows */}
              {data.map((item, index) => (
                <Box
                  key={item.source}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 1,
                    px: 1,
                    py: 0.75,
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        flexShrink: 0,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <Typography variant="body2" noWrap>
                      {item.source}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ textAlign: "right" }}
                  >
                    {item.count}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "right", minWidth: 70 }}
                  >
                    {(item.conversionRate * 100).toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SourcesDonutChart;
