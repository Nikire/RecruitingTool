import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import {
  useListJobPositions,
  usePublicJobPositions,
} from "../../hooks/api/useJobPositions";
import { JobPosition, PublicJobPosition } from "../../types/jobPosition.types";
import { useNavigate } from "react-router-dom";
import { ApplyToJobDialog } from "../dialogs/ApplyToJobDialog";
import { useDialog } from "../../hooks/useDialog";
import {
  EnhancedDataGrid,
  DateCell,
  StatusCell,
  CellRow,
  CellColumn,
  ActionsCell,
} from "../tables";
import { formatDate } from "../../utils/dateFormatters";

interface JobPositionsListProps {
  page: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  publicMode?: boolean;
}

// Custom color mapping for job position statuses
const jobPositionStatusColors: Record<
  string,
  "success" | "warning" | "error" | "primary" | "default"
> = {
  OPEN: "success",
  CLOSED: "default",
  DRAFT: "warning",
};

// Skeleton loader for loading state
const JobPositionCardSkeleton = () => (
  <Card sx={{ mb: 2, p: 2 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="40%" height={20} />
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Skeleton variant="rectangular" width="48%" height={40} />
        <Skeleton variant="rectangular" width="48%" height={40} />
      </Box>
    </Stack>
  </Card>
);

// Mobile card view component
const JobPositionCardView: React.FC<{
  jobPosition: JobPosition | PublicJobPosition;
  onApplyClick: (uid: string, title: string) => void;
  onViewDetails: (uid: string) => void;
  publicMode?: boolean;
}> = ({ jobPosition, onApplyClick, onViewDetails, publicMode = false }) => {
  const { t, i18n } = useTranslation();
  return (
    <Card
      sx={{
        mb: 2,
        p: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {jobPosition.title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {!publicMode && (
            <Chip
              label={jobPosition.status}
              color={jobPositionStatusColors[jobPosition.status] || "default"}
              size="small"
              sx={{ fontSize: "0.85rem" }}
            />
          )}
          <Chip
            label={`${jobPosition.stages?.length || 0} ${t("stages.title")}`}
            variant="outlined"
            size="small"
            sx={{ fontSize: "0.85rem" }}
          />
        </Box>

        {jobPosition.companyName && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {t("companies.title")}: {jobPosition.companyName}
          </Typography>
        )}

        {jobPosition.createdAt && (
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: "block", mb: 1 }}
          >
            {t("careers.posted")}:{" "}
            {formatDate(jobPosition.createdAt, "MMM dd, yyyy", i18n.language)}
          </Typography>
        )}

        {(jobPosition as JobPosition).createdBy && (
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: "block", mb: 2 }}
          >
            {t("job_positions.posted_by")}:{" "}
            {(jobPosition as JobPosition).createdBy?.name}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={() => onViewDetails(jobPosition.uid)}
            sx={{
              minHeight: 44,
              fontSize: { xs: "0.9rem", sm: "1rem" },
              flex: { xs: "1 1 auto", sm: "0 1 auto" },
            }}
          >
            {t("job_positions.view_details")}
          </Button>
          {publicMode && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={() => onApplyClick(jobPosition.uid, jobPosition.title)}
              disabled={jobPosition.status !== "OPEN"}
              sx={{
                minHeight: 44,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                flex: { xs: "1 1 auto", sm: "0 1 auto" },
              }}
            >
              {t("common.apply")}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const JobPositionsList: React.FC<JobPositionsListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
  publicMode = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Dialog state management using custom hook
  const applyDialog = useDialog<{ uid: string; title: string }>();

  // Use public endpoint if in public mode, otherwise use authenticated endpoint
  const publicQuery = usePublicJobPositions(undefined, { enabled: publicMode });
  const authQuery = useListJobPositions(
    {
      page,
      limit,
      search,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    { enabled: !publicMode }, // Only run authenticated query when NOT in public mode
  );

  // Process data based on mode
  let data, isLoading, error;

  if (publicMode) {
    // Public mode - use public endpoint with client-side filtering
    isLoading = publicQuery.isLoading;
    error = publicQuery.error;

    if (publicQuery.data && Array.isArray(publicQuery.data)) {
      const filteredData = publicQuery.data.filter((jp) =>
        jp.title.toLowerCase().includes(search.toLowerCase()),
      );
      const paginatedData = filteredData.slice(
        (page - 1) * limit,
        page * limit,
      );

      data = {
        data: paginatedData,
        meta: {
          total: filteredData.length,
          page,
          limit,
          totalPages: Math.ceil(filteredData.length / limit),
        },
      };
    }
  } else {
    // Authenticated mode - use server-side pagination
    data = authQuery.data;
    isLoading = authQuery.isLoading;
    error = authQuery.error;
  }

  const jobPositions = data?.data || [];
  const totalRows = data?.meta?.total || 0;

  const handleApplyClick = (jobUid: string, jobTitle: string) => {
    applyDialog.openWith({ uid: jobUid, title: jobTitle });
  };

  const handleViewDetails = (uid: string) => {
    // Navigate to different detail pages based on context
    if (publicMode) {
      navigate(`/careers/${uid}`);
    } else {
      navigate(`/hr/job-positions/${uid}`);
    }
  };

  // Define columns - different for public vs authenticated mode
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("job_positions.job_title_label"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "companyName",
      headerName: t("job_positions.company"),
      width: 150,
      renderCell: (params) => params.value || "N/A",
    },
    ...(!publicMode
      ? [
          {
            field: "status",
            headerName: t("job_positions.status_label"),
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
              <CellRow centered>
                <StatusCell
                  status={params.value}
                  colorMap={jobPositionStatusColors}
                />
              </CellRow>
            ),
          } as GridColDef,
        ]
      : []),
    {
      field: "stages",
      headerName: t("stages.title"),
      width: 100,
      valueGetter: (value: unknown[]) => value?.length || 0,
    },
    ...(!publicMode
      ? [
          {
            field: "createdBy",
            headerName: t("job_positions.created_by"),
            width: 180,
            renderCell: (params: GridRenderCellParams) =>
              params.row.createdBy ? (
                <CellColumn gap={0.25}>
                  <Typography variant="body2" noWrap>
                    {params.row.createdBy.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {params.row.createdBy.email}
                  </Typography>
                </CellColumn>
              ) : (
                "N/A"
              ),
          } as GridColDef,
        ]
      : []),
    {
      field: "createdAt",
      headerName: t("careers.posted_date"),
      width: 130,
      renderCell: (params) => <DateCell value={params.value} />,
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: publicMode ? 150 : 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <ActionsCell
          onView={() => handleViewDetails(params.row.uid)}
          customActions={
            publicMode && (
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyClick(params.row.uid, params.row.title);
                }}
                disabled={params.row.status !== "OPEN"}
                sx={{ ml: 0.5, minWidth: "auto", px: 1.5 }}
              >
                {t("common.apply")}
              </Button>
            )
          }
        />
      ),
    },
  ];

  // Show skeleton loader on INITIAL load, not on refetch
  if (isLoading && !data) {
    if (isMobile) {
      return (
        <Box sx={{ width: "100%" }}>
          {[1, 2, 3].map((i) => (
            <JobPositionCardSkeleton key={i} />
          ))}
        </Box>
      );
    }
    // Desktop loading is handled by EnhancedDataGrid
  }

  if (error && !data) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography
          color="error"
          sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
        >
          {t("errors.fetch_failed")}
        </Typography>
      </Box>
    );
  }

  // Mobile view (card layout)
  if (isMobile) {
    return (
      <>
        {jobPositions.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            {jobPositions.map((jobPosition) => (
              <JobPositionCardView
                key={jobPosition.uid}
                jobPosition={jobPosition}
                onApplyClick={handleApplyClick}
                onViewDetails={handleViewDetails}
                publicMode={publicMode}
              />
            ))}
          </Box>
        ) : (
          <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary">
              {t("job_positions.no_positions")}
            </Typography>
          </Paper>
        )}

        {applyDialog.selectedItem && (
          <ApplyToJobDialog
            open={applyDialog.isOpen}
            onClose={applyDialog.close}
            jobUid={applyDialog.selectedItem.uid}
            jobTitle={applyDialog.selectedItem.title}
          />
        )}
      </>
    );
  }

  // Desktop view (DataGrid)
  if (!isLoading && jobPositions.length === 0) {
    return (
      <>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            {t("job_positions.no_positions")}
          </Typography>
        </Paper>
        {applyDialog.selectedItem && (
          <ApplyToJobDialog
            open={applyDialog.isOpen}
            onClose={applyDialog.close}
            jobUid={applyDialog.selectedItem.uid}
            jobTitle={applyDialog.selectedItem.title}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Box sx={{ height: 600, width: "100%" }}>
        <EnhancedDataGrid
          rows={jobPositions}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.uid}
          rowCount={totalRows}
          paginationMode={publicMode ? "client" : "server"}
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={(model) => {
            if (model.page !== page - 1) {
              onPageChange(model.page + 1);
            }
            if (model.pageSize !== limit) {
              onLimitChange(model.pageSize);
            }
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          onboardingKey={
            publicMode ? "job-positions-public" : "job-positions-list"
          }
          localeText={{
            noRowsLabel: t("job_positions.no_positions"),
          }}
        />
      </Box>

      {applyDialog.selectedItem && (
        <ApplyToJobDialog
          open={applyDialog.isOpen}
          onClose={applyDialog.close}
          jobUid={applyDialog.selectedItem.uid}
          jobTitle={applyDialog.selectedItem.title}
        />
      )}
    </>
  );
};

export default JobPositionsList;
