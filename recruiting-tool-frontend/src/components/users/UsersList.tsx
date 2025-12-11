import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useListUsers, useDeleteUser } from "../../hooks/api/useUsers";
import { User, UserRoles } from "../../types/user.types";
import UpdateUserDialog from "../dialogs/UpdateUserDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { hasRole } from "../../utils/permissions";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import { useDialog } from "../../hooks/useDialog";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import { StatusChip } from "../common";
import { EnhancedDataGrid, ActionsCell, DateCell } from "../tables";

interface UsersListProps {
  page: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// Skeleton loader for loading state
const UserCardSkeleton = () => (
  <Card sx={{ mb: 2, p: 2 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="50%" height={20} />
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={80} height={24} />
      </Box>
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="40%" height={20} />
      <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </Stack>
  </Card>
);

// Mobile card view component
const UserCardView: React.FC<{
  user: User;
  isSuperAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}> = ({ user, isSuperAdmin, onEdit, onDelete }) => {
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
          {user.name}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {user.email}
        </Typography>

        <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
          {user.roles.map((role) => (
            <StatusChip key={role} status={role} type="userRole" size="small" />
          ))}
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {t("users.company_label")}: {user.company?.name || "-"}
        </Typography>

        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: "block", mb: 2 }}
        >
          {t("users.created_label")}:{" "}
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
        </Typography>

        {isSuperAdmin && (
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
              onClick={() => onEdit(user)}
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
              onClick={() => onDelete(user)}
              aria-label={t("users.delete_user_tooltip")}
              sx={{
                minHeight: 44,
                minWidth: 44,
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const UsersList: React.FC<UsersListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("users.name_label"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: t("users.email_label"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "roles",
      headerName: t("users.roles_label"),
      width: 200,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {params.row.roles.map((role) => (
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
    },
    {
      field: "createdAt",
      headerName: t("users.created_label"),
      width: 130,
      renderCell: (params) => <DateCell value={params.value} />,
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
            renderCell: (params: GridRenderCellParams<User>) => (
              <ActionsCell
                onEdit={() => updateDialog.openWith(params.row)}
                onDelete={() => deleteConfirm.confirmDelete(params.row)}
              />
            ),
          } as GridColDef,
        ]
      : []),
  ];

  // Show skeleton loader on INITIAL load, not on refetch
  if (isLoading && !data) {
    if (isMobile) {
      return (
        <Box sx={{ width: "100%" }}>
          {[1, 2, 3].map((i) => (
            <UserCardSkeleton key={i} />
          ))}
        </Box>
      );
    }
    // Desktop loading is handled by EnhancedDataGrid
  }

  if (error && !data) {
    return <ErrorMessage message="users.error_loading" />;
  }

  // Mobile view (card layout)
  if (isMobile) {
    return (
      <>
        {users.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            {users.map((user) => (
              <UserCardView
                key={user.uid}
                user={user}
                isSuperAdmin={isSuperAdmin}
                onEdit={updateDialog.openWith}
                onDelete={deleteConfirm.confirmDelete}
              />
            ))}
          </Box>
        ) : (
          <EmptyState message="users.no_users" />
        )}

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
  }

  // Desktop view (DataGrid)
  return (
    <>
      <Box sx={{ height: 600, width: "100%" }}>
        <EnhancedDataGrid
          rows={users}
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
          onboardingKey="users-list"
          localeText={{
            noRowsLabel: t("users.no_users"),
          }}
        />
      </Box>

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
