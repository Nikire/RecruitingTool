import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import FilterChip from "./FilterChip";
import { ActiveFilter } from "../../types/search";

export interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemoveFilter: (filterType: string) => void;
  onClearAll: () => void;
  resultsCount?: number;
}

/**
 * ActiveFilters Component
 *
 * Displays all active filters as removable chips with a clear all button.
 * Shows the count of matching results.
 *
 * @param filters - Array of active filters to display
 * @param onRemoveFilter - Callback when a single filter is removed
 * @param onClearAll - Callback when all filters are cleared
 * @param resultsCount - Optional count of matching results
 */
const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  resultsCount,
}) => {
  const { t } = useTranslation();

  if (filters.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 1,
        mb: 2,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        <Typography variant="body2" fontWeight="medium" sx={{ mr: 1 }}>
          {t("search.active_filters")}:
        </Typography>
        {filters.map((filter, index) => (
          <FilterChip
            key={`${filter.type}-${index}`}
            label={filter.displayValue}
            onDelete={() => onRemoveFilter(filter.type)}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "space-between", sm: "flex-end" },
        }}
      >
        {resultsCount !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {t("search.results_count", { count: resultsCount })}
          </Typography>
        )}
        <Button size="small" onClick={onClearAll} variant="outlined">
          {t("search.clear_all")}
        </Button>
      </Box>
    </Box>
  );
};

export default ActiveFilters;
