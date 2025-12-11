import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useListUsers, useDeleteUser } from "../../hooks/api/useUsers";
import { User, UserRoles } from "../../types/user.types";
import UpdateUserDialog from "../dialogs/UpdateUserDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { hasRole } from "../../utils/permissions";
import { useDialog } from "../../hooks/useDialog";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import { StatusChip } from "../common";
import { ActionsCell, DateCell } from "../tables";
import { DataTable, DataTableColumn } from "../shared/DataTable";

interface UsersListProps {
  page: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation();
  const { user: currentUser } = useUserAtom();
  const isSuperAdmin = hasRole(currentUser, UserRoles.SUPER_ADMIN);

  // Dialog state management using custom hooks
  const updateDialog = useDialog<User>();
  const deleteMutation = useDeleteUser();
  const deleteConfirm = useConfirmDelete<User>(deleteMutation);

  const { data, isLoading, error } = useListUsers({
    page,
    limit,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const users = data?.data || [];
  const totalRows = data?.meta?.total || 0;

  const columns: DataTableColumn<User>[] = [
    {
      field: "name",
      headerName: t("users.name_label"),
      flex: 1,
      minWidth: 150,
      mobileRender: (user) => (
        <Typography
          variant="h6"
          sx={{ mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {user.name}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: t("users.email_label"),
      flex: 1,
      minWidth: 200,
      mobileRender: (user) => (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {user.email}
        </Typography>
      ),
    },
    {
      field: "roles",
      headerName: t("users.roles_label"),
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {params.row.roles.map((role) => (
            <StatusChip key={role} status={role} type="userRole" size="small" />
          ))}
        </Box>
      ),
      mobileRender: (user) => (
        <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
          {user.roles.map((role) => (
            <StatusChip key={role} status={role} type="userRole" size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: "company",
      headerName: t("users.company_label"),
      width: 150,
      valueGetter: (value: { name?: string } | unknown) => value?.name || "-",
      mobileRender: (user) => (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {t("users.company_label")}: {user.company?.name || "-"}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: t("users.created_label"),
      width: 130,
      renderCell: (params) => <DateCell value={params.value} />,
      mobileRender: (user) => (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: "block", mb: 2 }}
        >
          {t("users.created_label")}:{" "}
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
        </Typography>
      ),
    },
    ...(isSuperAdmin
      ? [
          {
            field: "actions",
            headerName: t("common.actions"),
            width: 120,
            sortable: false,
            filterable: false,
            align: "right" as const,
            headerAlign: "right" as const,
            renderCell: (params: { row: User }) => (
              <ActionsCell
                onEdit={() => updateDialog.openWith(params.row)}
                onDelete={() => deleteConfirm.confirmDelete(params.row)}
              />
            ),
            mobileRender: (user: User) => (
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
                  onClick={() => updateDialog.openWith(user)}
                  aria-label={t("users.edit_user_tooltip")}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteConfirm.confirmDelete(user)}
                  aria-label={t("users.delete_user_tooltip")}
                  sx={{
                    minHeight: 44,
                    minWidth: 44,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ),
          } as DataTableColumn<User>,
        ]
      : []),
  ];

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        error={!!error}
        emptyMessage="users.no_users"
        errorMessage="users.error_loading"
        onboardingKey="users-list"
        page={page}
        limit={limit}
        totalRows={totalRows}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        serverPagination={true}
      />

      <UpdateUserDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        user={updateDialog.selectedItem}
      />

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onClose={deleteConfirm.handleCancel}
        onConfirm={deleteConfirm.handleConfirm}
        title={t("users.delete_user_title")}
        message={t("users.delete_user_message")}
        itemName={deleteConfirm.selectedItem?.name}
        isDeleting={deleteConfirm.isDeleting}
      />
    </>
  );
};

export default UsersList;
