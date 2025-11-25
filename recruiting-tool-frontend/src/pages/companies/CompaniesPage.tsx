import React, { useState } from 'react';
import {Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField} from '@mui/material';
import {useTranslation} from 'react-i18next';
import { Add as AddIcon } from '@mui/icons-material';
import { useCreateCompany, useDeleteCompany } from '../../hooks/api/useCompanies';
import { useUserAtom } from '../../hooks/api/state/useUserAtom';
import { useCompaniesSearch } from '../../hooks/api/state/useSearchState';
import { useSearchPaginationHandlers } from '../../hooks/useSearchPaginationHandlers';
import { useDialog } from '../../hooks/useDialog';
import { hasRole } from '../../utils/permissions';
import { UserRoles } from '../../types/user.types';
import { Company, CreateCompanyDto } from '../../types/company.types';
import SearchBar from '../../components/search/SearchBar';
import CompaniesList from '../../components/companies/CompaniesList';
import UpdateCompanyDialog from '../../components/dialogs/UpdateCompanyDialog';
import ConfirmDeleteDialog from '../../components/dialogs/ConfirmDeleteDialog';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

export const CompaniesPage: React.FC = () => {
  const {t} = useTranslation();
  const { user } = useUserAtom();
  const [searchState, setSearchState] = useCompaniesSearch();
  const { page, limit, search } = searchState;

  const createMutation = useCreateCompany();
  const deleteMutation = useDeleteCompany();

  const createDialog = useDialog<never>();
  const editDialog = useDialog<Company>();
  const deleteDialog = useDialog<Company>();

  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: '',
    description: '',
  });

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={['SUPER_ADMIN']} />;
  }

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        createDialog.close();
        setFormData({ name: '', description: '' });
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

  const {handleSearch, handlePageChange, handleLimitChange} =
    useSearchPaginationHandlers(setSearchState);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: {xs: 'column', sm: 'row'},
          justifyContent: 'space-between',
          alignItems: {xs: 'flex-start', sm: 'center'},
          mb: {xs: 2, sm: 3},
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{fontSize: {xs: '1.5rem', sm: '2.125rem'}}}>
          {t('companies.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={createDialog.open}
          sx={{
            width: {xs: '100%', sm: 'auto'},
            minHeight: '44px',
          }}
          aria-label={t('companies.add_company')}
        >
          {t('companies.add_company')}
        </Button>
      </Box>

      <Box sx={{ mb: 3, maxWidth: {xs: '100%', sm: 400} }}>
        <SearchBar onSearch={handleSearch} placeholder={t('companies.search_placeholder')} value={search} />
      </Box>

      <CompaniesList
        page={page}
        limit={limit}
        search={search}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={editDialog.openWith}
        onDelete={deleteDialog.openWith}
      />

      {/* Create Dialog */}
      <Dialog open={createDialog.isOpen} onClose={createDialog.close} maxWidth="sm" fullWidth>
        <DialogTitle>{t('companies.create_title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('companies.name_label')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label={t('companies.description_label')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={createDialog.close}>{t('common.cancel')}</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!formData.name || createMutation.isPending}>
            {createMutation.isPending ? t('companies.creating') : t('common.create')}
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
        title={t('companies.delete_title')}
        message={t('companies.delete_message')}
        itemName={deleteDialog.selectedItem?.name}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
};
