import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import WorkIcon from "@mui/icons-material/Work";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/common";
import { StatisticsCards, StatCardData } from "../../components/dashboard";
import { SearchInput } from "../../components/filters";
import { DataTable, DataTableColumn } from "../../components/shared/DataTable";
import { CellColumn, CellRow, DateCell } from "../../components/tables";
import StatusLabel from "../../components/StatusLabel";
import JobModerationReviewDialog from "../../components/dialogs/JobModerationReviewDialog";
import { useDialog } from "../../hooks/useDialog";
import {
  useApproveJobPosition,
  useJobModerationQueue,
  useJobModerationStats,
} from "../../hooks/api/useJobPositions";
import {
  JobModerationStatus,
  ModerationJobPositionItem,
} from "../../types/jobPosition.types";

const MODERATION_STATUS_OPTIONS: JobModerationStatus[] = [
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
];

const DEFAULT_MODERATION_STATUS: JobModerationStatus = "PENDING_APPROVAL";

/**
 * JobModerationPage - SUPER_ADMIN queue of job postings awaiting approval.
 *
 * Postings created by companies without an active paid subscription stay off
 * the public careers board until an administrator approves them here.
 */
const JobModerationPage: React.FC = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [moderationStatus, setModerationStatus] = useState<JobModerationStatus>(
    DEFAULT_MODERATION_STATUS,
  );

  const reviewDialog = useDialog<ModerationJobPositionItem>();
  const approveMutation = useApproveJobPosition();

  const { data: stats, isLoading: isLoadingStats } = useJobModerationStats();
  const { data, isLoading, isError } = useJobModerationQueue({
    page,
    pageSize,
    search: search || undefined,
    moderationStatus,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const rows = data?.data ?? [];
  const totalRows = data?.pagination?.total ?? 0;

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setModerationStatus(event.target.value as JobModerationStatus);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // An empty *default* queue is good news ("nothing left to review"), while an
  // empty *filtered* queue means the filter matched nothing. Different copy.
  const isFiltered =
    Boolean(search) || moderationStatus !== DEFAULT_MODERATION_STATUS;

  const handleResetFilters = () => {
    setSearch("");
    setModerationStatus(DEFAULT_MODERATION_STATUS);
    setPage(1);
  };

  const statsCards: StatCardData[] = useMemo(
    () => [
      {
        title: "job_moderation.stat_pending",
        value: stats?.pending ?? 0,
        subtitle: t("job_moderation.stat_pending_subtitle"),
        icon: <HourglassEmptyIcon />,
        iconColor: "warning.main",
        translate: true,
      },
      {
        title: "job_moderation.stat_approved",
        value: stats?.approved ?? 0,
        subtitle: t("job_moderation.stat_approved_subtitle"),
        icon: <CheckCircleIcon />,
        iconColor: "success.main",
        translate: true,
      },
      {
        title: "job_moderation.stat_rejected",
        value: stats?.rejected ?? 0,
        subtitle: t("job_moderation.stat_rejected_subtitle"),
        icon: <BlockIcon />,
        iconColor: "error.main",
        translate: true,
      },
      {
        title: "job_moderation.stat_total",
        value: stats?.total ?? 0,
        subtitle: t("job_moderation.stat_total_subtitle"),
        icon: <WorkIcon />,
        iconColor: "primary.main",
        translate: true,
      },
    ],
    [stats, t],
  );

  const columns: DataTableColumn<ModerationJobPositionItem>[] = [
    {
      field: "title",
      headerName: t("job_moderation.table_posting"),
      flex: 1.4,
      minWidth: 220,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ModerationJobPositionItem>) => (
        <CellColumn gap={0.25}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.createdByName}
            {params.row.createdByEmail ? ` · ${params.row.createdByEmail}` : ""}
          </Typography>
        </CellColumn>
      ),
      mobileRender: (item) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.companyName}
          </Typography>
        </Box>
      ),
    },
    {
      field: "companyName",
      headerName: t("job_moderation.table_company"),
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ModerationJobPositionItem>) => (
        <CellColumn gap={0.25}>
          <Typography variant="body2" noWrap>
            {params.row.companyName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.companyPlan}
          </Typography>
        </CellColumn>
      ),
    },
    {
      field: "companyHasActiveSubscription",
      headerName: t("job_moderation.table_subscription"),
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ModerationJobPositionItem>) => (
        <CellRow centered>
          <Chip
            size="small"
            variant="filled"
            color={
              params.row.companyHasActiveSubscription ? "success" : "default"
            }
            label={
              params.row.companyHasActiveSubscription
                ? t("job_moderation.company_paid")
                : t("job_moderation.company_unpaid")
            }
          />
        </CellRow>
      ),
      mobileRender: (item) => (
        <Chip
          size="small"
          variant="filled"
          color={item.companyHasActiveSubscription ? "success" : "default"}
          label={
            item.companyHasActiveSubscription
              ? t("job_moderation.company_paid")
              : t("job_moderation.company_unpaid")
          }
        />
      ),
    },
    {
      field: "moderationStatus",
      headerName: t("job_moderation.table_moderation_status"),
      width: 170,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ModerationJobPositionItem>) => (
        <CellRow centered>
          <Tooltip title={params.row.moderationReason ?? ""}>
            <span>
              <StatusLabel status={params.row.moderationStatus} size="small" />
            </span>
          </Tooltip>
        </CellRow>
      ),
      mobileRender: (item) => (
        <StatusLabel status={item.moderationStatus} size="small" />
      ),
    },
    {
      field: "createdAt",
      headerName: t("job_moderation.table_submitted"),
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ModerationJobPositionItem>) => (
        <DateCell value={params.row.createdAt} />
      ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ModerationJobPositionItem>) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={t("job_moderation.review")}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => reviewDialog.openWith(params.row)}
              aria-label={t("job_moderation.review")}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.moderationStatus !== "APPROVED" && (
            <Tooltip title={t("common.approve")}>
              <span>
                <IconButton
                  size="small"
                  color="success"
                  disabled={approveMutation.isPending}
                  onClick={() =>
                    approveMutation.mutate({ uid: params.row.uid })
                  }
                  aria-label={t("common.approve")}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      ),
      mobileRender: (item) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            size="small"
            color="primary"
            onClick={() => reviewDialog.openWith(item)}
            aria-label={t("job_moderation.review")}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          {item.moderationStatus !== "APPROVED" && (
            <IconButton
              size="small"
              color="success"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate({ uid: item.uid })}
              aria-label={t("common.approve")}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader
        title="job_moderation.title"
        subtitle="job_moderation.subtitle"
      />

      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
        {t("job_moderation.description")}
      </Alert>

      <StatisticsCards stats={statsCards} isLoading={isLoadingStats} />

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Box sx={{ flex: "1 1 260px", maxWidth: 420 }}>
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder={t("job_moderation.search_placeholder")}
          />
        </Box>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="job-moderation-status-label">
            {t("job_moderation.filter_status")}
          </InputLabel>
          <Select
            labelId="job-moderation-status-label"
            value={moderationStatus}
            label={t("job_moderation.filter_status")}
            onChange={handleStatusChange}
          >
            {MODERATION_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`status.${option.toLowerCase()}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        error={isError}
        emptyMessage="job_moderation.empty"
        emptyIcon={
          <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
        }
        emptyTitle="job_moderation.empty_queue_title"
        emptyDescription="job_moderation.empty_queue_description"
        isFiltered={isFiltered}
        filteredEmptyTitle="job_moderation.empty"
        filteredEmptyDescription="job_moderation.empty_filtered_description"
        filteredEmptyAction={{
          label: "search.clear_filters",
          onClick: handleResetFilters,
        }}
        errorMessage="job_moderation.error_loading"
        onboardingKey="job-moderation-queue"
        page={page}
        limit={pageSize}
        totalRows={totalRows}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setPageSize(newLimit);
          setPage(1);
        }}
        serverPagination
      />

      <JobModerationReviewDialog
        open={reviewDialog.isOpen}
        onClose={reviewDialog.close}
        item={reviewDialog.selectedItem}
      />
    </Box>
  );
};

export default JobModerationPage;
