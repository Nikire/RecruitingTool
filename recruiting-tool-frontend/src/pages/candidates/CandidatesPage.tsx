import {
  Button,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import { useAuthMe } from "../../hooks/api/useAuth";
import { useCandidatesSearch } from "../../hooks/api/state/useSearchState";
import { useSearchPaginationHandlers } from "../../hooks/useSearchPaginationHandlers";
import { useDialog } from "../../hooks/useDialog";
import CreateCandidateDialog from "../../components/dialogs/CreateCandidateDialog";
import ManualCandidateDialog from "../../components/dialogs/ManualCandidateDialog";
import ImportCandidatesDialog from "../../components/dialogs/ImportCandidatesDialog";
import { canManageResources } from "../../utils/permissions";
import { FilterBar, FilterBarFilters } from "../../components/filters";
import CandidatesList from "../../components/candidates/CandidatesList";
import {
  AccessDeniedMessage,
  PageHeader,
  CenteredLoadingSpinner,
} from "../../components/common";

const CandidatesPage: React.FC = () => {
  const { t } = useTranslation();
  const createDialog = useDialog<never>();
  const manualDialog = useDialog<never>();
  const importDialog = useDialog<never>();
  const { user, isLoading: userLoading } = useAuthMe();
  const [searchState, setSearchState] = useCandidatesSearch();
  const { page, limit, search } = searchState;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const canManage = canManageResources(user);

  // Wait for user data to load before checking permissions (fixes race condition)
  if (userLoading) {
    return <CenteredLoadingSpinner />;
  }

  const { handleSearch, handlePageChange, handleLimitChange } =
    useSearchPaginationHandlers(setSearchState);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateFromApplication = () => {
    handleMenuClose();
    createDialog.open();
  };

  const handleCreateManual = () => {
    handleMenuClose();
    manualDialog.open();
  };

  const handleImportCSV = () => {
    handleMenuClose();
    importDialog.open();
  };

  // Handle filter changes from FilterBar
  const handleFilterChange = (filters: FilterBarFilters) => {
    setSearchState({
      ...searchState,
      search: filters.search,
    });
  };

  // Check if user has access (HR, ADMIN, or SUPER_ADMIN)
  if (!canManage) {
    return (
      <AccessDeniedMessage requiredRoles={["HR", "ADMIN", "SUPER_ADMIN"]} />
    );
  }

  return (
    <Box>
      <PageHeader
        title="candidates.title"
        secondaryActions={
          canManage ? (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleMenuOpen}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minHeight: "44px",
                }}
                aria-label={t("candidates.create_candidate")}
                aria-controls={anchorEl ? "add-candidate-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? "true" : undefined}
              >
                {t("candidates.create_candidate")}
              </Button>
              <Menu
                id="add-candidate-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{
                  "aria-labelledby": "add-candidate-button",
                }}
              >
                <MenuItem onClick={handleCreateFromApplication}>
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {t("candidates.create_from_application")}
                  </ListItemText>
                </MenuItem>
                <MenuItem onClick={handleCreateManual}>
                  <ListItemIcon>
                    <PersonAddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("candidates.create_manual")}
                    secondary={t("candidates.create_manual_hint")}
                  />
                </MenuItem>
                <MenuItem onClick={handleImportCSV}>
                  <ListItemIcon>
                    <UploadFileIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("candidates.import_csv")}
                    secondary={t("candidates.import_csv_hint")}
                  />
                </MenuItem>
              </Menu>
            </>
          ) : undefined
        }
      />

      <FilterBar
        filters={{ search }}
        onChange={handleFilterChange}
        searchPlaceholder={t("candidates.search_placeholder")}
      />

      <CandidatesList
        page={page}
        limit={limit}
        search={search}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <CreateCandidateDialog
        open={createDialog.isOpen}
        onClose={createDialog.close}
      />

      <ManualCandidateDialog
        open={manualDialog.isOpen}
        onClose={manualDialog.close}
      />

      <ImportCandidatesDialog
        open={importDialog.isOpen}
        onClose={importDialog.close}
      />
    </Box>
  );
};

export default CandidatesPage;
