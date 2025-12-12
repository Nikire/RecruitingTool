import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Add as AddIcon } from "@mui/icons-material";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { useUsersSearch } from "../../hooks/api/state/useSearchState";
import { useSearchPaginationHandlers } from "../../hooks/useSearchPaginationHandlers";
import { hasRole } from "../../utils/permissions";
import { UserRoles } from "../../types/user.types";
import { useState } from "react";
import SearchBar from "../../components/search/SearchBar";
import UsersList from "../../components/users/UsersList";
import { AccessDeniedMessage, PageHeader } from "../../components/common";
import CreateUserDialog from "../../components/dialogs/CreateUserDialog";

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [searchState, setSearchState] = useUsersSearch();
  const { page, limit, search } = searchState;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

  const { handleSearch, handlePageChange, handleLimitChange } =
    useSearchPaginationHandlers(setSearchState);

  // Check if user has SUPER_ADMIN access
  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;
  }

  return (
    <Box>
      <PageHeader
        title="users.title"
        action={{
          label: "users.create_user",
          icon: <AddIcon />,
          onClick: () => setCreateDialogOpen(true),
          ariaLabel: t("users.create_user"),
        }}
      />

      <Box sx={{ mb: 3, maxWidth: { xs: "100%", sm: 400 } }}>
        <SearchBar
          onSearch={handleSearch}
          placeholder={t("users.search_placeholder")}
          value={search}
        />
      </Box>

      <UsersList
        page={page}
        limit={limit}
        search={search}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};

export default UserManagementPage;
