import { Box, Typography, Button, Chip, Tooltip } from "@mui/material";
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
import { getHiringProcessStatusColor } from "../../utils/statusColors";
import { useDialog } from "../../hooks/useDialog";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import { ActionsCell, CellRow, CellColumn } from "../tables";
import { DataTable, DataTableColumn } from "../shared/DataTable";

interface HiringProcessesListProps {
  page: number;
  limit: number;
  search: string;
  status?: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const HiringProcessesList: React.FC<HiringProcessesListProps> = ({
  page,
  limit,
  search,
  status,
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
    status,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const processes = (data?.data as HiringProcess[] | undefined) || [];
  const totalRows = data?.meta?.total || 0;

  const handleViewClick = (process: HiringProcess) => {
    navigate(`/hiring-process/${process.uid}`);
  };

  const columns: DataTableColumn<HiringProcess>[] = [
    {
      field: "title",
      headerName: t("hiring_processes.title"),
      flex: 1,
      minWidth: 150,
      mobileRender: (process) => (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {process.title}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: t("hiring_processes.group.column_status"),
      width: 130,
      renderCell: (params) => (
        <CellRow centered>
          <Chip
            label={t(`status.${params.row.status.toLowerCase()}`)}
            color={getHiringProcessStatusColor(params.row.status)}
            size="small"
          />
        </CellRow>
      ),
      mobileRender: (process) => (
        <Chip
          label={t(`status.${process.status.toLowerCase()}`)}
          color={getHiringProcessStatusColor(process.status)}
          size="small"
          sx={{ mb: 1 }}
        />
      ),
    },
    {
      field: "stages",
      headerName: t("stages.title"),
      width: 120,
      renderCell: (params) => {
        const stages = params.row.stages ?? [];
        const count = stages.length;
        const tooltipContent =
          count > 0
            ? stages.map((s: { title: string }) => s.title).join(" → ")
            : t("stages.no_stages");
        return (
          <Tooltip title={tooltipContent} arrow placement="top">
            <Typography
              variant="body2"
              sx={{ cursor: count > 0 ? "help" : "default" }}
            >
              {t("hiring_processes.stages_count", { count })}
            </Typography>
          </Tooltip>
        );
      },
      mobileRender: (process) => (
        <Typography variant="body2" color="textSecondary">
          {t("hiring_processes.stages_count", {
            count: process.stages?.length || 0,
          })}
        </Typography>
      ),
    },
    {
      field: "candidate",
      headerName: t("candidates.title"),
      width: 180,
      renderCell: (params) =>
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
      mobileRender: (process) =>
        process.candidate ? (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2">{process.candidate.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {process.candidate.email}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="error.main">
            {t("hiring_processes.no_candidate")}
          </Typography>
        ),
    },
    {
      field: "createdBy",
      headerName: t("job_positions.created_by"),
      width: 180,
      renderCell: (params) =>
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
      renderCell: (params) => (
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
      mobileRender: (process) => (
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleViewClick(process)}
          >
            {t("common.view")}
          </Button>
          {canManage && (
            <ActionsCell
              onEdit={() => updateDialog.openWith(process)}
              onDelete={() => deleteConfirm.confirmDelete(process)}
              showView={false}
            />
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={processes}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        error={!!error}
        emptyMessage="hiring_processes.no_processes"
        errorMessage="errors.fetch_failed"
        onboardingKey="hiring-processes-list"
        page={page}
        limit={limit}
        totalRows={totalRows}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        serverPagination={true}
      />

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
