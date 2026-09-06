import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Typography,
  Box,
  Container,
  Stack,
  Chip,
  Drawer,
  IconButton,
  Button,
  Link as MuiLink,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

import { usePublicJobPositions } from "../../hooks/api/useJobPositions";
import { usePublicCompaniesWithJobs } from "../../hooks/api/useCompanies";
import { PublicJobPositionFilters } from "../../api/jobPositions";
import type { PublicCompany } from "../../api/companies";
import { ApplyToJobDialog } from "../../components/dialogs/ApplyToJobDialog";
import { useDialog } from "../../hooks/useDialog";
import FilterSidebar from "../../components/careers/FilterSidebar";
import JobCardsGrid from "../../components/careers/JobCardsGrid";
import LoadingSkeletons from "../../components/careers/LoadingSkeletons";
import { truncatingChipSx } from "../../utils/textOverflow";
import { buildJobPath } from "./careersUrls";

/**
 * Every filter dimension the board understands.
 *
 * `country` has no sidebar control — it exists so a `/jobs/{country}` facet page
 * can pin it. The rest map one-to-one onto `FilterSidebar`.
 */
export interface BoardFilters {
  search: string;
  category: string;
  jobType: string;
  workLocation: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  company: string;
  country: string;
}

export type BoardFilterKey = keyof BoardFilters;

/**
 * URL parameter name for each filter.
 *
 * Filter state lives in the query string rather than in `useState` so that a
 * filtered view is a link someone can send. `<Seo>` strips search params from
 * the canonical URL, so none of these create duplicate indexable pages.
 */
const FILTER_PARAMS: Record<BoardFilterKey, string> = {
  search: "q",
  category: "category",
  jobType: "jobType",
  workLocation: "workLocation",
  experienceLevel: "experience",
  salaryMin: "salaryMin",
  salaryMax: "salaryMax",
  company: "company",
  country: "country",
};

const FILTER_KEYS = Object.keys(FILTER_PARAMS) as BoardFilterKey[];

const EMPTY_FILTERS: BoardFilters = {
  search: "",
  category: "",
  jobType: "",
  workLocation: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  company: "",
  country: "",
};

/** Category filter values as sent to the API — never rendered raw. */
const CATEGORY_LABEL_KEYS: Record<string, string> = {
  Engineering: "careersFilters.engineering",
  Marketing: "careersFilters.marketing",
  Sales: "careersFilters.sales",
  Design: "careersFilters.design",
  Product: "careersFilters.product",
};

/** i18next echoes an unknown key back, so an unmapped value still reads fine. */
const getCategoryLabelKey = (category: string): string =>
  CATEGORY_LABEL_KEYS[category] ?? category;

/** Select values → label keys, mirroring the options `FilterSidebar` offers. */
const JOB_TYPE_LABEL_KEYS: Record<string, string> = {
  FULL_TIME: "careersFilters.full_time",
  PART_TIME: "careersFilters.part_time",
  CONTRACT: "careersFilters.contract",
  INTERNSHIP: "careersFilters.internship",
  TEMPORARY: "careersFilters.temporary",
  FREELANCE: "create_job_position.job_type_freelance",
};

const WORK_LOCATION_LABEL_KEYS: Record<string, string> = {
  REMOTE: "careersFilters.remote",
  HYBRID: "careersFilters.hybrid",
  ON_SITE: "careersFilters.onsite",
};

const EXPERIENCE_LEVEL_LABEL_KEYS: Record<string, string> = {
  ENTRY: "careersFilters.entry_level",
  MID: "careersFilters.mid_level",
  SENIOR: "careersFilters.senior_level",
  LEAD: "careersFilters.lead_level",
  EXECUTIVE: "careersFilters.executive_level",
};

/**
 * Filters whose input is continuous, so they must REPLACE the history entry
 * rather than push one.
 *
 * The search box commits after a short debounce (and on Enter) and the salary
 * slider fires once dragging settles. Pushing those would still leave the back
 * button needing many presses to escape one search. Discrete choices — picking
 * a select value, clearing the filters — push, so back undoes them one at a
 * time.
 */
const CONTINUOUS_FILTER_KEYS = new Set<BoardFilterKey>([
  "search",
  "salaryMin",
  "salaryMax",
]);

const ITEMS_PER_PAGE = 9;
const MIN_SALARY = 0;
const MAX_SALARY = 300000;
const SALARY_STEP = 5000;

/**
 * The public API type does not yet carry `city` / `country`, but the endpoint
 * accepts and applies both (see `JobPositionFiltersDto`). Widening it here
 * keeps the extra params type-checked instead of cast away.
 */
type BoardApiFilters = PublicJobPositionFilters & {
  city?: string;
  country?: string;
};

export interface CareersBoardProps {
  /**
   * Filters pinned by the route (a company page, a facet page). They are always
   * applied, never written to the query string, and never counted as "active"
   * filters the visitor can clear.
   */
  fixedFilters?: Partial<BoardFilters>;
  /**
   * When set, changing any filter leaves this page and re-runs the search on
   * the given path with the full filter set in the query string.
   *
   * Facet pages use it: `/jobs/remote` is a static, canonical landing surface,
   * so narrowing it further must continue on `/careers?...` rather than mutate
   * a URL search engines are being asked to index.
   */
  escapeTo?: string;
  /** Company list offered in the sidebar. Defaults to every hiring company. */
  companies?: PublicCompany[];
  isLoadingCompanies?: boolean;
  /** Rendered above the board — the hero, or a company / facet header. */
  header?: ReactNode;
  /** Rendered under the board — facet navigation for crawlers and humans. */
  footerNav?: ReactNode;
  /**
   * Reports how many postings the current filter set matched.
   *
   * Facet pages use it to emit `noindex` when a facet is empty, so a page with
   * nothing on it never enters the index and drops out again on its own.
   */
  onResultCountChange?: (count: number) => void;
}

/**
 * The public job board, shared by `/careers`, `/careers/company/:slug` and the
 * `/jobs/...` facet pages.
 *
 * All three render the same filters, the same cards and the same apply flow;
 * they differ only in which filters are pinned by the URL and what sits in the
 * header. Keeping that in one component is why a company careers page costs
 * ~60 lines instead of a fork of the whole board.
 */
const CareersBoard: React.FC<CareersBoardProps> = ({
  fixedFilters,
  escapeTo,
  companies: companiesOverride,
  isLoadingCompanies: isLoadingCompaniesOverride,
  header,
  footerNav,
  onResultCountChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const applyDialog = useDialog<{ uid: string; title: string }>();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  /** Filter state read straight off the URL — the query string IS the state. */
  const urlFilters = useMemo(() => {
    const next = { ...EMPTY_FILTERS };
    for (const key of FILTER_KEYS) {
      next[key] = searchParams.get(FILTER_PARAMS[key]) ?? "";
    }
    return next;
  }, [searchParams]);

  const page = useMemo(() => {
    const raw = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  /** What the sidebar renders: URL state with the pinned values layered on top. */
  const effectiveFilters = useMemo(
    () => ({ ...urlFilters, ...(fixedFilters ?? {}) }),
    [urlFilters, fixedFilters],
  );

  /* ---------------------------------------------------------------------- */
  /* Companies                                                              */
  /* ---------------------------------------------------------------------- */

  const { data: fetchedCompanies, isLoading: isFetchingCompanies } =
    usePublicCompaniesWithJobs();

  // A company page passes its own single-entry list, so the sidebar cannot
  // offer a way to browse out of the brand it is embedded under.
  const companies = useMemo(
    () => companiesOverride ?? fetchedCompanies ?? [],
    [companiesOverride, fetchedCompanies],
  );
  const isLoadingCompanies =
    isLoadingCompaniesOverride ??
    (companiesOverride ? false : isFetchingCompanies);

  /* ---------------------------------------------------------------------- */
  /* Salary slider (local, debounced into the URL)                          */
  /* ---------------------------------------------------------------------- */

  const [salaryRange, setSalaryRange] = useState<number[]>([
    MIN_SALARY,
    MAX_SALARY,
  ]);
  const salaryDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Keep the slider in step with the URL (back button, pasted link, reset).
  useEffect(() => {
    const min = Number.parseInt(effectiveFilters.salaryMin, 10);
    const max = Number.parseInt(effectiveFilters.salaryMax, 10);
    setSalaryRange([
      Number.isFinite(min) ? min : MIN_SALARY,
      Number.isFinite(max) ? max : MAX_SALARY,
    ]);
  }, [effectiveFilters.salaryMin, effectiveFilters.salaryMax]);

  useEffect(
    () => () => {
      if (salaryDebounceTimer.current)
        clearTimeout(salaryDebounceTimer.current);
    },
    [],
  );

  /* ---------------------------------------------------------------------- */
  /* Writing filters back                                                   */
  /* ---------------------------------------------------------------------- */

  /** Serialises a full filter set into a query string. */
  const toSearchParams = useCallback(
    (next: BoardFilters, nextPage: number): URLSearchParams => {
      const params = new URLSearchParams();
      for (const key of FILTER_KEYS) {
        if (next[key]) params.set(FILTER_PARAMS[key], next[key]);
      }
      if (nextPage > 1) params.set("page", String(nextPage));
      return params;
    },
    [],
  );

  const commitFilters = useCallback(
    (next: BoardFilters, replace = false, stayInPlace = false) => {
      // On a facet page every change carries the pinned values with it and
      // continues on the general board, leaving the indexed URL untouched.
      // Typing in the search box is the exception: leaving the route would
      // unmount the input mid-word, and `<Seo>` strips `?q=` from the
      // canonical URL anyway, so the query stays on the facet page until the
      // visitor touches a discrete filter.
      if (escapeTo && !stayInPlace) {
        const merged = { ...next, ...(fixedFilters ?? {}) };
        navigate(`${escapeTo}?${toSearchParams(merged, 1).toString()}`, {
          replace,
        });
        return;
      }
      setSearchParams(toSearchParams(next, 1), { replace });
    },
    [escapeTo, fixedFilters, navigate, setSearchParams, toSearchParams],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const filterKey = key as BoardFilterKey;
      commitFilters(
        { ...urlFilters, [filterKey]: value },
        CONTINUOUS_FILTER_KEYS.has(filterKey),
        filterKey === "search",
      );
    },
    [commitFilters, urlFilters],
  );

  const handleClearSalary = useCallback(() => {
    commitFilters({ ...urlFilters, salaryMin: "", salaryMax: "" });
  }, [commitFilters, urlFilters]);

  const handleClearFilters = useCallback(() => {
    commitFilters({ ...EMPTY_FILTERS });
  }, [commitFilters]);

  const handleSalaryRangeChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const range = newValue as number[];
      setSalaryRange(range);

      if (salaryDebounceTimer.current)
        clearTimeout(salaryDebounceTimer.current);
      salaryDebounceTimer.current = setTimeout(() => {
        commitFilters(
          {
            ...urlFilters,
            salaryMin: range[0] === MIN_SALARY ? "" : String(range[0]),
            salaryMax: range[1] === MAX_SALARY ? "" : String(range[1]),
          },
          true,
        );
      }, 500);
    },
    [commitFilters, urlFilters],
  );

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, value: number) => {
      setSearchParams(toSearchParams(urlFilters, value), { replace: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams, toSearchParams, urlFilters],
  );

  /* ---------------------------------------------------------------------- */
  /* Data                                                                   */
  /* ---------------------------------------------------------------------- */

  const apiFilters: BoardApiFilters = useMemo(() => {
    const params: BoardApiFilters = {
      page,
      limit: ITEMS_PER_PAGE,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    if (effectiveFilters.search) params.search = effectiveFilters.search;
    if (effectiveFilters.category) params.category = effectiveFilters.category;
    if (effectiveFilters.jobType) params.jobType = effectiveFilters.jobType;
    if (effectiveFilters.workLocation)
      params.workLocation = effectiveFilters.workLocation;
    if (effectiveFilters.experienceLevel)
      params.experienceLevel = effectiveFilters.experienceLevel;
    if (effectiveFilters.salaryMin)
      params.salaryMin = Number.parseInt(effectiveFilters.salaryMin, 10);
    if (effectiveFilters.salaryMax)
      params.salaryMax = Number.parseInt(effectiveFilters.salaryMax, 10);
    if (effectiveFilters.company) params.companyUid = effectiveFilters.company;
    if (effectiveFilters.country) params.country = effectiveFilters.country;

    return params;
  }, [effectiveFilters, page]);

  // Previous results stay on screen (dimmed) while a new filter set loads, so
  // removing a chip does not swap the whole list for skeletons under the cursor.
  const { data, isLoading, isPlaceholderData, error } = usePublicJobPositions(
    apiFilters,
    { enabled: true, keepPreviousData: true },
  );

  const jobPositions = useMemo(() => data?.data ?? [], [data?.data]);
  const totalPages = data?.totalPages ?? 0;
  const openJobsCount = data?.total ?? 0;
  const showSkeletons = isLoading && !data;

  useEffect(() => {
    if (!isLoading && !isPlaceholderData && !error)
      onResultCountChange?.(openJobsCount);
  }, [error, isLoading, isPlaceholderData, onResultCountChange, openJobsCount]);

  /* ---------------------------------------------------------------------- */
  /* Derived UI state                                                       */
  /* ---------------------------------------------------------------------- */

  const handleApplyClick = useCallback(
    (uid: string, title: string) => applyDialog.openWith({ uid, title }),
    [applyDialog],
  );

  const formatSalary = useCallback((value: number): string => {
    if (value === 0) return "$0";
    return value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;
  }, []);

  /** Pinned filters are not "active" — the visitor cannot clear them here. */
  const activeFilterCount = useMemo(
    () =>
      FILTER_KEYS.filter(
        (key) =>
          key !== "search" && !fixedFilters?.[key] && Boolean(urlFilters[key]),
      ).length,
    [fixedFilters, urlFilters],
  );

  // Empty while the companies list is loading or the UID is unknown — the chip
  // is skipped rather than echoing a raw UID to the visitor.
  const selectedCompanyName = useMemo(
    () =>
      urlFilters.company && !isLoadingCompanies
        ? (companies.find((c) => c.uid === urlFilters.company)?.name ?? "")
        : "",
    [companies, isLoadingCompanies, urlFilters.company],
  );

  const salaryChipLabel = useMemo(() => {
    if (!urlFilters.salaryMin && !urlFilters.salaryMax) return "";
    const min = Number.parseInt(urlFilters.salaryMin, 10);
    const max = Number.parseInt(urlFilters.salaryMax, 10);
    return `${t("careersFilters.salary_range")}: ${formatSalary(
      Number.isFinite(min) ? min : MIN_SALARY,
    )} - ${formatSalary(Number.isFinite(max) ? max : MAX_SALARY)}`;
  }, [formatSalary, t, urlFilters.salaryMax, urlFilters.salaryMin]);

  const sidebar = (
    <FilterSidebar
      search={effectiveFilters.search}
      onSearchChange={(value) => handleFilterChange("search", value)}
      company={effectiveFilters.company}
      category={effectiveFilters.category}
      jobType={effectiveFilters.jobType}
      workLocation={effectiveFilters.workLocation}
      experienceLevel={effectiveFilters.experienceLevel}
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
  );

  return (
    <Box
      sx={{ minHeight: "100vh", bgcolor: "background.default", pt: 4, pb: 8 }}
    >
      <Container maxWidth="xl">
        {header}

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

        <Box sx={{ display: "flex", gap: 4 }}>
          {!isMobile && <Box sx={{ width: 280, flexShrink: 0 }}>{sidebar}</Box>}

          <Drawer
            anchor="left"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{ sx: { width: 320, p: 2 } }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                {t("careersFilters.filters")}
              </Typography>
              <IconButton
                aria-label={t("common.close")}
                onClick={() => setFilterDrawerOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            {sidebar}
          </Drawer>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {!showSkeletons && !error && (
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

                {activeFilterCount > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {!fixedFilters?.company &&
                      urlFilters.company &&
                      selectedCompanyName && (
                        <Chip
                          label={`${t("careersFilters.company")}: ${selectedCompanyName}`}
                          onDelete={() => handleFilterChange("company", "")}
                          size="small"
                          sx={truncatingChipSx}
                        />
                      )}
                    {!fixedFilters?.category && urlFilters.category && (
                      <Chip
                        label={`${t("careersFilters.category")}: ${t(getCategoryLabelKey(urlFilters.category))}`}
                        onDelete={() => handleFilterChange("category", "")}
                        size="small"
                        sx={truncatingChipSx}
                      />
                    )}
                    {!fixedFilters?.jobType && urlFilters.jobType && (
                      <Chip
                        label={`${t("careersFilters.job_type")}: ${t(JOB_TYPE_LABEL_KEYS[urlFilters.jobType] ?? urlFilters.jobType)}`}
                        onDelete={() => handleFilterChange("jobType", "")}
                        size="small"
                        sx={truncatingChipSx}
                      />
                    )}
                    {!fixedFilters?.workLocation && urlFilters.workLocation && (
                      <Chip
                        label={`${t("careersFilters.work_location")}: ${t(WORK_LOCATION_LABEL_KEYS[urlFilters.workLocation] ?? urlFilters.workLocation)}`}
                        onDelete={() => handleFilterChange("workLocation", "")}
                        size="small"
                        sx={truncatingChipSx}
                      />
                    )}
                    {!fixedFilters?.experienceLevel &&
                      urlFilters.experienceLevel && (
                        <Chip
                          label={`${t("careersFilters.experience_level")}: ${t(EXPERIENCE_LEVEL_LABEL_KEYS[urlFilters.experienceLevel] ?? urlFilters.experienceLevel)}`}
                          onDelete={() =>
                            handleFilterChange("experienceLevel", "")
                          }
                          size="small"
                          sx={truncatingChipSx}
                        />
                      )}
                    {!fixedFilters?.salaryMin &&
                      !fixedFilters?.salaryMax &&
                      salaryChipLabel && (
                        <Chip
                          label={salaryChipLabel}
                          onDelete={handleClearSalary}
                          size="small"
                          sx={truncatingChipSx}
                        />
                      )}
                  </Stack>
                )}
              </Box>
            )}

            {showSkeletons && <LoadingSkeletons count={9} />}

            <Box
              sx={{
                opacity: isPlaceholderData ? 0.6 : 1,
                transition: "opacity 0.2s ease",
              }}
              aria-busy={isPlaceholderData || undefined}
            >
              <JobCardsGrid
                jobPositions={jobPositions}
                isLoading={showSkeletons}
                error={error}
                openJobsCount={openJobsCount}
                hasActiveFilters={activeFilterCount > 0}
                hasSearchQuery={!!effectiveFilters.search}
                totalPages={totalPages}
                currentPage={page}
                isMobile={isMobile}
                onApplyClick={handleApplyClick}
                onPageChange={handlePageChange}
                onClearFilters={handleClearFilters}
              />
            </Box>

            {/*
              A flat list of every role on this page, so crawlers get a plain
              anchor per posting even when the card grid is dimmed or refetching.
            */}
            {!showSkeletons && !error && jobPositions.length > 0 && (
              <Box
                component="nav"
                aria-label={t("careersBoard.all_roles_nav_label")}
                sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: "divider" }}
              >
                <Typography
                  variant="subtitle2"
                  component="h2"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  {t("careersBoard.all_roles_heading")}
                </Typography>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1.5}
                  sx={{ rowGap: 1 }}
                >
                  {jobPositions.map((job) => (
                    <MuiLink
                      key={job.uid}
                      component={RouterLink}
                      to={buildJobPath({
                        uid: job.uid,
                        title: job.title,
                        companyName: job.companyName,
                      })}
                      variant="body2"
                      color="text.secondary"
                      underline="hover"
                    >
                      {job.title}
                    </MuiLink>
                  ))}
                </Stack>
              </Box>
            )}

            {footerNav}

            {/*
              PLG loop: every branded careers page a customer links to from
              their own site is an impression for the product running it.
            */}
            <Box sx={{ mt: 6, textAlign: "center" }}>
              <MuiLink
                href="/?utm_source=careers_board&utm_medium=powered_by"
                variant="caption"
                color="text.secondary"
                underline="hover"
                sx={{ opacity: 0.8 }}
              >
                {t("careersBoard.powered_by")}
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Container>

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

export default CareersBoard;
