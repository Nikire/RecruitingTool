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
import {useHiringProcesses} from '../../hooks/api/useHiringProcess';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {HiringProcess, HiringProcessStatus} from '../../types/hiringProcess.types';
import CreateHiringProcessDialog from '../../components/dialogs/CreateHiringProcessDialog';
import {useNavigate} from 'react-router-dom';
import {canManageResources} from '../../utils/permissions';

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
	const {user} = useUserAtom();
	const {data: hiringProcesses, isLoading, error} = useHiringProcesses();
	const navigate = useNavigate();

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

	const processes = hiringProcesses as HiringProcess[] | undefined;

	// Get unique companies from hiring processes
	const companies = processes ? [...new Set(processes.map(p => p.company?.name).filter(Boolean))] : [];
	const companyDisplay = companies.length > 0 ? companies.join(', ') : 'All Companies';

	return (
		<Box sx={{p: 4}}>
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

			{processes && processes.length > 0 ? (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><strong>Title</strong></TableCell>
								<TableCell><strong>Company</strong></TableCell>
								<TableCell><strong>Status</strong></TableCell>
								<TableCell><strong>Stages</strong></TableCell>
								<TableCell><strong>Candidate</strong></TableCell>
								<TableCell><strong>Created By</strong></TableCell>
								<TableCell><strong>Actions</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{processes.map((process) => (
								<TableRow key={process.uid} hover>
									<TableCell>{process.title}</TableCell>
									<TableCell>{process.company?.name || 'N/A'}</TableCell>
									<TableCell>
										<Chip
											label={process.status}
											color={getStatusColor(process.status)}
											size="small"
										/>
									</TableCell>
									<TableCell>{process.stages?.length || 0} stages</TableCell>
									<TableCell>
										{process.candidate ? (
											<>
												{process.candidate.name}
												<br />
												<Typography variant="caption" color="textSecondary">
													{process.candidate.email}
												</Typography>
											</>
										) : (
											'N/A'
										)}
									</TableCell>
									<TableCell>
										{process.jobPosition?.createdBy ? (
											<>
												{process.jobPosition.createdBy.name}
												<br />
												<Typography variant="caption" color="textSecondary">
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

			<CreateHiringProcessDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
			/>
		</Box>
	);
};

export default Dashboard;
