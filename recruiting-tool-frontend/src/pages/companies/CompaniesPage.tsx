import React, { useState, useCallback } from 'react';
import {Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useCreateCompany, useUpdateCompany, useDeleteCompany } from '../../hooks/api/useCompanies';
import { useUserAtom } from '../../hooks/api/state/useUserAtom';
import { useCompaniesSearch } from '../../hooks/api/state/useSearchState';
import { hasRole } from '../../utils/permissions';
import { UserRoles } from '../../types/user.types';
import { Company, CreateCompanyDto } from '../../types/company.types';
import SearchBar from '../../components/search/SearchBar';
import CompaniesList from '../../components/companies/CompaniesList';

export const CompaniesPage: React.FC = () => {
  const { user } = useUserAtom();
  const [searchState, setSearchState] = useCompaniesSearch();
  const { page, limit, search } = searchState;

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: '',
    description: '',
  });

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography>You do not have permission to access this page.</Typography>
      </Box>
    );
  }

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setFormData({ name: '', description: '' });
      },
    });
  };

  const handleEdit = () => {
    if (!selectedCompany) return;
    updateMutation.mutate(
      { uid: selectedCompany.uid, data: formData },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setSelectedCompany(null);
          setFormData({ name: '', description: '' });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedCompany) return;
    deleteMutation.mutate(selectedCompany.uid, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedCompany(null);
      },
    });
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      description: company.description || '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchState((prev) => ({ ...prev, search: value, page: 1 }));
  }, [setSearchState]);

  const handlePageChange = useCallback((newPage: number) => {
    setSearchState((prev) => ({ ...prev, page: newPage }));
  }, [setSearchState]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setSearchState((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  }, [setSearchState]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Company Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Company
        </Button>
      </Box>

      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <SearchBar onSearch={handleSearch} placeholder="Search companies..." value={search} />
      </Box>

      <CompaniesList
        page={page}
        limit={limit}
        search={search}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Company</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!formData.name || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={!formData.name || updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedCompany?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
