import {useState, useCallback} from 'react';
import {Typography, Button, Box} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {JobPosition} from '../../types/jobPosition.types';
import {JobPositionsPageWrapper} from './JobPositionsPage.styles';
import CreateJobPositionDialog from '../../components/dialogs/CreateJobPositionDialog';
import ManageStagesDialog from '../../components/dialogs/ManageStagesDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useJobPositionsSearch} from '../../hooks/api/state/useSearchState';
import {canManageResources} from '../../utils/permissions';
import JobPositionsList from '../../components/job-positions/JobPositionsList';
import SearchBar from '../../components/search/SearchBar';

const JobPositionsPage: React.FC = () => {
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [selectedJobPosition, setSelectedJobPosition] =
		useState<JobPosition | null>(null);

	const {user} = useUserAtom();
	const [searchState, setSearchState] = useJobPositionsSearch();
	const {page, limit, search} = searchState;

	const canManage = canManageResources(user);

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
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 2,
				}}
			>
				<Typography variant="h6">Open job positions:</Typography>
				{canManage && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setOpenCreateDialog(true)}
					>
						Create Job Position
					</Button>
				)}
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
				onManageStages={handleManageStages}
				canManageStages={canManage}
			/>

			<CreateJobPositionDialog
				open={openCreateDialog}
				onClose={() => setOpenCreateDialog(false)}
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
