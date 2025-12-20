import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { StageConversionRate } from "../../types/analytics";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface ConversionFunnelProps {
  data: StageConversionRate[];
}

/**
 * ConversionFunnel Component
 *
 * Displays a visual funnel showing stage conversion rates.
 * Shows how candidates progress through hiring stages.
 */
const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
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

  // Calculate max count for width scaling
  const maxCount = Math.max(...data.map((item) => item.count));

  // Generate funnel colors with better visual progression
  const getFunnelColor = (index: number): string => {
    const colors = [
      theme.palette.primary.dark,
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.light,
      theme.palette.success.main,
    ];
    return colors[index % colors.length];
  };

  // Get rate color based on conversion percentage
  const getRateColor = (rate: number): string => {
    if (rate >= 70) return theme.palette.success.main;
    if (rate >= 50) return theme.palette.info.main;
    if (rate >= 30) return theme.palette.warning.main;
    return theme.palette.error.main;
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
      >
        <Typography variant="h6" fontWeight={600}>
          {t("analytics.conversion_funnel")}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {t("analytics.total_candidates")}: {maxCount}
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        {data.map((stage, index) => {
          const widthPercentage = (stage.count / maxCount) * 100;
          const funnelColor = getFunnelColor(index);

          return (
            <Box key={index}>
              {/* Stage Bar */}
              <Box
                sx={{
                  mb: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* From Stage */}
                <Box
                  sx={{
                    width: `${widthPercentage}%`,
                    minWidth: "45%",
                    background: `linear-gradient(135deg, ${funnelColor}, ${funnelColor}CC)`,
                    borderRadius: 2,
                    p: 2.5,
                    px: 3,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    boxShadow: theme.shadows[2],
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: theme.shadows[6],
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::after": {
                      opacity: 1,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="white"
                    textAlign="center"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontSize: "0.75rem",
                      mb: 0.5,
                    }}
                  >
                    {stage.fromStage}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="white"
                    textAlign="center"
                  >
                    {stage.count}
                  </Typography>
                </Box>

                {/* Conversion Rate Arrow */}
                {index < data.length && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      my: 1.5,
                    }}
                  >
                    <ArrowDownwardIcon
                      sx={{
                        color: getRateColor(stage.rate),
                        fontSize: 24,
                        fontWeight: "bold",
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: getRateColor(stage.rate),
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.04)",
                        px: 2,
                        py: 0.75,
                        borderRadius: 2,
                        border: `2px solid ${getRateColor(stage.rate)}`,
                        fontSize: "0.875rem",
                      }}
                    >
                      {stage.rate}%
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Final Stage (shown after last conversion) */}
              {index === data.length - 1 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: `${(Math.floor((stage.count * stage.rate) / 100) / maxCount) * 100}%`,
                      minWidth: "35%",
                      background: `linear-gradient(135deg, ${getFunnelColor(index + 1)}, ${getFunnelColor(index + 1)}CC)`,
                      borderRadius: 2,
                      p: 2.5,
                      px: 3,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      boxShadow: theme.shadows[2],
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: theme.shadows[6],
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: 2,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                      "&:hover::after": {
                        opacity: 1,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="white"
                      textAlign="center"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontSize: "0.75rem",
                        mb: 0.5,
                      }}
                    >
                      {stage.toStage}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="white"
                      textAlign="center"
                    >
                      {Math.floor((stage.count * stage.rate) / 100)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Summary */}
      <Box
        sx={{
          mt: 4,
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
          {t("analytics.funnel_summary")}
        </Typography>
        <Box display="flex" gap={3}>
          <Box textAlign="center">
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t("analytics.total_candidates")}
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              {maxCount}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t("analytics.conversion_rate")}
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {data.length > 0
                ? Math.round(
                    (Math.floor(
                      (data[data.length - 1].count *
                        data[data.length - 1].rate) /
                        100,
                    ) /
                      maxCount) *
                      100,
                  )
                : 0}
              %
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ConversionFunnel;
