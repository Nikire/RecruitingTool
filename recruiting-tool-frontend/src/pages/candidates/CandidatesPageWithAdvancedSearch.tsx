import React, { useState } from 'react';
import { Typography, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { useUserAtom } from '../../hooks/api/state/useUserAtom';
import { useCandidatesSearch } from '../../hooks/api/state/useSearchState';
import { useSearchPaginationHandlers } from '../../hooks/useSearchPaginationHandlers';
import { useDialog } from '../../hooks/useDialog';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import { canManageResources } from '../../utils/permissions';
import AdvancedSearchBar from '../../components/search/AdvancedSearchBar';
import CandidatesList from '../../components/candidates/CandidatesList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';
import { SearchFilters, FilterOption } from '../../types/search';

/**
 * CandidatesPageWithAdvancedSearch Component
 *
 * Demonstrates advanced search and filtering UI for candidates.
 * This component shows how to integrate the AdvancedSearchBar with:
 * - Status filtering
 * - Skills filtering
 * - Location filtering
 * - Experience range filtering
 * - Date range filtering
 *
 * Note: Backend API integration for advanced filters is pending.
 * Currently only basic text search is functional.
 */
const CandidatesPageWithAdvancedSearch: React.FC = () => {
  const { t } = useTranslation();
  const createDialog = useDialog<never>();
  const { user } = useUserAtom();
  const [searchState, setSearchState] = useCandidatesSearch();
  const { page, limit } = searchState;

  const canManage = canManageResources(user);

  const { handleSearch, handlePageChange, handleLimitChange } =
    useSearchPaginationHandlers(setSearchState);

  // Advanced search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchState.search || '',
  });

  // Status options for candidates
  const statusOptions: FilterOption[] = [
    { value: 'ACTIVE', label: t('status.active'), count: 42 },
    { value: 'PENDING', label: t('status.pending'), count: 18 },
    { value: 'REVIEWED', label: t('status.reviewed'), count: 25 },
    { value: 'ACCEPTED', label: t('status.accepted'), count: 15 },
    { value: 'REJECTED', label: t('status.rejected'), count: 8 },
  ];

  // Sample skills for autocomplete
  const skillsOptions = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'AWS',
    'Docker',
    'Kubernetes',
    'Git',
    'Agile',
    'CI/CD',
    'REST APIs',
    'GraphQL',
  ];

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);

    // Update the basic search query if it changed
    if (newFilters.query !== undefined) {
      handleSearch(newFilters.query);
    }

    // TODO: When backend supports advanced filters, pass them to the API
    // For now, we only update the text search
    console.log('Advanced filters updated:', newFilters);
  };

  const handleSearchQueryChange = (query: string) => {
    setFilters({ ...filters, query });
    handleSearch(query);
  };

  // Check if user has access (HR, ADMIN, or SUPER_ADMIN)
  if (!canManage) {
    return <AccessDeniedMessage requiredRoles={['HR', 'ADMIN', 'SUPER_ADMIN']} />;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: { xs: 2, sm: 3 },
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          {t('candidates.title')}
        </Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createDialog.open}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minHeight: '44px',
            }}
            aria-label={t('candidates.create_candidate')}
          >
            {t('candidates.create_candidate')}
          </Button>
        )}
      </Box>

      {/* Advanced Search Bar with Filters */}
      <Box sx={{ mb: 3 }}>
        <AdvancedSearchBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearchQueryChange}
          placeholder={t('candidates.search_placeholder')}
          statusOptions={statusOptions}
          skillsOptions={skillsOptions}
          showSkills={true}
          showLocation={true}
          showExperience={true}
          showDateRange={true}
          resultsCount={undefined} // TODO: Get from API response
        />
      </Box>

      <CandidatesList
        page={page}
        limit={limit}
        search={filters.query || ''}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <CreateCandidateDialog open={createDialog.isOpen} onClose={createDialog.close} />
    </Box>
  );
};

export default CandidatesPageWithAdvancedSearch;
