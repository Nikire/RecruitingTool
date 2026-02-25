import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  useAnalyticsStageDuration,
  type DateRange,
} from "../../hooks/api/useAnalytics";

interface StageDurationTableProps {
  /** Optional date range filter */
  dateRange?: DateRange;
}

/**
 * StageDurationTable - Displays stage duration bottleneck analysis as a sortable table.
 *
 * Rows are sorted by averageDuration descending (slowest stage first) to surface
 * bottlenecks at the top. The slowest stage is highlighted in a muted error color
 * and tagged with a "Bottleneck" chip.
 *
 * @example
 * ```tsx
 * <StageDurationTable dateRange={{ startDate: '2025-01-01', endDate: '2025-12-31' }} />
 * ```
 */
const StageDurationTable: React.FC<StageDurationTableProps> = ({
  dateRange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data, isLoading, isError } = useAnalyticsStageDuration(dateRange);

  // Sort stages by averageDuration descending so the slowest appears first
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => b.averageDuration - a.averageDuration);
  }, [data]);

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
          <Skeleton variant="text" width="55%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  // Error or empty state
  if (isError || sortedData.length === 0) {
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
            {t("analytics.stage_duration")}
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
              {t("analytics.no_stage_data")}
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
            mb: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          {t("analytics.stage_duration")}
        </Typography>

        {/* Table */}
        <TableContainer>
          <Table size="small" aria-label={t("analytics.stage_duration")}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  {t("analytics.stage")}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {t("analytics.average")}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {t("analytics.median")}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {t("analytics.completed")}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedData.map((row, index) => {
                const isBottleneck = index === 0;
                return (
                  <TableRow
                    key={row.stageType}
                    sx={
                      isBottleneck
                        ? {
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                          }
                        : undefined
                    }
                  >
                    {/* Stage name + optional bottleneck chip */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" fontWeight={isBottleneck ? 600 : 400}>
                          {row.stageType}
                        </Typography>
                        {isBottleneck && (
                          <Chip
                            label={t("analytics.bottleneck")}
                            color="error"
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Average duration */}
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.averageDuration} {t("analytics.days")}
                      </Typography>
                    </TableCell>

                    {/* Median duration */}
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.medianDuration} {t("analytics.days")}
                      </Typography>
                    </TableCell>

                    {/* Completed count */}
                    <TableCell align="right">
                      <Typography variant="body2">
                        {row.completedCount}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default StageDurationTable;
