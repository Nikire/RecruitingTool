import {useState} from 'react';
import {Typography, Button, Box, CircularProgress} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import {JobPositionsPageWrapper} from './JobPositionsPage.styles';
import JobPositionCard from '../../components/cards/job-position-cards/JobPositionCard';
import CreateJobPositionDialog from '../../components/dialogs/CreateJobPositionDialog';
import ManageStagesDialog from '../../components/dialogs/ManageStagesDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import Pagination from '../../components/pagination/Pagination';
import SearchBar from '../../components/search/SearchBar';

const JobPositionsPage: React.FC = () => {
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const {user} = useUserAtom();
	const {data, isLoading: isJobPositionsLoading, error} = useListJobPositions({page, limit, search, sortBy: 'createdAt', sortOrder: 'desc'});

	const jobPositions = data?.data;
	const meta = data?.meta;

	const canManage = canManageResources(user);

	const handleSearch = (value: string) => {
		setSearch(value);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setPage(1); // Reset to first page when changing limit
	};

	const handleManageStages = (jobPosition: JobPosition) => {
		setSelectedJobPosition(jobPosition);
	};

	const handleCloseStagesDialog = () => {
		setSelectedJobPosition(null);
	};

	if (isJobPositionsLoading) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{p: 4}}>
				<Typography color="error">
					Error loading job positions. Please try again.
				</Typography>
			</Box>
		);
	}

	if (!jobPositions) {
		return (
			<Box sx={{p: 4}}>
				<Typography>No data found</Typography>
			</Box>
		);
	}

	return (
		<JobPositionsPageWrapper>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
				<Typography variant="h6">
					Open job positions:
				</Typography>
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
				<SearchBar onSearch={handleSearch} placeholder="Search job positions..." />
			</Box>

			{jobPositions.map((jp) => (
				<JobPositionCard
					key={jp.uid}
					jobPosition={jp}
					onManageStages={() => handleManageStages(jp)}
					canManageStages={canManage}
				/>
			))}

			{meta && <Pagination meta={meta} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />}

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
