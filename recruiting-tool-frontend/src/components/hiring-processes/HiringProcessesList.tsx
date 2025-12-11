import { Box, Typography, Button, Chip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import {
  useListHiringProcesses,
  useDeleteHiringProcess,
} from "../../hooks/api/useHiringProcess";
import { HiringProcess } from "../../types/hiringProcess.types";
import { useNavigate } from "react-router-dom";
import UpdateHiringProcessDialog from "../dialogs/UpdateHiringProcessDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { canManageResources } from "../../utils/permissions";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import { getHiringProcessStatusColor } from "../../utils/statusColors";
import { useDialog } from "../../hooks/useDialog";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import { EnhancedDataGrid, ActionsCell, CellRow, CellColumn } from "../tables";

interface HiringProcessesListProps {
  page: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const HiringProcessesList: React.FC<HiringProcessesListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserAtom();
  const canManage = canManageResources(user);

  // Dialog state management using custom hooks
  const updateDialog = useDialog<HiringProcess>();
  const deleteMutation = useDeleteHiringProcess();
  const deleteConfirm = useConfirmDelete<HiringProcess>(deleteMutation);

  const { data, isLoading, error } = useListHiringProcesses({
    page,
    limit,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const processes = (data?.data as HiringProcess[] | undefined) || [];
  const totalRows = data?.meta?.total || 0;

  const handleViewClick = (process: HiringProcess) => {
    navigate(`/hiring-process/${process.uid}`);
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("hiring_processes.title"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "company",
      headerName: t("companies.title"),
      width: 150,
      valueGetter: (value: { name?: string }) => value?.name || t("common.n_a"),
    },
    {
      field: "status",
      headerName: t("status.pending"),
      width: 130,
      renderCell: (params: GridRenderCellParams<HiringProcess>) => (
        <CellRow centered>
          <Chip
            label={t(`status.${params.row.status.toLowerCase()}`)}
            color={getHiringProcessStatusColor(params.row.status)}
            size="small"
          />
        </CellRow>
      ),
    },
    {
      field: "stages",
      headerName: t("stages.title"),
      width: 120,
      valueGetter: (value: unknown[]) =>
        `${value?.length || 0} ${t("stages.title").toLowerCase()}`,
    },
    {
      field: "candidate",
      headerName: t("candidates.title"),
      width: 180,
      renderCell: (params: GridRenderCellParams<HiringProcess>) =>
        params.row.candidate ? (
          <CellColumn gap={0.25}>
            <Typography variant="body2" noWrap>
              {params.row.candidate.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.candidate.email}
            </Typography>
          </CellColumn>
        ) : (
          <Typography
            variant="caption"
            sx={{ color: "error.main", fontWeight: 500 }}
          >
            {t("hiring_processes.no_candidate")}
          </Typography>
        ),
    },
    {
      field: "createdBy",
      headerName: t("job_positions.created_by"),
      width: 180,
      renderCell: (params: GridRenderCellParams<HiringProcess>) =>
        params.row.jobPosition?.createdBy ? (
          <CellColumn gap={0.25}>
            <Typography variant="body2" noWrap>
              {params.row.jobPosition.createdBy.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.jobPosition.createdBy.email}
            </Typography>
          </CellColumn>
        ) : (
          t("common.n_a")
        ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<HiringProcess>) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick(params.row);
            }}
          >
            {t("common.view")}
          </Button>
          {canManage && (
            <ActionsCell
              onEdit={() => updateDialog.openWith(params.row)}
              onDelete={() => deleteConfirm.confirmDelete(params.row)}
              showView={false}
            />
          )}
        </Box>
      ),
    },
  ];

  if (error && !data) {
    return <ErrorMessage message="errors.fetch_failed" />;
  }

  if (!isLoading && processes.length === 0) {
    return <EmptyState message="hiring_processes.no_processes" />;
  }

  return (
    <>
      <Box sx={{ height: 600, width: "100%" }}>
        <EnhancedDataGrid
          rows={processes}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.uid}
          rowCount={totalRows}
          paginationMode="server"
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
          onboardingKey="hiring-processes-list"
          localeText={{
            noRowsLabel: t("hiring_processes.no_processes"),
          }}
        />
      </Box>

      <UpdateHiringProcessDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        hiringProcess={updateDialog.selectedItem}
      />

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onClose={deleteConfirm.handleCancel}
        onConfirm={deleteConfirm.handleConfirm}
        title={t("dialogs.delete_confirmation")}
        message={t("hiring_processes.delete_message")}
        itemName={deleteConfirm.selectedItem?.title}
        isDeleting={deleteConfirm.isDeleting}
      />
    </>
  );
};

export default HiringProcessesList;
