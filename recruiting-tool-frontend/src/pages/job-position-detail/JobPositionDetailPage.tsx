import {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
	Box,
	Typography,
	Button,
	Paper,
	CircularProgress,
	Chip,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Card,
	CardContent,
	Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useJobPositions} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import StatusLabel from '../../components/StatusLabel';
import {HiringProcessStatus} from '../../types/hiringProcess.types';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import {ApplyToJobDialog} from '../../components/dialogs/ApplyToJobDialog';

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

const JobPositionDetailPage: React.FC = () => {
	const {uid} = useParams<{uid: string}>();
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const {data: jobPositionData, isLoading, error} = useJobPositions(uid);
	const [statusFilter, setStatusFilter] = useState<HiringProcessStatus | 'ALL'>('ALL');
	const [applyDialogOpen, setApplyDialogOpen] = useState(false);

	const canManage = canManageResources(user);

	const statusOptions: Array<HiringProcessStatus | 'ALL'> = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED', 'REJECTED'];

	if (isLoading) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !jobPositionData) {
		return (
			<Box sx={{p: 4}}>
				<Typography color="error">
					Error loading job position. Please try again.
				</Typography>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/job-positions')}
					sx={{mt: 2}}
				>
					Back to Job Positions
				</Button>
			</Box>
		);
	}

	const jobPosition = jobPositionData as JobPosition;

	// Filter hiring processes by status
	const filteredHiringProcesses = jobPosition.hiringProcesses?.filter(process =>
		statusFilter === 'ALL' || process.status === statusFilter
	) || [];

	return (
		<Box sx={{p: 4}}>
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate('/careers')}
				sx={{mb: 3}}
			>
				Back to Careers
			</Button>

			<Paper sx={{p: 3, mb: 3}}>
				<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
					<Box>
						<Typography variant="h4">{jobPosition.title}</Typography>
						<Typography variant="subtitle1" color="textSecondary">
							{canManage ? 'Hiring Processes Overview' : jobPosition.description || 'Job Posting'}
						</Typography>
					</Box>
					<Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
						<StatusLabel status={jobPosition.status} />
						{jobPosition.status === 'OPEN' && (
							<Button
								variant="contained"
								onClick={() => setApplyDialogOpen(true)}
							>
								Apply Now
							</Button>
						)}
					</Box>
				</Box>

				<Divider sx={{my: 2}} />

				<Box sx={{display: 'flex', gap: 4}}>
					<Box>
						<Typography variant="body2" color="textSecondary">
							Company
						</Typography>
						<Typography variant="body1" sx={{fontWeight: 500}}>
							{jobPosition.companyName || 'N/A'}
						</Typography>
					</Box>
					<Box>
						<Typography variant="body2" color="textSecondary">
							Created By (HR)
						</Typography>
						<Typography variant="body1">
							{jobPosition.createdBy?.name || 'Unknown'}
						</Typography>
						{jobPosition.createdBy?.email && (
							<Typography variant="caption" color="textSecondary">
								{jobPosition.createdBy.email}
							</Typography>
						)}
					</Box>
					<Box>
						<Typography variant="body2" color="textSecondary">
							Total Stages
						</Typography>
						<Typography variant="body1">
							{jobPosition.stages?.length || 0}
						</Typography>
					</Box>
					{canManage && (
						<Box>
							<Typography variant="body2" color="textSecondary">
								Active Hiring Processes
							</Typography>
							<Typography variant="body1">
								{jobPosition.hiringProcesses?.length || 0}
							</Typography>
						</Box>
					)}
				</Box>
			</Paper>

			{canManage && (
				<>
					<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
						<Typography variant="h5">
							Hiring Processes ({filteredHiringProcesses.length} of {jobPosition.hiringProcesses?.length || 0})
						</Typography>
					</Box>

					<Box sx={{mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap'}}>
						{statusOptions.map((status) => {
							const count = status === 'ALL'
								? jobPosition.hiringProcesses?.length || 0
								: jobPosition.hiringProcesses?.filter(p => p.status === status).length || 0;

							return (
								<Chip
									key={status}
									label={`${status.replace(/_/g, ' ')} (${count})`}
									onClick={() => setStatusFilter(status)}
									color={statusFilter === status ? 'primary' : 'default'}
									variant={statusFilter === status ? 'filled' : 'outlined'}
									clickable
								/>
							);
						})}
					</Box>

					{filteredHiringProcesses.length > 0 ? (
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell><strong>Title</strong></TableCell>
										<TableCell><strong>Status</strong></TableCell>
										<TableCell><strong>Candidate</strong></TableCell>
										<TableCell><strong>Actions</strong></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredHiringProcesses.map((process) => (
										<TableRow key={process.uid} hover sx={{backgroundColor: !process.candidate ? 'rgba(255, 193, 7, 0.05)' : 'inherit'}}>
											<TableCell>{process.title}</TableCell>
											<TableCell>
												<Chip
													label={process.status}
													color={getStatusColor(process.status)}
													size="small"
												/>
											</TableCell>
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
													<Typography variant="body2" color="error" sx={{fontWeight: 500}}>
														No candidate assigned
													</Typography>
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
								{statusFilter === 'ALL'
									? 'No active hiring processes for this job position.'
									: `No hiring processes with status: ${statusFilter.replace(/_/g, ' ')}`}
							</Typography>
						</Paper>
					)}

					<Typography variant="h5" sx={{mb: 2, mt: 5}}>
						Stage Template
					</Typography>
					<Card sx={{mb: 3}}>
						<CardContent>
							{jobPosition.stages && jobPosition.stages.length > 0 ? (
								<Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
									{jobPosition.stages
										.sort((a, b) => a.position - b.position)
										.map((stage, index) => (
											<Box key={stage.uid} sx={{display: 'flex', alignItems: 'center', gap: 2}}>
												<Chip label={index + 1} size="small" color="primary" />
												<Box sx={{flex: 1}}>
													<Typography variant="body1" fontWeight="bold">
														{stage.title}
													</Typography>
													<Typography variant="body2" color="textSecondary">
														{stage.description}
													</Typography>
													<Typography variant="caption" color="textSecondary">
														Type: {stage.type.replace(/_/g, ' ')}
													</Typography>
												</Box>
											</Box>
										))}
								</Box>
							) : (
								<Typography color="textSecondary">
									No stages defined for this job position yet.
								</Typography>
							)}
						</CardContent>
					</Card>
				</>
			)}

			{uid && (
				<ApplyToJobDialog
					open={applyDialogOpen}
					onClose={() => setApplyDialogOpen(false)}
					jobUid={uid}
					jobTitle={jobPosition.title}
				/>
			)}
		</Box>
	);
};

export default JobPositionDetailPage;
