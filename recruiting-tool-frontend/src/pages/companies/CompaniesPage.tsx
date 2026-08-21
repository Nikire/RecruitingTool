import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Add as AddIcon } from "@mui/icons-material";
import {
  useCreateCompany,
  useDeleteCompany,
} from "../../hooks/api/useCompanies";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { useCompaniesSearch } from "../../hooks/api/state/useSearchState";
import { useSearchPaginationHandlers } from "../../hooks/useSearchPaginationHandlers";
import { useDialog } from "../../hooks/useDialog";
import { hasRole } from "../../utils/permissions";
import { UserRoles } from "../../types/user.types";
import { Company, CreateCompanyDto } from "../../types/company.types";
import SearchBar from "../../components/search/SearchBar";
import CompaniesList from "../../components/companies/CompaniesList";
import UpdateCompanyDialog from "../../components/dialogs/UpdateCompanyDialog";
import ConfirmDeleteDialog from "../../components/dialogs/ConfirmDeleteDialog";
import { AccessDeniedMessage, PageHeader } from "../../components/common";

export const CompaniesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [searchState, setSearchState] = useCompaniesSearch();
  const { page, limit, search } = searchState;

  const createMutation = useCreateCompany();
  const deleteMutation = useDeleteCompany();

  const createDialog = useDialog<never>();
  const editDialog = useDialog<Company>();
  const deleteDialog = useDialog<Company>();

  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: "",
    description: "",
  });

  // Call hooks before any early returns
  const { handleSearch, handlePageChange, handleLimitChange } =
    useSearchPaginationHandlers(setSearchState);

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;
  }

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        createDialog.close();
        setFormData({ name: "", description: "" });
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.selectedItem) return;
    deleteMutation.mutate(deleteDialog.selectedItem.uid, {
      onSuccess: () => {
        deleteDialog.close();
      },
    });
  };

  return (
    <Box>
      <PageHeader
        title="companies.title"
        action={{
          label: "companies.add_company",
          icon: <AddIcon />,
          onClick: createDialog.open,
          ariaLabel: t("companies.add_company"),
        }}
      />

      <Box sx={{ mb: 3, maxWidth: { xs: "100%", sm: 400 } }}>
        <SearchBar
          onSearch={handleSearch}
          placeholder={t("companies.search_placeholder")}
          value={search}
        />
      </Box>

      <CompaniesList
        page={page}
        limit={limit}
        search={search}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={editDialog.openWith}
        onDelete={deleteDialog.openWith}
        onCreate={createDialog.open}
        onClearSearch={() => handleSearch("")}
      />

      {/* Create Dialog */}
      <Dialog
        open={createDialog.isOpen}
        onClose={createDialog.close}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("companies.create_title")}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={t("companies.name_label")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label={t("companies.description_label")}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={createDialog.close}>{t("common.cancel")}</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formData.name || createMutation.isPending}
          >
            {createMutation.isPending
              ? t("companies.creating")
              : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <UpdateCompanyDialog
        open={editDialog.isOpen}
        onClose={editDialog.close}
        company={editDialog.selectedItem}
      />

      <ConfirmDeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleConfirmDelete}
        title={t("companies.delete_title")}
        message={t("companies.delete_message")}
        itemName={deleteDialog.selectedItem?.name}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
};
