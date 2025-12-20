import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { MetricCardData } from "../../types/analytics";

interface MetricCardProps {
  data: MetricCardData;
}

/**
 * MetricCard Component
 *
 * Displays a single metric with optional trend indicator.
 * Used in analytics overview section to show key metrics.
 */
const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getTrendIcon = () => {
    if (!data.trend) return null;

    switch (data.trend) {
      case "up":
        return (
          <TrendingUpIcon fontSize="small" sx={{ color: "success.main" }} />
        );
      case "down":
        return (
          <TrendingDownIcon fontSize="small" sx={{ color: "error.main" }} />
        );
      case "neutral":
        return (
          <TrendingFlatIcon fontSize="small" sx={{ color: "text.secondary" }} />
        );
    }
  };

  const getTrendColor = () => {
    if (!data.trend) return undefined;

    switch (data.trend) {
      case "up":
        return "success";
      case "down":
        return "error";
      case "neutral":
        return "default";
    }
  };

  const formatTrendValue = () => {
    if (data.trendValue === undefined) return null;

    const sign = data.trendValue >= 0 ? "+" : "";
    return `${sign}${data.trendValue}%`;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          boxShadow: theme.shadows[8],
          transform: "translateY(-4px)",
          borderColor: data.color || theme.palette.primary.main,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${data.color || theme.palette.primary.main}, ${theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[300]})`,
        },
      }}
    >
      <CardContent sx={{ pt: 3, pb: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2.5}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
            sx={{
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: "0.75rem",
            }}
          >
            {data.title}
          </Typography>
          {data.icon && (
            <Box
              sx={{
                color: data.color || theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : `${data.color || theme.palette.primary.main}15`,
                borderRadius: 2,
                p: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "rotate(5deg) scale(1.1)",
                },
              }}
            >
              {data.icon}
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="baseline" gap={1.5} mb={1.5}>
          <Typography
            variant="h3"
            component="div"
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${data.color || theme.palette.primary.main}, ${theme.palette.mode === "dark" ? theme.palette.grey[400] : theme.palette.grey[700]})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            {data.value}
          </Typography>
          {data.unit && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {data.unit}
            </Typography>
          )}
        </Box>

        {data.trend && data.trendValue !== undefined && (
          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <Chip
              icon={getTrendIcon() || undefined}
              label={formatTrendValue()}
              size="small"
              color={getTrendColor()}
              variant="filled"
              sx={{
                height: 26,
                fontSize: "0.75rem",
                fontWeight: 700,
                boxShadow: theme.shadows[1],
              }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {t("analytics.vs_last_period")}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
