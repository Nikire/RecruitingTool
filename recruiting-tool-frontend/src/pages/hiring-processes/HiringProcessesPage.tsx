import { Button, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import { useAuthMe } from "../../hooks/api/useAuth";
import { useHiringProcessesSearch } from "../../hooks/api/state/useSearchState";
import { useSearchPaginationHandlers } from "../../hooks/useSearchPaginationHandlers";
import { useDialog } from "../../hooks/useDialog";
import CreateHiringProcessDialog from "../../components/dialogs/CreateHiringProcessDialog";
import { canManageResources } from "../../utils/permissions";
import { FilterBar, FilterBarFilters } from "../../components/filters";
import HiringProcessesList from "../../components/hiring-processes/HiringProcessesList";
import {
  AccessDeniedMessage,
  PageHeader,
  CenteredLoadingSpinner,
} from "../../components/common";

const HiringProcessesPage: React.FC = () => {
  const { t } = useTranslation();
  const createDialog = useDialog<never>();
  const { user, isLoading: userLoading } = useAuthMe();
  const [searchState, setSearchState] = useHiringProcessesSearch();
  const { page, limit, search } = searchState;

  const canManage = canManageResources(user);

  // Call hooks before any early returns
  const { handlePageChange, handleLimitChange } =
    useSearchPaginationHandlers(setSearchState);

  // Wait for user data to load before checking permissions (fixes race condition)
  if (userLoading) {
    return <CenteredLoadingSpinner />;
  }

  // Check if user has access (HR, ADMIN, or SUPER_ADMIN)
  if (!canManage) {
    return (
      <AccessDeniedMessage requiredRoles={["HR", "ADMIN", "SUPER_ADMIN"]} />
    );
  }

  // Handle filter changes from FilterBar
  const handleFilterChange = (filters: FilterBarFilters) => {
    setSearchState({
      ...searchState,
      search: filters.search,
    });
  };

  return (
    <Box>
      <PageHeader
        title="hiring_processes.title"
        secondaryActions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={createDialog.open}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minHeight: "44px",
              }}
              aria-label={t("hiring_processes.create_title")}
            >
              {t("hiring_processes.create_title")}
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        filters={{ search }}
        onChange={handleFilterChange}
        searchPlaceholder={t("hiring_processes.search_placeholder")}
      />

      <HiringProcessesList
        page={page}
        limit={limit}
        search={search}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <CreateHiringProcessDialog
        open={createDialog.isOpen}
        onClose={createDialog.close}
      />
    </Box>
  );
};

export default HiringProcessesPage;
