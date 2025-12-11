import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Skeleton,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
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
import { EnhancedDataGrid, ActionsCell, DateCell } from "../tables";

interface CandidatesListProps extends SearchableListProps {}

// Skeleton loader for mobile loading state
const CandidateCardSkeleton = () => (
  <Card sx={{ mb: 2, p: 2 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="50%" height={20} />
      <Skeleton variant="text" width="60%" height={20} />
      <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </Stack>
  </Card>
);

// Mobile card view component
const CandidateCardView: React.FC<{
  candidate: Candidate;
  canManage: boolean;
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
}> = ({ candidate, canManage, onEdit, onDelete }) => {
  const { t } = useTranslation();
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
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Typography
          variant="h6"
          sx={{ mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {candidate.name}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {t("candidates.email_label")}: {candidate.email}
        </Typography>

        {candidate.phone && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {t("candidates.phone_label")}: {candidate.phone}
          </Typography>
        )}

        {canManage && (
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
              onClick={() => onEdit(candidate)}
              aria-label={t("common.edit")}
              sx={{ minHeight: 44, minWidth: 44 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(candidate)}
              aria-label={t("common.delete")}
              sx={{ minHeight: 44, minWidth: 44 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const CandidatesList: React.FC<CandidatesListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("candidates.name_label"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: t("candidates.email_label"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: t("candidates.phone_label"),
      width: 150,
      renderCell: (params) => params.value || "-",
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
            renderCell: (params: any) => (
              <ActionsCell
                onEdit={() => handleEditClick(params.row)}
                onDelete={() => handleDeleteClick(params.row)}
              />
            ),
          } as GridColDef,
        ]
      : []),
  ];

  // Mobile view (card layout)
  if (isMobile) {
    if (isLoading && !data) {
      return (
        <Box sx={{ width: "100%" }}>
          {[1, 2, 3].map((i) => (
            <CandidateCardSkeleton key={i} />
          ))}
        </Box>
      );
    }

    return (
      <>
        {candidates.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            {candidates.map((candidate) => (
              <CandidateCardView
                key={candidate.uid}
                candidate={candidate}
                canManage={canManage}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </Box>
        ) : (
          <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary">
              {t("candidates.no_candidates")}
            </Typography>
          </Paper>
        )}

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
  }

  // Desktop view (DataGrid)
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

  return (
    <>
      <Box sx={{ height: 600, width: "100%" }}>
        <EnhancedDataGrid
          rows={candidates}
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
          onboardingKey="candidates-list"
          localeText={{
            noRowsLabel: t("candidates.no_candidates"),
          }}
        />
      </Box>

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
