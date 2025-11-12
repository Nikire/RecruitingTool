import {useState} from 'react';
import {
	Box,
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Chip,
	Card,
	CardContent,
	CardActionArea,
	Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import {useListHiringProcesses} from '../../hooks/api/useHiringProcess';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {HiringProcess, HiringProcessStatus} from '../../types/hiringProcess.types';
import CreateHiringProcessDialog from '../../components/dialogs/CreateHiringProcessDialog';
import {useNavigate} from 'react-router-dom';
import {canManageResources} from '../../utils/permissions';
import Pagination from '../../components/pagination/Pagination';
import SearchBar from '../../components/search/SearchBar';

const getStatusColor = (status: HiringProcessStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
	switch (status) {
		case 'OPEN':
			return 'info';
		case 'IN_PROGRESS':
			return 'primary';
		case 'CLOSED':
			return 'success';
		case 'CANCELLED':
			return 'default';
		case 'REJECTED':
			return 'error';
		default:
			return 'default';
	}
};

const Dashboard: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
	const {user} = useUserAtom();
	const {data, isLoading, error} = useListHiringProcesses({page, limit, search, sortBy: 'createdAt', sortOrder: 'desc'});
	const {data: jobPositionsData, isLoading: isJobPositionsLoading} = useListJobPositions({page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc'});
	const navigate = useNavigate();

	const hiringProcesses = data?.data;
	const meta = data?.meta;
	const jobPositions = jobPositionsData?.data;

	const canManage = canManageResources(user);

	if (isLoading) {
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
					Error loading hiring processes. Please try again.
				</Typography>
			</Box>
		);
	}

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
						<SearchBar onSearch={handleSearch} placeholder="Search hiring processes..." />
					</Box>

					{processes && processes.length > 0 ? (
				<TableContainer component={Paper} sx={{width: '100%', overflowX: 'auto'}}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell sx={{minWidth: 150}}><strong>Title</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>Company</strong></TableCell>
								<TableCell sx={{minWidth: 100}}><strong>Status</strong></TableCell>
								<TableCell sx={{minWidth: 80}}><strong>Stages</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>Candidate</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>Created By</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>Actions</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{processes.map((process) => (
								<TableRow key={process.uid} hover>
									<TableCell sx={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
										{process.title}
									</TableCell>
									<TableCell>{process.company?.name || 'N/A'}</TableCell>
									<TableCell>
										<Chip
											label={process.status}
											color={getStatusColor(process.status)}
											size="small"
										/>
									</TableCell>
									<TableCell>{process.stages?.length || 0} stages</TableCell>
									<TableCell sx={{maxWidth: 180}}>
										{process.candidate ? (
											<>
												<Typography variant="body2" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
													{process.candidate.name}
												</Typography>
												<Typography variant="caption" color="textSecondary" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>
													{process.candidate.email}
												</Typography>
											</>
										) : (
											'N/A'
										)}
									</TableCell>
									<TableCell sx={{maxWidth: 180}}>
										{process.jobPosition?.createdBy ? (
											<>
												<Typography variant="body2" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
													{process.jobPosition.createdBy.name}
												</Typography>
												<Typography variant="caption" color="textSecondary" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>
													{process.jobPosition.createdBy.email}
												</Typography>
											</>
										) : (
											'N/A'
										)}
									</TableCell>
									<TableCell>
										<Button
											size="small"
											variant="outlined"
											onClick={() => navigate(`/hiring-process/${process.uid}`)}
										>
											View Details
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
					) : (
						<Paper sx={{p: 4, textAlign: 'center'}}>
							<Typography variant="body1" color="textSecondary">
								No hiring processes found. {canManage && 'Create your first hiring process to get started.'}
							</Typography>
						</Paper>
					)}

					{meta && <Pagination meta={meta} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />}
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
