import {useState, useCallback} from 'react';
import {Box, Typography, Button, CircularProgress, Chip, Card, CardContent, CardActionArea, Divider} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import {useListHiringProcesses} from '../../hooks/api/useHiringProcess';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useHiringProcessesSearch} from '../../hooks/api/state/useSearchState';
import {HiringProcess} from '../../types/hiringProcess.types';
import CreateHiringProcessDialog from '../../components/dialogs/CreateHiringProcessDialog';
import {useNavigate} from 'react-router-dom';
import {canManageResources} from '../../utils/permissions';
import SearchBar from '../../components/search/SearchBar';
import HiringProcessesList from '../../components/hiring-processes/HiringProcessesList';

const Dashboard: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const [searchState, setSearchState] = useHiringProcessesSearch();
	const {page, limit, search} = searchState;
	const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
	const {user} = useUserAtom();
	const {data, isLoading, isFetching, error} = useListHiringProcesses({page, limit, search, sortBy: 'createdAt', sortOrder: 'desc'});
	const {data: jobPositionsData, isLoading: isJobPositionsLoading, isFetching: isJobPositionsFetching} = useListJobPositions({page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc'});
	const navigate = useNavigate();

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
	const jobPositions = jobPositionsData?.data;

	const canManage = canManageResources(user);

	// Only show loading spinner on INITIAL load, not on refetch
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

	const processes = hiringProcesses as HiringProcess[] | undefined;

	// Get unique companies from hiring processes
	const companies = processes ? [...new Set(processes.map(p => p.company?.name).filter(Boolean))] : [];
	const companyDisplay = companies.length > 0 ? companies.join(', ') : 'All Companies';

	// Group hiring processes by job position
	const jobPositionStats = jobPositions?.map(jp => {
		const processCount = processes?.filter(p => p.jobPosition?.uid === jp.uid).length || 0;
		const statusCounts = {
			OPEN: processes?.filter(p => p.jobPosition?.uid === jp.uid && p.status === 'OPEN').length || 0,
			IN_PROGRESS: processes?.filter(p => p.jobPosition?.uid === jp.uid && p.status === 'IN_PROGRESS').length || 0,
			CLOSED: processes?.filter(p => p.jobPosition?.uid === jp.uid && p.status === 'CLOSED').length || 0,
		};
		return {...jp, processCount, statusCounts};
	});

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
				<>
					<Typography variant="h5" sx={{mb: 2}}>
						Job Positions
					</Typography>
					{isJobPositionsLoading ? (
						<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
							<CircularProgress />
						</Box>
					) : (
						<Box sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
							gap: 2,
							mb: 4
						}}>
							{jobPositionStats && jobPositionStats.length > 0 ? (
								jobPositionStats.map((jp) => (
									<Card elevation={2} key={jp.uid}>
										<CardActionArea onClick={() => navigate(`/job-position/${jp.uid}`)}>
											<CardContent>
												<Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
													<FolderIcon sx={{fontSize: 40, color: 'primary.main', mr: 2}} />
													<Box sx={{flex: 1}}>
														<Typography variant="h6" noWrap>
															{jp.title}
														</Typography>
														<Chip label={jp.status} size="small" color={jp.status === 'OPEN' ? 'success' : 'default'} />
													</Box>
												</Box>
												<Divider sx={{my: 1}} />
												<Box sx={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1}}>
													<Typography variant="body2" color="textSecondary">
														Total Processes: <strong>{jp.processCount}</strong>
													</Typography>
												</Box>
												<Box sx={{display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap'}}>
													{jp.statusCounts.OPEN > 0 && (
														<Chip label={`Open: ${jp.statusCounts.OPEN}`} size="small" color="info" variant="outlined" />
													)}
													{jp.statusCounts.IN_PROGRESS > 0 && (
														<Chip label={`In Progress: ${jp.statusCounts.IN_PROGRESS}`} size="small" color="primary" variant="outlined" />
													)}
													{jp.statusCounts.CLOSED > 0 && (
														<Chip label={`Closed: ${jp.statusCounts.CLOSED}`} size="small" color="success" variant="outlined" />
													)}
												</Box>
											</CardContent>
										</CardActionArea>
									</Card>
								))
							) : (
								<Paper sx={{p: 4, textAlign: 'center'}}>
									<Typography variant="body1" color="textSecondary">
										No job positions found.
									</Typography>
								</Paper>
							)}
						</Box>
					)}
				</>
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
