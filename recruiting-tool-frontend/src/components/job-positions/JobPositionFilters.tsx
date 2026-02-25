import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  InputAdornment,
  Typography,
  Chip,
  Stack,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import { JobPositionStatus } from "../../types/jobPosition.types";

export interface JobPositionFiltersState {
  search: string;
  status: JobPositionStatus | "ALL";
  department: string;
  location: string;
  dateFrom: string | null;
  dateTo: string | null;
  sortBy: "createdAt" | "title" | "updatedAt";
  sortOrder: "asc" | "desc";
}

interface JobPositionFiltersProps {
  filters: JobPositionFiltersState;
  onChange: (filters: JobPositionFiltersState) => void;
}

const JobPositionFilters: React.FC<JobPositionFiltersProps> = ({
  filters,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: event.target.value,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      status: event.target.value as JobPositionStatus | "ALL",
    });
  };

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange({
      ...filters,
      department: event.target.value,
    });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      location: event.target.value,
    });
  };

  const handleDateFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      dateFrom: event.target.value || null,
    });
  };

  const handleDateToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      dateTo: event.target.value || null,
    });
  };

  const handleSortByChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      sortBy: event.target.value as "createdAt" | "title" | "updatedAt",
    });
  };

  const handleSortOrderChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange({
      ...filters,
      sortOrder: event.target.value as "asc" | "desc",
    });
  };

  const handleClearFilters = () => {
    onChange({
      search: "",
      status: "ALL",
      department: "ALL",
      location: "",
      dateFrom: null,
      dateTo: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "ALL" ||
    filters.department !== "ALL" ||
    filters.location !== "" ||
    filters.dateFrom !== null ||
    filters.dateTo !== null;

  const activeFilterCount = [
    filters.search !== "",
    filters.status !== "ALL",
    filters.department !== "ALL",
    filters.location !== "",
    filters.dateFrom !== null,
    filters.dateTo !== null,
  ].filter(Boolean).length;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder={t("job_position_filters.search_placeholder")}
          value={filters.search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={() => onChange({ ...filters, search: "" })}
                  sx={{ minWidth: "auto", p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Dropdowns and Inputs */}
        <Grid container spacing={2}>
          {/* Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label={t("job_position_filters.status_label")}
              value={filters.status}
              onChange={handleStatusChange}
              size="small"
            >
              <MenuItem value="ALL">
                {t("job_position_filters.all_statuses")}
              </MenuItem>
              <MenuItem value="OPEN">{t("status.open")}</MenuItem>
              <MenuItem value="CLOSED">{t("status.closed")}</MenuItem>
              <MenuItem value="CANCELLED">{t("status.cancelled")}</MenuItem>
            </TextField>
          </Grid>

          {/* Department Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label={t("job_position_filters.department_label")}
              value={filters.department}
              onChange={handleDepartmentChange}
              size="small"
            >
              <MenuItem value="ALL">
                {t("job_position_filters.all_departments")}
              </MenuItem>
              <MenuItem value="engineering">
                {t("job_position_filters.engineering")}
              </MenuItem>
              <MenuItem value="marketing">
                {t("job_position_filters.marketing")}
              </MenuItem>
              <MenuItem value="sales">
                {t("job_position_filters.sales")}
              </MenuItem>
              <MenuItem value="hr">{t("job_position_filters.hr")}</MenuItem>
              <MenuItem value="finance">
                {t("job_position_filters.finance")}
              </MenuItem>
              <MenuItem value="operations">
                {t("job_position_filters.operations")}
              </MenuItem>
            </TextField>
          </Grid>

          {/* Location Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label={t("job_position_filters.location_label")}
              placeholder={t("job_position_filters.location_placeholder")}
              value={filters.location}
              onChange={handleLocationChange}
              size="small"
            />
          </Grid>

          {/* Sort By */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label={t("job_position_filters.sort_by_label")}
              value={filters.sortBy}
              onChange={handleSortByChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="createdAt">
                {t("job_position_filters.sort_newest")}
              </MenuItem>
              <MenuItem value="title">
                {t("job_position_filters.sort_title")}
              </MenuItem>
              <MenuItem value="updatedAt">
                {t("job_position_filters.sort_updated")}
              </MenuItem>
            </TextField>
          </Grid>

          {/* Date From */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label={t("job_position_filters.date_from_label")}
              value={filters.dateFrom || ""}
              onChange={handleDateFromChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Date To */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label={t("job_position_filters.date_to_label")}
              value={filters.dateTo || ""}
              onChange={handleDateToChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Sort Order */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label={t("job_position_filters.sort_order_label")}
              value={filters.sortOrder}
              onChange={handleSortOrderChange}
              size="small"
            >
              <MenuItem value="desc">
                {t("job_position_filters.sort_descending")}
              </MenuItem>
              <MenuItem value="asc">
                {t("job_position_filters.sort_ascending")}
              </MenuItem>
            </TextField>
          </Grid>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                fullWidth
                size="small"
              >
                {t("job_position_filters.clear_filters")}
              </Button>
            </Grid>
          )}
        </Grid>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {t("job_position_filters.active_filters", {
                count: activeFilterCount,
              })}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
            >
              {filters.search && (
                <Chip
                  label={`${t("common.search")}: ${filters.search}`}
                  size="small"
                  onDelete={() => onChange({ ...filters, search: "" })}
                />
              )}
              {filters.status !== "ALL" && (
                <Chip
                  label={`${t("job_position_filters.status_label")}: ${t(
                    `status.${filters.status.toLowerCase()}`,
                  )}`}
                  size="small"
                  onDelete={() => onChange({ ...filters, status: "ALL" })}
                />
              )}
              {filters.department !== "ALL" && (
                <Chip
                  label={`${t("job_position_filters.department_label")}: ${t(
                    `job_position_filters.${filters.department}`,
                  )}`}
                  size="small"
                  onDelete={() => onChange({ ...filters, department: "ALL" })}
                />
              )}
              {filters.location && (
                <Chip
                  label={`${t("job_position_filters.location_label")}: ${filters.location}`}
                  size="small"
                  onDelete={() => onChange({ ...filters, location: "" })}
                />
              )}
              {filters.dateFrom && (
                <Chip
                  label={`${t("job_position_filters.date_from_label")}: ${filters.dateFrom}`}
                  size="small"
                  onDelete={() => onChange({ ...filters, dateFrom: null })}
                />
              )}
              {filters.dateTo && (
                <Chip
                  label={`${t("job_position_filters.date_to_label")}: ${filters.dateTo}`}
                  size="small"
                  onDelete={() => onChange({ ...filters, dateTo: null })}
                />
              )}
            </Stack>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default JobPositionFilters;
