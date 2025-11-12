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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useListHiringProcesses} from '../../hooks/api/useHiringProcess';
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
	const {user} = useUserAtom();
	const {data, isLoading, error} = useListHiringProcesses({page, limit, search, sortBy: 'createdAt', sortOrder: 'desc'});
	const navigate = useNavigate();

	const hiringProcesses = data?.data;
	const meta = data?.meta;

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
		setPage(1); // Reset to first page on search
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

	return (
		<Box sx={{width: '100%'}}>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
				<Typography variant="h4">
					Hiring Processes Dashboard
				</Typography>
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

			<Box sx={{mb: 3}}>
				<Typography variant="subtitle1" color="textSecondary">
					{companyDisplay}
				</Typography>
			</Box>

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

			<CreateHiringProcessDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
			/>
		</Box>
	);
};

export default Dashboard;
