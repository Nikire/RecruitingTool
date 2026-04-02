import React, { memo } from "react";
import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Slider,
  SelectChangeEvent,
  Avatar,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import FilterListIcon from "@mui/icons-material/FilterList";
import BusinessIcon from "@mui/icons-material/Business";
import JobSearchFilters from "./JobSearchFilters";

interface Company {
  uid: string;
  name: string;
  logoUrl?: string;
}

interface FilterSidebarProps {
  search: string;
  company: string;
  category: string;
  jobType: string;
  workLocation: string;
  experienceLevel: string;
  salaryRange: number[];
  activeFilterCount: number;
  companies: Company[];
  isLoadingCompanies: boolean;
  minSalary: number;
  maxSalary: number;
  salaryStep: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onSalaryRangeChange: (event: Event, newValue: number | number[]) => void;
  onClearFilters: () => void;
  formatSalary: (value: number) => string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = memo(
  ({
    search,
    company,
    category,
    jobType,
    workLocation,
    experienceLevel,
    salaryRange,
    activeFilterCount,
    companies,
    isLoadingCompanies,
    minSalary,
    maxSalary,
    salaryStep,
    onSearchChange,
    onFilterChange,
    onSalaryRangeChange,
    onClearFilters,
    formatSalary,
  }) => {
    const { t } = useTranslation();

    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          position: "sticky",
          top: 24,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FilterListIcon />
            {t("careersFilters.filters")}
          </Typography>
          {activeFilterCount > 0 && (
            <Button size="small" onClick={onClearFilters}>
              {t("careersFilters.clear_all")}
            </Button>
          )}
        </Box>

        <Stack spacing={3}>
          {/* Search */}
          <JobSearchFilters search={search} onSearchChange={onSearchChange} />

          {/* Company Filter */}
          <Autocomplete<Company>
            options={companies}
            value={companies.find((c) => c.uid === company) ?? null}
            onChange={(_event, newValue) =>
              onFilterChange("company", newValue ? newValue.uid : "")
            }
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.uid === value.uid}
            loading={isLoadingCompanies}
            clearOnEscape
            size="small"
            renderOption={(props, option) => {
              const { key, ...restProps } =
                props as React.HTMLAttributes<HTMLLIElement> & {
                  key: React.Key;
                };
              return (
                <Box
                  component="li"
                  key={key}
                  {...restProps}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {option.logoUrl ? (
                    <Avatar
                      src={option.logoUrl}
                      alt={option.name}
                      sx={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <BusinessIcon
                      sx={{ fontSize: 20, color: "text.secondary" }}
                    />
                  )}
                  <Typography variant="body2">{option.name}</Typography>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("careersFilters.company")}
                placeholder={t("careersFilters.company_search_placeholder")}
              />
            )}
          />

          {/* Category Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>{t("careersFilters.category")}</InputLabel>
            <Select
              value={category}
              onChange={(e: SelectChangeEvent) =>
                onFilterChange("category", e.target.value)
              }
              label={t("careersFilters.category")}
            >
              <MenuItem value="">{t("careersFilters.all_categories")}</MenuItem>
              <MenuItem value="Engineering">
                {t("careersFilters.engineering")}
              </MenuItem>
              <MenuItem value="Marketing">
                {t("careersFilters.marketing")}
              </MenuItem>
              <MenuItem value="Sales">{t("careersFilters.sales")}</MenuItem>
              <MenuItem value="Design">{t("careersFilters.design")}</MenuItem>
              <MenuItem value="Product">{t("careersFilters.product")}</MenuItem>
            </Select>
          </FormControl>

          {/* Job Type Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>{t("careersFilters.job_type")}</InputLabel>
            <Select
              value={jobType}
              onChange={(e: SelectChangeEvent) =>
                onFilterChange("jobType", e.target.value)
              }
              label={t("careersFilters.job_type")}
            >
              <MenuItem value="">{t("careersFilters.all_types")}</MenuItem>
              <MenuItem value="FULL_TIME">
                {t("careersFilters.full_time")}
              </MenuItem>
              <MenuItem value="PART_TIME">
                {t("careersFilters.part_time")}
              </MenuItem>
              <MenuItem value="CONTRACT">
                {t("careersFilters.contract")}
              </MenuItem>
              <MenuItem value="INTERNSHIP">
                {t("careersFilters.internship")}
              </MenuItem>
              <MenuItem value="TEMPORARY">
                {t("careersFilters.temporary")}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Work Location Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>{t("careersFilters.work_location")}</InputLabel>
            <Select
              value={workLocation}
              onChange={(e: SelectChangeEvent) =>
                onFilterChange("workLocation", e.target.value)
              }
              label={t("careersFilters.work_location")}
            >
              <MenuItem value="">{t("careersFilters.all_locations")}</MenuItem>
              <MenuItem value="REMOTE">{t("careersFilters.remote")}</MenuItem>
              <MenuItem value="HYBRID">{t("careersFilters.hybrid")}</MenuItem>
              <MenuItem value="ON_SITE">{t("careersFilters.onsite")}</MenuItem>
            </Select>
          </FormControl>

          {/* Experience Level Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>{t("careersFilters.experience_level")}</InputLabel>
            <Select
              value={experienceLevel}
              onChange={(e: SelectChangeEvent) =>
                onFilterChange("experienceLevel", e.target.value)
              }
              label={t("careersFilters.experience_level")}
            >
              <MenuItem value="">{t("careersFilters.all_levels")}</MenuItem>
              <MenuItem value="ENTRY">
                {t("careersFilters.entry_level")}
              </MenuItem>
              <MenuItem value="MID">{t("careersFilters.mid_level")}</MenuItem>
              <MenuItem value="SENIOR">
                {t("careersFilters.senior_level")}
              </MenuItem>
              <MenuItem value="LEAD">{t("careersFilters.lead_level")}</MenuItem>
              <MenuItem value="EXECUTIVE">
                {t("careersFilters.executive_level")}
              </MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {/* Salary Range Filter */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              {t("careersFilters.salary_range")}
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              sx={{ mb: 2, fontWeight: 500, textAlign: "center" }}
            >
              {formatSalary(salaryRange[0])} - {formatSalary(salaryRange[1])}
            </Typography>
            <Slider
              value={salaryRange}
              onChange={onSalaryRangeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatSalary}
              min={minSalary}
              max={maxSalary}
              step={salaryStep}
              marks={[
                { value: minSalary, label: formatSalary(minSalary) },
                { value: maxSalary, label: formatSalary(maxSalary) },
              ]}
              sx={{
                "& .MuiSlider-markLabel": {
                  fontSize: "0.75rem",
                },
              }}
            />
          </Box>
        </Stack>
      </Paper>
    );
  },
);

FilterSidebar.displayName = "FilterSidebar";

export default FilterSidebar;
