import { GridRenderCellParams, GridRowParams } from "@mui/x-data-grid";
import { Box, Typography, IconButton, Link as MuiLink } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useListCandidates } from "../../hooks/api/useCandidates";
import { useDialog } from "../../hooks/useDialog";
import { Candidate } from "../../types/candidate";
import { SearchableListProps } from "../../types";
import UpdateCandidateDialog from "../dialogs/UpdateCandidateDialog";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { canManageResources } from "../../utils/permissions";
import { DateCell } from "../tables";
import { DataTable, DataTableColumn } from "../shared/DataTable";

const CandidatesList: React.FC<SearchableListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const navigate = useNavigate();
  const canManage = canManageResources(user);

  const updateDialog = useDialog<Candidate>();

  const openCandidate = (candidateUid: string) =>
    navigate(`/hr/candidates/${candidateUid}`);

  const { data, isLoading, error } = useListCandidates({
    page,
    limit,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const candidates = data?.data || [];
  const totalRows = data?.meta?.total || 0;

  const columns: DataTableColumn<Candidate>[] = [
    {
      field: "name",
      headerName: t("candidates.name_label"),
      flex: 1,
      minWidth: 150,
      // The mobile card has no row-click affordance of its own, so the name
      // itself is the link into the candidate profile.
      mobileRender: (candidate: Candidate) => (
        <MuiLink
          component="button"
          type="button"
          underline="hover"
          onClick={() => openCandidate(candidate.uid)}
          sx={{ display: "block", textAlign: "left", mb: 1 }}
          aria-label={t("candidate_detail.open_profile", {
            name: candidate.name,
          })}
        >
          {/* `component="span"` keeps the label phrasing content — a heading
              element is not valid inside a <button>. */}
          <Typography
            variant="h6"
            component="span"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            {candidate.name}
          </Typography>
        </MuiLink>
      ),
    },
    {
      field: "email",
      headerName: t("candidates.email_label"),
      flex: 1,
      minWidth: 200,
      mobileRender: (candidate: Candidate) => (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {t("candidates.email_label")}: {candidate.email}
        </Typography>
      ),
    },
    {
      field: "phone",
      headerName: t("candidates.phone_label"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => params.value || "-",
      mobileRender: (candidate: Candidate) =>
        candidate.phone ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {t("candidates.phone_label")}: {candidate.phone}
          </Typography>
        ) : null,
    },
    {
      field: "createdByName",
      headerName: t("candidates.created_by_label"),
      width: 180,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
      mobileRender: (candidate: Candidate) =>
        candidate.createdByName ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {t("candidates.created_by_label")}: {candidate.createdByName}
          </Typography>
        ) : null,
    },
    {
      field: "createdAt",
      headerName: t("common.created"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <DateCell value={params.value} />
      ),
    },
    ...(canManage
      ? [
          {
            field: "actions",
            headerName: t("common.actions"),
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params: { row: Candidate }) => (
              <IconButton
                size="small"
                color="primary"
                // The row itself navigates to the candidate profile. Without
                // stopping propagation here the pencil would open the edit
                // dialog AND navigate away from underneath it.
                onClick={(event) => {
                  event.stopPropagation();
                  updateDialog.openWith(params.row);
                }}
                aria-label={t("common.edit")}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            ),
            mobileRender: (candidate: Candidate) => (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => updateDialog.openWith(candidate)}
                  aria-label={t("common.edit")}
                  sx={{ minHeight: 44, minWidth: 44 }}
                >
                  <EditIcon />
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
        dataGridProps={{
          onRowClick: (params: GridRowParams) =>
            openCandidate((params.row as Candidate).uid),
          sx: { "& .MuiDataGrid-row": { cursor: "pointer" } },
        }}
      />

      <UpdateCandidateDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        candidate={updateDialog.selectedItem}
      />
    </>
  );
};

export default CandidatesList;
