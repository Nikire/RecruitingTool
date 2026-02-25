import React from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  useAnalyticsSourceEffectiveness,
  DateRange,
} from "../../hooks/api/useAnalytics";

/**
 * Color palette matching the Recharts palette used across analytics charts
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
 * Props for the SourceEffectivenessTable component
 */
interface SourceEffectivenessTableProps {
  dateRange?: DateRange;
}

/**
 * SourceEffectivenessTable - Displays source effectiveness analysis in a table
 *
 * Shows each application source with total applications, hires, success rate,
 * average time to hire, and optionally AI quality score (shown only when data
 * has at least one row with averageQualityScore defined).
 *
 * Data is sorted by successRate descending (best sources first).
 */
const SourceEffectivenessTable: React.FC<SourceEffectivenessTableProps> = ({
  dateRange,
}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useAnalyticsSourceEffectiveness(dateRange);

  // Sort by successRate descending - best sources first
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.successRate - a.successRate);
  }, [data]);

  // Show AI Quality Score column only if at least one row has the value
  const showQualityScore = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return false;
    return sortedData.some((row) => row.averageQualityScore != null);
  }, [sortedData]);

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
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
          {t("analytics.source_effectiveness")}
        </Typography>

        {/* Loading state */}
        {isLoading && (
          <Skeleton
            variant="rectangular"
            height={260}
            sx={{ borderRadius: 1 }}
          />
        )}

        {/* Empty state */}
        {!isLoading && sortedData.length === 0 && (
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
              {t("analytics.no_source_effectiveness_data")}
            </Typography>
          </Box>
        )}

        {/* Table */}
        {!isLoading && sortedData.length > 0 && (
          <TableContainer>
            <Table size="small" aria-label={t("analytics.source_effectiveness")}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t("analytics.source")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {t("analytics.total_applications_col")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {t("analytics.hires_col")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {t("analytics.success_rate")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {t("analytics.avg_time_to_hire_col")}
                  </TableCell>
                  {showQualityScore && (
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {t("analytics.ai_quality_score")}
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((row, index) => (
                  <TableRow
                    key={row.source}
                    sx={{
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                      "&:last-child td": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: COLORS[index % COLORS.length],
                            mr: 1,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2">{row.source}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.totalApplications}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{row.hires}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {(row.successRate * 100).toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.averageTimeToHire} {t("analytics.days")}
                      </Typography>
                    </TableCell>
                    {showQualityScore && (
                      <TableCell align="right">
                        <Typography variant="body2">
                          {row.averageQualityScore != null
                            ? row.averageQualityScore.toFixed(1)
                            : "—"}
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceEffectivenessTable;
