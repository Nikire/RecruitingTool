import React from "react";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export interface KPICardProps {
  /** Title of the KPI */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Icon to display */
  icon: React.ReactNode;
  /** Background color (theme color or hex) */
  color?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Optional trend indicator (+5%, -3%, etc.) */
  trend?: string;
  /** Trend direction */
  trendDirection?: "up" | "down" | "neutral";
}

/**
 * KPICard - Displays a key performance indicator with icon and value
 *
 * Used in analytics dashboards to show important metrics like:
 * - Total candidates
 * - Active positions
 * - Average time to hire
 * - Conversion rates
 *
 * @example
 * ```tsx
 * <KPICard
 *   title={t('analytics.total_candidates')}
 *   value={1234}
 *   icon={<PeopleIcon />}
 *   color="primary.main"
 *   trend="+12%"
 *   trendDirection="up"
 * />
 * ```
 */
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  color = "primary.main",
  subtitle,
  isLoading = false,
  trend,
  trendDirection = "neutral",
}) => {
  const theme = useTheme();

  const getTrendColor = () => {
    if (trendDirection === "up") return theme.palette.success.main;
    if (trendDirection === "down") return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  if (isLoading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" width="60%" height={32} />
          </Box>
          <Skeleton variant="text" width="80%" height={48} />
          {subtitle && <Skeleton variant="text" width="50%" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: color,
              color: "white",
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: "bold",
            mb: subtitle || trend ? 1 : 0,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
          }}
        >
          {value}
        </Typography>

        {(subtitle || trend) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {trend && (
              <Typography
                variant="body2"
                sx={{
                  color: getTrendColor(),
                  fontWeight: 600,
                }}
              >
                {trend}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
