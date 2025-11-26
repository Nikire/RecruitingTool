import {useState} from 'react';
import {Typography, Box, useTheme, useMediaQuery} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {JobPosition} from '../../types/jobPosition.types';
import {JobPositionsPageWrapper} from './JobPositionsPage.styles';
import ManageStagesDialog from '../../components/dialogs/ManageStagesDialog';
import {useJobPositionsSearch} from '../../hooks/api/state/useSearchState';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import JobPositionsList from '../../components/job-positions/JobPositionsList';
import SearchBar from '../../components/search/SearchBar';

const JobPositionsPage: React.FC = () => {
	const {t} = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [selectedJobPosition, setSelectedJobPosition] =
		useState<JobPosition | null>(null);

	const [searchState, setSearchState] = useJobPositionsSearch();
	const {page, limit, search} = searchState;

	const {handleSearch, handlePageChange, handleLimitChange} =
		useSearchPaginationHandlers(setSearchState);

	const handleCloseStagesDialog = () => {
		setSelectedJobPosition(null);
	};

	return (
		<Box>
			<Box sx={{mb: {xs: 2, sm: 3}}}>
				<Typography
					variant={isMobile ? 'h5' : 'h4'}
					sx={{
						fontSize: {xs: '1.5rem', sm: '1.75rem', md: '2rem'},
						fontWeight: 600,
						mb: 0.5,
					}}
				>
					{t('job_positions.title')}
				</Typography>
				<Typography
					variant="body2"
					color="textSecondary"
					sx={{fontSize: {xs: '0.875rem', sm: '1rem'}}}
				>
					{t('job_positions.subtitle')}
				</Typography>
			</Box>

			<Box sx={{mb: {xs: 2, sm: 3}, maxWidth: {xs: '100%', md: 400}}}>
				<SearchBar
					onSearch={handleSearch}
					placeholder={t('job_positions.search_placeholder')}
					value={search}
				/>
			</Box>

			<JobPositionsList
				page={page}
				limit={limit}
				search={search}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
				publicMode={true}
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

export default JobPositionsPage;
