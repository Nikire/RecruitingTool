import React, { memo } from "react";
import { Grid, Box, Typography, Button, Pagination } from "@mui/material";
import { useTranslation } from "react-i18next";
import { JobPosition } from "../../types/jobPosition.types";
import CompactJobCard from "./CompactJobCard";
import WorkIcon from "@mui/icons-material/Work";
import SearchOffIcon from "@mui/icons-material/SearchOff";

interface JobCardsGridProps {
  jobPositions: JobPosition[];
  isLoading: boolean;
  error: Error | null;
  openJobsCount: number;
  hasActiveFilters: boolean;
  hasSearchQuery: boolean;
  totalPages: number;
  currentPage: number;
  isMobile: boolean;
  onApplyClick: (uid: string, title: string) => void;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onClearFilters: () => void;
}

const JobCardsGrid: React.FC<JobCardsGridProps> = memo(
  ({
    jobPositions,
    isLoading,
    error,
    openJobsCount,
    hasActiveFilters,
    hasSearchQuery,
    totalPages,
    currentPage,
    isMobile,
    onApplyClick,
    onPageChange,
    onClearFilters,
  }) => {
    const { t } = useTranslation();

    // Loading state
    if (isLoading) {
      return null; // Parent handles loading skeletons
    }

    // Error state
    if (error) {
      return (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="error" variant="h6" gutterBottom>
            {t("errors.fetch_failed")}
          </Typography>
          <Typography color="text.secondary">
            {t("errors.try_again")}
          </Typography>
        </Box>
      );
    }

    // Empty state - no jobs
    if (openJobsCount === 0 && !hasSearchQuery && !hasActiveFilters) {
      return (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <WorkIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {t("careers.no_positions_yet")}
          </Typography>
          <Typography color="text.secondary">
            {t("careers.check_back_soon")}
          </Typography>
        </Box>
      );
    }

    // Empty state - no search/filter results
    if (openJobsCount === 0 && (hasSearchQuery || hasActiveFilters)) {
      return (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <SearchOffIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {t("careers.no_results_found")}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t("careers.try_different_keywords")}
          </Typography>
          <Button variant="outlined" onClick={onClearFilters}>
            {t("careersFilters.clear_all")}
          </Button>
        </Box>
      );
    }

    // Job cards grid with data
    return (
      <>
        <Grid container spacing={3}>
          {jobPositions.map((job) => (
            <Grid
              key={job.uid}
              size={{ xs: 12, sm: 6, lg: 4 }}
              sx={{
                overflow: "visible",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CompactJobCard jobPosition={job} onApplyClick={onApplyClick} />
            </Grid>
          ))}
        </Grid>

        {/* Pagination — always show when there is more than one page */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              mt: 6,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={onPageChange}
              color="primary"
              size={isMobile ? "medium" : "large"}
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t("careersResults.page_of_total", {
                page: currentPage,
                total: totalPages,
              })}
            </Typography>
          </Box>
        )}
      </>
    );
  },
);

JobCardsGrid.displayName = "JobCardsGrid";

export default JobCardsGrid;
