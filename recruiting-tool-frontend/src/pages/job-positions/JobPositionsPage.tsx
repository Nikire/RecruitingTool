import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import InboxIcon from "@mui/icons-material/Inbox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { JobPosition } from "../../types/jobPosition.types";
import ManageStagesDialog from "../../components/dialogs/ManageStagesDialog";
import CreateJobPositionDialog from "../../components/dialogs/CreateJobPositionDialog";
import UpdateJobPositionDialog from "../../components/dialogs/UpdateJobPositionDialog";
import JobPositionCard from "../../components/job-positions/JobPositionCard";
import JobPositionFilters, {
  JobPositionFiltersState,
} from "../../components/job-positions/JobPositionFilters";
import { useListJobPositions } from "../../hooks/api/useJobPositions";
import { useNavigate } from "react-router-dom";
import { useAuthMe } from "../../hooks/api/useAuth";
import { canManageResources } from "../../utils/permissions";
import { useDialog } from "../../hooks/useDialog";
import { CenteredLoadingSpinner, PageHeader } from "../../components/common";
import { useQuota } from "../../api/subscription";
import { getQuotaByResource } from "../../types/subscription.types";
import { formatRelativeTime } from "../../utils/dateFormatters";

const JobPositionsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useAuthMe();
  const canManage = canManageResources(user);

  const [selectedJobPosition, setSelectedJobPosition] =
    useState<JobPosition | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const updateDialog = useDialog<JobPosition>();

  // View mode state (grid or list) - saved to localStorage
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (
      (localStorage.getItem("jobPositions_viewMode") as "grid" | "list") ||
      "grid"
    );
  });

  // Pagination state
  const [page, setPage] = useState(0); // MUI TablePagination uses 0-based indexing
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<JobPositionFiltersState>({
    search: "",
    status: "ALL",
    department: "ALL",
    location: "",
    dateFrom: null,
    dateTo: null,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch quota information for the plan usage display
  const { data: quotaData } = useQuota();
  const jobPositionQuota = quotaData
    ? getQuotaByResource(quotaData.quotas, "jobPositions")
    : undefined;

  // Fetch job positions with server-side pagination and filtering
  const { data, isLoading, error } = useListJobPositions({
    page: page + 1, // Convert to 1-based for API
    limit: pageSize,
    search: filters.search || undefined,
    status: filters.status !== "ALL" ? filters.status : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const jobPositions = data?.data || [];
  const totalCount = data?.meta?.total || 0;

  // Wait for user data to load before rendering (fixes race condition)
  if (userLoading) {
    return <CenteredLoadingSpinner />;
  }

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "grid" | "list" | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
      localStorage.setItem("jobPositions_viewMode", newMode);
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const handleFilterChange = (newFilters: JobPositionFiltersState) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleCloseStagesDialog = () => {
    setSelectedJobPosition(null);
  };

  const handleViewDetails = (jobPosition: JobPosition) => {
    navigate(`/hr/job-positions/${jobPosition.uid}`);
  };

  const handleEdit = (jobPosition: JobPosition) => {
    updateDialog.openWith(jobPosition);
  };

  const handleManageStages = (jobPosition: JobPosition) => {
    setSelectedJobPosition(jobPosition);
  };

  // Loading skeleton cards
  const renderSkeletonCards = () => (
    <Grid container spacing={3} justifyContent="center">
      {[1, 2, 3].map((i) => (
        <Grid
          size={{ xs: 12, sm: 6, md: 4 }}
          key={i}
          sx={{ overflow: "visible" }}
        >
          <Paper
            sx={{
              height: "100%",
              width: 360,
              maxWidth: "100%",
              mx: "auto",
              p: 2,
            }}
          >
            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="40%" />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // Empty state
  const renderEmptyState = () => (
    <Paper sx={{ p: 8, textAlign: "center" }}>
      <InboxIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {filters.search ||
        filters.status !== "ALL" ||
        filters.location ||
        filters.dateFrom ||
        filters.dateTo
          ? t("job_position_card.no_results")
          : t("job_position_card.no_positions")}
      </Typography>
      {!filters.search &&
        filters.status === "ALL" &&
        !filters.location &&
        !filters.dateFrom &&
        !filters.dateTo &&
        canManage && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            {t("job_positions.create_new")}
          </Button>
        )}
    </Paper>
  );

  // Pagination info text
  const getPaginationText = () => {
    if (totalCount === 0) return "";
    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, totalCount);
    return t("job_positions.pagination_showing", {
      start,
      end,
      total: totalCount,
    });
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="job_positions.title"
        subtitle="job_positions.subtitle"
        action={
          canManage
            ? {
                label: "job_positions.create_new",
                icon: <AddIcon />,
                onClick: () => setCreateDialogOpen(true),
              }
            : undefined
        }
        secondaryActions={
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label={t("job_position_card.view_mode")}
            size="small"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            <ToggleButton
              value="grid"
              aria-label={t("job_position_card.grid_view")}
            >
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton
              value="list"
              aria-label={t("job_position_card.list_view")}
            >
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {/* Mobile Create Button */}
      {canManage && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ display: { xs: "flex", sm: "none" }, mb: 2 }}
        >
          {t("job_positions.create_new")}
        </Button>
      )}

      {/* Filters */}
      <JobPositionFilters filters={filters} onChange={handleFilterChange} />

      {/* Pagination Info + Quota Chip */}
      {!isLoading && totalCount > 0 && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {getPaginationText()}
          </Typography>
          {jobPositionQuota && (
            <Chip
              label={
                jobPositionQuota.limit < 0
                  ? t("job_positions.quota_usage_unlimited", {
                      used: jobPositionQuota.used,
                    })
                  : t("job_positions.quota_usage", {
                      used: jobPositionQuota.used,
                      limit: jobPositionQuota.limit,
                    })
              }
              size="small"
              color={
                jobPositionQuota.limit >= 0 && jobPositionQuota.isExceeded
                  ? "error"
                  : jobPositionQuota.limit >= 0 &&
                      jobPositionQuota.percentageUsed >= 80
                    ? "warning"
                    : "default"
              }
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Error State */}
      {error && !data && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">
            {t("job_positions_table.error_loading")}
          </Typography>
        </Paper>
      )}

      {/* Loading State */}
      {isLoading && renderSkeletonCards()}

      {/* Empty State */}
      {!isLoading && jobPositions.length === 0 && renderEmptyState()}

      {/* Grid View */}
      {!isLoading && jobPositions.length > 0 && viewMode === "grid" && (
        <>
          <Grid container spacing={3} justifyContent="center">
            {jobPositions.map((position) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={position.uid}
                sx={{ overflow: "visible" }}
              >
                <JobPositionCard
                  jobPosition={position}
                  onView={handleViewDetails}
                  onEdit={canManage ? handleEdit : undefined}
                  onManageStages={canManage ? handleManageStages : undefined}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage={t("job_positions.per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                t("job_positions.pagination_info", { from, to, count })
              }
              sx={{
                "& .MuiTablePagination-toolbar": {
                  justifyContent: "center",
                },
              }}
            />
          </Box>
        </>
      )}

      {/* List View */}
      {!isLoading && jobPositions.length > 0 && viewMode === "list" && (
        <>
          <TableContainer component={Paper}>
            <Table size="small" aria-label={t("job_positions.title")}>
              <TableHead>
                <TableRow>
                  <TableCell>{t("job_positions.list_header_title")}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {t("job_positions.list_header_department")}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {t("job_positions.list_header_type_location")}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {t("job_positions.list_header_experience")}
                  </TableCell>
                  <TableCell align="center">
                    {t("job_positions.list_header_applications")}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {t("job_positions.list_header_created")}
                  </TableCell>
                  <TableCell align="right">
                    {t("job_positions.list_header_actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobPositions.map((position: JobPosition) => {
                  const applicantCount = position.hiringProcesses?.length ?? 0;
                  const jobTypeKey = position.jobType
                    ? `job_position_card.job_type_${position.jobType.toLowerCase()}`
                    : null;
                  const workLocationKey = position.workLocation
                    ? `job_position_card.work_location_${position.workLocation.toLowerCase()}`
                    : null;
                  const expKey = position.experienceLevel
                    ? `job_position_card.exp_${position.experienceLevel.toLowerCase()}`
                    : null;
                  const statusColor: "success" | "default" | "warning" =
                    position.status === "OPEN"
                      ? "success"
                      : position.status === "CANCELLED"
                        ? "warning"
                        : "default";

                  return (
                    <TableRow
                      key={position.uid}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleViewDetails(position)}
                    >
                      {/* Title + Status */}
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {position.title}
                          </Typography>
                          <Chip
                            label={t(`status.${position.status.toLowerCase()}`)}
                            color={statusColor}
                            size="small"
                          />
                        </Box>
                      </TableCell>

                      {/* Department / Category */}
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {position.jobCategory ??
                            t("job_positions.list_no_department")}
                        </Typography>
                      </TableCell>

                      {/* Job Type / Work Location */}
                      <TableCell
                        sx={{ display: { xs: "none", sm: "table-cell" } }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          {jobTypeKey ? (
                            <Typography variant="body2" color="text.secondary">
                              {t(jobTypeKey)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              {t("job_positions.list_no_type")}
                            </Typography>
                          )}
                          {workLocationKey && (
                            <Typography variant="caption" color="text.disabled">
                              {t(workLocationKey)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Experience Level */}
                      <TableCell
                        sx={{ display: { xs: "none", lg: "table-cell" } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {expKey ? t(expKey) : "—"}
                        </Typography>
                      </TableCell>

                      {/* Application Count */}
                      <TableCell align="center">
                        <Typography variant="body2">
                          {applicantCount}
                        </Typography>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell
                        sx={{ display: { xs: "none", sm: "table-cell" } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {position.createdAt
                            ? formatRelativeTime(
                                position.createdAt,
                                i18n.language,
                              )
                            : "—"}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell
                        align="right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Tooltip title={t("common.view")}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(position)}
                              aria-label={t("aria.view_item", {
                                item: position.title,
                              })}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {canManage && (
                            <Tooltip title={t("common.edit")}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(position)}
                                aria-label={t("aria.edit_item", {
                                  item: position.title,
                                })}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canManage && (
                            <Tooltip title={t("job_positions.edit_stages")}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleManageStages(position)}
                                aria-label={t(
                                  "job_positions.edit_stages_aria",
                                  { item: position.title },
                                )}
                              >
                                <AccountTreeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage={t("job_positions.per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                t("job_positions.pagination_info", { from, to, count })
              }
              sx={{
                "& .MuiTablePagination-toolbar": {
                  justifyContent: "center",
                },
              }}
            />
          </Box>
        </>
      )}

      {/* Dialogs */}
      {selectedJobPosition && (
        <ManageStagesDialog
          open={!!selectedJobPosition}
          onClose={handleCloseStagesDialog}
          jobPositionUid={selectedJobPosition.uid}
          jobPositionTitle={selectedJobPosition.title}
          existingStages={selectedJobPosition.stages}
        />
      )}

      <CreateJobPositionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <UpdateJobPositionDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        jobPosition={updateDialog.selectedItem}
        onManageStages={canManage ? handleManageStages : undefined}
      />
    </Box>
  );
};

export default JobPositionsPage;
