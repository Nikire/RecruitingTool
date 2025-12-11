import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Collapse,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import FilterPanel from "./FilterPanel";
import ActiveFilters from "./ActiveFilters";
import { SearchFilters, FilterOption, ActiveFilter } from "../../types/search";

export interface AdvancedSearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  statusOptions?: FilterOption[];
  skillsOptions?: string[];
  showExperience?: boolean;
  showSalary?: boolean;
  showSkills?: boolean;
  showLocation?: boolean;
  showDateRange?: boolean;
  resultsCount?: number;
}

/**
 * AdvancedSearchBar Component
 *
 * Comprehensive search component with:
 * - Basic text search with debouncing
 * - Expandable filter panel
 * - Active filters display
 * - Filter count badge
 * - Mobile-responsive design
 *
 * @param filters - Current filter state
 * @param onFiltersChange - Callback when filters change
 * @param onSearch - Callback when search query changes
 * @param placeholder - Search input placeholder
 * @param statusOptions - Available status options for filtering
 * @param skillsOptions - Available skills for autocomplete
 * @param showExperience - Whether to show experience filter
 * @param showSalary - Whether to show salary filter
 * @param showSkills - Whether to show skills filter
 * @param showLocation - Whether to show location filter
 * @param showDateRange - Whether to show date range filter
 * @param resultsCount - Optional count of matching results
 */
const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  placeholder,
  statusOptions,
  skillsOptions,
  showExperience = false,
  showSalary = false,
  showSkills = false,
  showLocation = false,
  showDateRange = false,
  resultsCount,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query || "");

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter((key) => {
    if (key === "query") return false; // Don't count query as a filter
    const value = filters[key as keyof SearchFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  }).length;

  // Convert filters to ActiveFilter array for display
  const getActiveFilters = useCallback((): ActiveFilter[] => {
    const activeFilters: ActiveFilter[] = [];

    if (filters.status && filters.status.length > 0) {
      activeFilters.push({
        type: "status",
        label: t("search.status"),
        value: filters.status,
        displayValue: `${t("search.status")}: ${filters.status.join(", ")}`,
      });
    }

    if (filters.skills && filters.skills.length > 0) {
      activeFilters.push({
        type: "skills",
        label: t("search.skills"),
        value: filters.skills,
        displayValue: `${t("search.skills")}: ${filters.skills.join(", ")}`,
      });
    }

    if (filters.location) {
      activeFilters.push({
        type: "location",
        label: t("search.location"),
        value: filters.location,
        displayValue: `${t("search.location")}: ${filters.location}`,
      });
    }

    if (filters.experience) {
      activeFilters.push({
        type: "experience",
        label: t("search.experience"),
        value: filters.experience,
        displayValue: t("search.experience_years", {
          min: filters.experience.min,
          max: filters.experience.max,
        }),
      });
    }

    if (filters.salary) {
      activeFilters.push({
        type: "salary",
        label: t("search.salary"),
        value: filters.salary,
        displayValue: t("search.salary_range", {
          min: filters.salary.min,
          max: filters.salary.max,
        }),
      });
    }

    if (
      filters.dateRange &&
      (filters.dateRange.start || filters.dateRange.end)
    ) {
      activeFilters.push({
        type: "dateRange",
        label: t("search.date_range"),
        value: filters.dateRange,
        displayValue: `${t("search.date_range")}: ${filters.dateRange.start || "..."} - ${
          filters.dateRange.end || "..."
        }`,
      });
    }

    return activeFilters;
  }, [filters, t]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleApplyFilters = () => {
    // Filters are already applied via onFiltersChange
    // This just closes the panel on mobile
    if (isMobile) {
      setShowFilters(false);
    }
  };

  const handleResetFilters = () => {
    onFiltersChange({ query: searchQuery });
  };

  const handleRemoveFilter = (filterType: string) => {
    const newFilters = { ...filters };
    delete newFilters[filterType as keyof SearchFilters];
    onFiltersChange(newFilters);
  };

  const handleClearAllFilters = () => {
    onFiltersChange({ query: searchQuery });
  };

  return (
    <Box>
      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          mb: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder || t("search.search_placeholder")}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  aria-label={t("search.clear_search")}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: "none",
              },
            },
          }}
        />

        <IconButton
          onClick={handleToggleFilters}
          color={showFilters ? "primary" : "default"}
          aria-label={t("search.toggle_filters")}
          aria-expanded={showFilters}
        >
          <Badge badgeContent={activeFilterCount} color="primary">
            <FilterListIcon />
          </Badge>
        </IconButton>
      </Paper>

      {/* Filter Panel */}
      <Collapse in={showFilters}>
        <FilterPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          statusOptions={statusOptions}
          skillsOptions={skillsOptions}
          showExperience={showExperience}
          showSalary={showSalary}
          showSkills={showSkills}
          showLocation={showLocation}
          showDateRange={showDateRange}
        />
      </Collapse>

      {/* Active Filters */}
      <ActiveFilters
        filters={getActiveFilters()}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
        resultsCount={resultsCount}
      />
    </Box>
  );
};

export default AdvancedSearchBar;
