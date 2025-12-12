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

  // Generate funnel colors (gradient from primary to success)
  const getFunnelColor = (index: number): string => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.primary.light,
      theme.palette.info.main,
      theme.palette.info.light,
      theme.palette.success.main,
    ];
    return colors[index % colors.length];
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t("analytics.conversion_funnel")}
      </Typography>

      <Box sx={{ mt: 3 }}>
        {data.map((stage, index) => {
          const widthPercentage = (stage.count / maxCount) * 100;

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
                    minWidth: "40%",
                    backgroundColor: getFunnelColor(index),
                    borderRadius: 1,
                    p: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="white"
                    textAlign="center"
                  >
                    {stage.fromStage}
                  </Typography>
                  <Typography
                    variant="h6"
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
                      gap: 1,
                      my: 1,
                    }}
                  >
                    <ArrowDownwardIcon
                      sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{
                        backgroundColor: theme.palette.action.hover,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
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
                      minWidth: "30%",
                      backgroundColor: getFunnelColor(index + 1),
                      borderRadius: 1,
                      p: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="white"
                      textAlign="center"
                    >
                      {stage.toStage}
                    </Typography>
                    <Typography
                      variant="h6"
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
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("analytics.funnel_summary")}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ConversionFunnel;
