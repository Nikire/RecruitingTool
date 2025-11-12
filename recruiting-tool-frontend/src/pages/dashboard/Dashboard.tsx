import {useState, useCallback} from 'react';
import {Box, Typography, Button, CircularProgress} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useListHiringProcesses} from '../../hooks/api/useHiringProcess';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useHiringProcessesSearch} from '../../hooks/api/state/useSearchState';
import {HiringProcess} from '../../types/hiringProcess.types';
import CreateHiringProcessDialog from '../../components/dialogs/CreateHiringProcessDialog';
import {canManageResources} from '../../utils/permissions';
import SearchBar from '../../components/search/SearchBar';
import HiringProcessesList from '../../components/hiring-processes/HiringProcessesList';
import JobPositionsFolderView from '../../components/job-positions/JobPositionsFolderView';

const Dashboard: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const [searchState, setSearchState] = useHiringProcessesSearch();
	const {page, limit, search} = searchState;
	const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
	const {user} = useUserAtom();
	// Only fetch hiring processes for folders view (to get company display and pass to JobPositionsFolderView)
	const {data, isLoading, error} = useListHiringProcesses({
		page: 1,
		limit: 1000,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const handleSearch = useCallback((value: string) => {
		setSearchState((prev) => ({...prev, search: value, page: 1}));
	}, [setSearchState]);

	const handlePageChange = useCallback((newPage: number) => {
		setSearchState((prev) => ({...prev, page: newPage}));
	}, [setSearchState]);

	const handleLimitChange = useCallback((newLimit: number) => {
		setSearchState((prev) => ({...prev, limit: newLimit, page: 1}));
	}, [setSearchState]);

	const hiringProcesses = data?.data;
	const canManage = canManageResources(user);

	// Get unique companies from hiring processes (for folders view)
	const processes = hiringProcesses as HiringProcess[] | undefined;
	const companies = processes ? [...new Set(processes.map(p => p.company?.name).filter(Boolean))] : [];
	const companyDisplay = companies.length > 0 ? companies.join(', ') : 'All Companies';

	// Only show loading/error for folders view
	if (viewMode === 'folders') {
		if (isLoading && !data) {
			return (
				<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
					<CircularProgress />
				</Box>
			);
		}

		if (error && !data) {
			return (
				<Box sx={{p: 4}}>
					<Typography color="error">
						Error loading hiring processes. Please try again.
					</Typography>
				</Box>
			);
		}
	}

	return (
		<Box sx={{width: '100%'}}>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
				<Typography variant="h4">
					Hiring Processes Dashboard
				</Typography>
				<Box sx={{display: 'flex', gap: 2}}>
					<Button
						variant={viewMode === 'folders' ? 'contained' : 'outlined'}
						onClick={() => setViewMode('folders')}
					>
						Folders
					</Button>
					<Button
						variant={viewMode === 'list' ? 'contained' : 'outlined'}
						onClick={() => setViewMode('list')}
					>
						List View
					</Button>
					{canManage && (
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setOpenDialog(true)}
						>
							Create Hiring Process
						</Button>
					)}
				</Box>
			</Box>

			<Box sx={{mb: 3}}>
				<Typography variant="subtitle1" color="textSecondary">
					{companyDisplay}
				</Typography>
			</Box>

			{viewMode === 'folders' ? (
				<JobPositionsFolderView hiringProcesses={processes} />
			) : (
				<>
					<Box sx={{mb: 3, maxWidth: 400}}>
						<SearchBar onSearch={handleSearch} placeholder="Search hiring processes..." value={search} />
					</Box>

					<HiringProcessesList
						page={page}
						limit={limit}
						search={search}
						onPageChange={handlePageChange}
						onLimitChange={handleLimitChange}
					/>
				</>
			)}

			<CreateHiringProcessDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
			/>
		</Box>
	);
};

export default Dashboard;
