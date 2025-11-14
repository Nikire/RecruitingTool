import {useState, useCallback} from 'react';
import {Typography, Box} from '@mui/material';
import {JobPosition} from '../../types/jobPosition.types';
import {JobPositionsPageWrapper} from './JobPositionsPage.styles';
import ManageStagesDialog from '../../components/dialogs/ManageStagesDialog';
import {useJobPositionsSearch} from '../../hooks/api/state/useSearchState';
import JobPositionsList from '../../components/job-positions/JobPositionsList';
import SearchBar from '../../components/search/SearchBar';

const JobPositionsPage: React.FC = () => {
	const [selectedJobPosition, setSelectedJobPosition] =
		useState<JobPosition | null>(null);

	const [searchState, setSearchState] = useJobPositionsSearch();
	const {page, limit, search} = searchState;

	const handleSearch = useCallback((value: string) => {
		setSearchState((prev) => ({...prev, search: value, page: 1}));
	}, [setSearchState]);

	const handlePageChange = useCallback((newPage: number) => {
		setSearchState((prev) => ({...prev, page: newPage}));
	}, [setSearchState]);

	const handleLimitChange = useCallback((newLimit: number) => {
		setSearchState((prev) => ({...prev, limit: newLimit, page: 1}));
	}, [setSearchState]);

	const handleManageStages = (jobPosition: JobPosition) => {
		setSelectedJobPosition(jobPosition);
	};

	const handleCloseStagesDialog = () => {
		setSelectedJobPosition(null);
	};

	return (
		<JobPositionsPageWrapper>
			<Box sx={{mb: 2}}>
				<Typography variant="h6">Open job positions:</Typography>
			</Box>

			<Box sx={{mb: 3, maxWidth: 400}}>
				<SearchBar
					onSearch={handleSearch}
					placeholder="Search job positions..."
					value={search}
				/>
			</Box>

			<JobPositionsList
				page={page}
				limit={limit}
				search={search}
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
		</JobPositionsPageWrapper>
	);
};

export default JobPositionsPage;
