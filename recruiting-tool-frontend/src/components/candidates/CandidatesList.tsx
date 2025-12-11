import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import {
  useListCandidates,
  useDeleteCandidate,
} from "../../hooks/api/useCandidates";
import { useDialog } from "../../hooks/useDialog";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import { Candidate } from "../../types/candidate";
import { SearchableListProps } from "../../types";
import UpdateCandidateDialog from "../dialogs/UpdateCandidateDialog";
import { ConfirmationDialog } from "../common";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { canManageResources } from "../../utils/permissions";
import { ActionsCell, DateCell } from "../tables";
import { DataTable, DataTableColumn } from "../shared/DataTable";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CandidatesListProps extends SearchableListProps {}

const CandidatesList: React.FC<CandidatesListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const canManage = canManageResources(user);

  const updateDialog = useDialog<Candidate>();
  const deleteMutation = useDeleteCandidate();
  const deleteConfirm = useConfirmDelete<Candidate>(deleteMutation);

  const { data, isLoading, error } = useListCandidates({
    page,
    limit,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const candidates = data?.data || [];
  const totalRows = data?.meta?.total || 0;

  const handleEditClick = (candidate: Candidate) => {
    updateDialog.openWith(candidate);
  };

  const handleDeleteClick = (candidate: Candidate) => {
    deleteConfirm.confirmDelete(candidate);
  };

  // Define columns for DataTable
  const columns: DataTableColumn<Candidate>[] = [
    {
      field: "name",
      headerName: t("candidates.name_label"),
      flex: 1,
      minWidth: 150,
      mobileRender: (candidate) => (
        <Typography
          variant="h6"
          sx={{ mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {candidate.name}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: t("candidates.email_label"),
      flex: 1,
      minWidth: 200,
      mobileRender: (candidate) => (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {t("candidates.email_label")}: {candidate.email}
        </Typography>
      ),
    },
    {
      field: "phone",
      headerName: t("candidates.phone_label"),
      width: 150,
      renderCell: (params) => params.value || "-",
      mobileRender: (candidate) =>
        candidate.phone ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {t("candidates.phone_label")}: {candidate.phone}
          </Typography>
        ) : null,
    },
    {
      field: "createdAt",
      headerName: t("common.created"),
      width: 150,
      renderCell: (params) => <DateCell value={params.value} />,
    },
    ...(canManage
      ? [
          {
            field: "actions",
            headerName: t("common.actions"),
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params: { row: Candidate }) => (
              <ActionsCell
                onEdit={() => handleEditClick(params.row)}
                onDelete={() => handleDeleteClick(params.row)}
              />
            ),
            mobileRender: (candidate: Candidate) => (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEditClick(candidate)}
                  aria-label={t("common.edit")}
                  sx={{ minHeight: 44, minWidth: 44 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(candidate)}
                  aria-label={t("common.delete")}
                  sx={{ minHeight: 44, minWidth: 44 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ),
          } as DataTableColumn<Candidate>,
        ]
      : []),
  ];

  return (
    <>
      <DataTable
        data={candidates}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        error={!!error}
        emptyMessage="candidates.no_candidates"
        errorMessage="errors.fetch_failed"
        onboardingKey="candidates-list"
        page={page}
        limit={limit}
        totalRows={totalRows}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        serverPagination={true}
      />

      <UpdateCandidateDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        candidate={updateDialog.selectedItem}
      />

      <ConfirmationDialog
        open={deleteConfirm.isOpen}
        onClose={deleteConfirm.handleCancel}
        onConfirm={deleteConfirm.handleConfirm}
        title={t("candidates.delete_title")}
        message={`${t("candidates.delete_message")} ${deleteConfirm.selectedItem?.name ? deleteConfirm.selectedItem.name : ""}`}
        confirmText={t("common.delete")}
        severity="error"
        isLoading={deleteConfirm.isDeleting}
      />
    </>
  );
};

export default CandidatesList;
