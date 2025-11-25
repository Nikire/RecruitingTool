import React, { useState } from 'react';
import { Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { JobPosition } from '../../types/jobPosition.types';
import ManageStagesDialog from '../../components/dialogs/ManageStagesDialog';
import { useJobPositionsSearch } from '../../hooks/api/state/useSearchState';
import { useSearchPaginationHandlers } from '../../hooks/useSearchPaginationHandlers';
import JobPositionsList from '../../components/job-positions/JobPositionsList';
import AdvancedSearchBar from '../../components/search/AdvancedSearchBar';
import { SearchFilters, FilterOption } from '../../types/search';

/**
 * JobPositionsPageWithAdvancedSearch Component
 *
 * Demonstrates advanced search and filtering UI for job positions.
 * This component shows how to integrate the AdvancedSearchBar with:
 * - Status filtering (OPEN, CLOSED, CANCELLED)
 * - Skills filtering (required skills for positions)
 * - Location filtering
 * - Salary range filtering
 * - Date range filtering (posted date)
 *
 * Note: Backend API integration for advanced filters is pending.
 * Currently only basic text search is functional.
 */
const JobPositionsPageWithAdvancedSearch: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null);

  const [searchState, setSearchState] = useJobPositionsSearch();
  const { page, limit } = searchState;

  const { handleSearch, handlePageChange, handleLimitChange } =
    useSearchPaginationHandlers(setSearchState);

  // Advanced search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchState.search || '',
  });

  // Status options for job positions
  const statusOptions: FilterOption[] = [
    { value: 'OPEN', label: t('status.open'), count: 12 },
    { value: 'CLOSED', label: t('status.closed'), count: 5 },
    { value: 'CANCELLED', label: t('status.cancelled'), count: 3 },
  ];

  // Sample skills for job positions
  const skillsOptions = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'C#',
    '.NET',
    'SQL',
    'MongoDB',
    'AWS',
    'Azure',
    'Docker',
    'Kubernetes',
    'Microservices',
    'REST APIs',
    'GraphQL',
    'Agile',
    'Scrum',
    'Leadership',
    'Project Management',
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

  const handleCloseStagesDialog = () => {
    setSelectedJobPosition(null);
  };

  return (
    <Box>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {t('job_positions.title')}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {t('job_positions.subtitle')}
        </Typography>
      </Box>

      {/* Advanced Search Bar with Filters */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <AdvancedSearchBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearchQueryChange}
          placeholder={t('job_positions.search_placeholder')}
          statusOptions={statusOptions}
          skillsOptions={skillsOptions}
          showSkills={true}
          showLocation={true}
          showSalary={true}
          showDateRange={true}
          resultsCount={undefined} // TODO: Get from API response
        />
      </Box>

      <JobPositionsList
        page={page}
        limit={limit}
        search={filters.query || ''}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {selectedJobPosition && (
        <ManageStagesDialog
          open={!!selectedJobPosition}
          onClose={handleCloseStagesDialog}
          jobPositionUid={selectedJobPosition.uid}
          jobPositionTitle={selectedJobPosition.title}
          existingStages={selectedJobPosition.stages}
        />
      )}
    </Box>
  );
};

export default JobPositionsPageWithAdvancedSearch;
