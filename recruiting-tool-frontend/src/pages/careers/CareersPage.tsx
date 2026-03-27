import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Typography,
  Box,
  Container,
  Stack,
  Chip,
  Drawer,
  IconButton,
  Button,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePublicJobPositions } from "../../hooks/api/useJobPositions";
import { usePublicCompaniesWithJobs } from "../../hooks/api/useCompanies";
import { PublicJobPositionFilters } from "../../api/jobPositions";
import JobSearchFilters from "../../components/careers/JobSearchFilters";
import { ApplyToJobDialog } from "../../components/dialogs/ApplyToJobDialog";
import { useDialog } from "../../hooks/useDialog";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FilterSidebar from "../../components/careers/FilterSidebar";
import JobCardsGrid from "../../components/careers/JobCardsGrid";
import LoadingSkeletons from "../../components/careers/LoadingSkeletons";

interface Filters {
  search: string;
  category: string;
  jobType: string;
  workLocation: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  company: string;
}

const ITEMS_PER_PAGE = 9;
const MIN_SALARY = 0;
const MAX_SALARY = 300000;
const SALARY_STEP = 5000;

const CareersPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Dialog state
  const applyDialog = useDialog<{ uid: string; title: string }>();

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    jobType: "",
    workLocation: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    company: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);

  // Mobile filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Salary range state for slider (separate from filters for debouncing)
  const [salaryRange, setSalaryRange] = useState<number[]>([
    MIN_SALARY,
    MAX_SALARY,
  ]);

  // Debounce timer ref
  const salaryDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch companies with open job positions
  const { data: companiesData, isLoading: isLoadingCompanies } =
    usePublicCompaniesWithJobs();
  const companies = useMemo(() => companiesData || [], [companiesData]);

  // Determine which company to show in the header section.
  // Show the selected company when a filter is active, or the only company when there's exactly one.
  const selectedCompany = useMemo(() => {
    if (filters.company) {
      return companies.find((c) => c.uid === filters.company) || null;
    }
    return null;
  }, [filters.company, companies]);

  // Build API filters from UI state
  const apiFilters: PublicJobPositionFilters = useMemo(() => {
    const params: PublicJobPositionFilters = {
      page,
      limit: ITEMS_PER_PAGE,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.workLocation) params.workLocation = filters.workLocation;
    if (filters.experienceLevel)
      params.experienceLevel = filters.experienceLevel;
    if (filters.salaryMin) params.salaryMin = parseInt(filters.salaryMin);
    if (filters.salaryMax) params.salaryMax = parseInt(filters.salaryMax);
    if (filters.company) params.companyUid = filters.company; // Pass companyUid directly

    return params;
  }, [filters, page]);

  // Fetch public job positions with server-side filtering
  const { data, isLoading, error } = usePublicJobPositions(apiFilters, {
    enabled: true,
  });

  const jobPositions = useMemo(() => data?.data || [], [data?.data]);
  const totalPages = useMemo(() => data?.totalPages || 0, [data?.totalPages]);
  const openJobsCount = useMemo(() => data?.total || 0, [data?.total]);

  // Memoized handlers to prevent re-creating functions on every render
  const handleApplyClick = useCallback(
    (uid: string, title: string) => {
      applyDialog.openWith({ uid, title });
    },
    [applyDialog],
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "",
      jobType: "",
      workLocation: "",
      experienceLevel: "",
      salaryMin: "",
      salaryMax: "",
      company: "",
    });
    setSalaryRange([MIN_SALARY, MAX_SALARY]);
    setPage(1);
  }, []);

  // Debounced salary range handler (500ms delay)
  const handleSalaryRangeChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const range = newValue as number[];
      setSalaryRange(range); // Update UI immediately

      // Clear previous timer
      if (salaryDebounceTimer.current) {
        clearTimeout(salaryDebounceTimer.current);
      }

      // Set new timer to update filters after delay
      salaryDebounceTimer.current = setTimeout(() => {
        setFilters((prev) => ({
          ...prev,
          salaryMin: range[0] === MIN_SALARY ? "" : range[0].toString(),
          salaryMax: range[1] === MAX_SALARY ? "" : range[1].toString(),
        }));
        setPage(1);
      }, 500); // 500ms debounce
    },
    [],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (salaryDebounceTimer.current) {
        clearTimeout(salaryDebounceTimer.current);
      }
    };
  }, []);

  const formatSalary = useCallback((value: number): string => {
    if (value === 0) return "$0";
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  }, []);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "search" && value !== "",
    ).length;
  }, [filters]);

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Company header section — shown when a company is selected or only one company exists */}
        {selectedCompany && (
          <Box
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "flex-start",
              gap: 2.5,
              flexWrap: "wrap",
            }}
          >
            {/* Logo */}
            {selectedCompany.logoUrl ? (
              <Avatar
                src={selectedCompany.logoUrl}
                alt={selectedCompany.name}
                sx={{ width: 80, height: 80, boxShadow: 2, flexShrink: 0 }}
                variant="rounded"
              />
            ) : (
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  boxShadow: 2,
                  flexShrink: 0,
                }}
                variant="rounded"
              >
                {selectedCompany.name.charAt(0).toUpperCase()}
              </Avatar>
            )}

            {/* Company details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedCompany.name}
              </Typography>

              {/* Industry chip */}
              {selectedCompany.industry && (
                <Chip
                  label={selectedCompany.industry}
                  size="small"
                  variant="filled"
                  sx={{ mb: 1, fontSize: "0.75rem" }}
                />
              )}

              {/* Description */}
              {selectedCompany.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {selectedCompany.description}
                </Typography>
              )}

              {/* Website button */}
              {selectedCompany.website && (
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  href={selectedCompany.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ fontSize: "0.75rem", py: 0.5 }}
                >
                  {t("careersJob.visit_website")}
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Page header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t("careersHero.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t("careersHero.subtitle")}
          </Typography>
          {!isLoading && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              {t("careers.open_positions_count", { count: openJobsCount })}
            </Typography>
          )}
        </Box>
        {/* Search bar */}
        <Box sx={{ mb: 4 }}>
          <JobSearchFilters
            search={filters.search}
            onSearchChange={(value) => handleFilterChange("search", value)}
          />
        </Box>

        {/* Filter button for mobile */}
        {isMobile && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {t("careersFilters.filters")}
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
          </Box>
        )}

        {/* Layout with sidebar and content */}
        <Box sx={{ display: "flex", gap: 4 }}>
          {/* Desktop Filter Sidebar */}
          {!isMobile && (
            <Box sx={{ width: 280, flexShrink: 0 }}>
              <FilterSidebar
                company={filters.company}
                category={filters.category}
                jobType={filters.jobType}
                workLocation={filters.workLocation}
                experienceLevel={filters.experienceLevel}
                salaryRange={salaryRange}
                activeFilterCount={activeFilterCount}
                companies={companies}
                isLoadingCompanies={isLoadingCompanies}
                minSalary={MIN_SALARY}
                maxSalary={MAX_SALARY}
                salaryStep={SALARY_STEP}
                onFilterChange={handleFilterChange}
                onSalaryRangeChange={handleSalaryRangeChange}
                onClearFilters={handleClearFilters}
                formatSalary={formatSalary}
              />
            </Box>
          )}

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="left"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{
              sx: { width: 320, p: 2 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t("careersFilters.filters")}
              </Typography>
              <IconButton onClick={() => setFilterDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <FilterSidebar
              company={filters.company}
              category={filters.category}
              jobType={filters.jobType}
              workLocation={filters.workLocation}
              experienceLevel={filters.experienceLevel}
              salaryRange={salaryRange}
              activeFilterCount={activeFilterCount}
              companies={companies}
              isLoadingCompanies={isLoadingCompanies}
              minSalary={MIN_SALARY}
              maxSalary={MAX_SALARY}
              salaryStep={SALARY_STEP}
              onFilterChange={handleFilterChange}
              onSalaryRangeChange={handleSalaryRangeChange}
              onClearFilters={handleClearFilters}
              formatSalary={formatSalary}
            />
          </Drawer>

          {/* Job listings */}
          <Box sx={{ flex: 1 }}>
            {/* Results count and active filters */}
            {!isLoading && !error && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {openJobsCount > 0
                    ? t("careersResults.showing_range", {
                        start: (page - 1) * ITEMS_PER_PAGE + 1,
                        end: Math.min(page * ITEMS_PER_PAGE, openJobsCount),
                        total: openJobsCount,
                      })
                    : t("careersResults.showing_results", {
                        count: 0,
                        total: 0,
                      })}
                </Typography>

                {/* Active filter chips */}
                {activeFilterCount > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {filters.company && (
                      <Chip
                        label={`${t("careersFilters.company")}: ${companies.find((c) => c.uid === filters.company)?.name || filters.company}`}
                        onDelete={() => handleFilterChange("company", "")}
                        size="small"
                      />
                    )}
                    {filters.category && (
                      <Chip
                        label={`${t("careersFilters.category")}: ${filters.category}`}
                        onDelete={() => handleFilterChange("category", "")}
                        size="small"
                      />
                    )}
                  </Stack>
                )}
              </Box>
            )}

            {/* Loading state */}
            {isLoading && <LoadingSkeletons count={9} />}

            {/* Job cards grid and all states */}
            <JobCardsGrid
              jobPositions={jobPositions}
              isLoading={isLoading}
              error={error}
              openJobsCount={openJobsCount}
              hasActiveFilters={activeFilterCount > 0}
              hasSearchQuery={!!filters.search}
              totalPages={totalPages}
              currentPage={page}
              isMobile={isMobile}
              onApplyClick={handleApplyClick}
              onPageChange={handlePageChange}
              onClearFilters={handleClearFilters}
            />
          </Box>
        </Box>
      </Container>

      {/* Apply dialog */}
      {applyDialog.selectedItem && (
        <ApplyToJobDialog
          open={applyDialog.isOpen}
          onClose={applyDialog.close}
          jobUid={applyDialog.selectedItem.uid}
          jobTitle={applyDialog.selectedItem.title}
        />
      )}
    </Box>
  );
};

export default CareersPage;
