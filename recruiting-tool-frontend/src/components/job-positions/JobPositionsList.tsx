import {Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button} from '@mui/material';
import {useState} from 'react';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import Pagination from '../pagination/Pagination';
import {useNavigate} from 'react-router-dom';
import {ApplyToJobDialog} from '../dialogs/ApplyToJobDialog';

interface JobPositionsListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const JobPositionsList: React.FC<JobPositionsListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const navigate = useNavigate();
	const [applyDialogOpen, setApplyDialogOpen] = useState(false);
	const [selectedJob, setSelectedJob] = useState<{uid: string; title: string} | null>(null);

	const {data, isLoading, error} = useListJobPositions({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const jobPositions = data?.data;
	const meta = data?.meta;

	const handleApplyClick = (jobUid: string, jobTitle: string) => {
		setSelectedJob({uid: jobUid, title: jobTitle});
		setApplyDialogOpen(true);
	};

	const handleCloseApplyDialog = () => {
		setApplyDialogOpen(false);
		setSelectedJob(null);
	};

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
					Error loading job positions. Please try again.
				</Typography>
			</Box>
		);
	}

	return (
		<>
			{jobPositions && jobPositions.length > 0 ? (
				<TableContainer component={Paper} sx={{width: '100%', overflowX: 'auto'}}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell sx={{minWidth: 200}}><strong>Job Title</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>Company</strong></TableCell>
								<TableCell sx={{minWidth: 100}}><strong>Status</strong></TableCell>
								<TableCell sx={{minWidth: 80}}><strong>Stages</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>Created By</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>Actions</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{jobPositions.map((jobPosition) => (
								<TableRow key={jobPosition.uid} hover>
									<TableCell sx={{maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
										{jobPosition.title}
									</TableCell>
									<TableCell>{jobPosition.companyName || 'N/A'}</TableCell>
									<TableCell>
										<Chip
											label={jobPosition.status}
											color={jobPosition.status === 'OPEN' ? 'success' : jobPosition.status === 'CLOSED' ? 'default' : 'warning'}
											size="small"
										/>
									</TableCell>
									<TableCell>{jobPosition.stages?.length || 0}</TableCell>
									<TableCell sx={{maxWidth: 180}}>
										{jobPosition.createdBy ? (
											<>
												<Typography variant="body2" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
													{jobPosition.createdBy.name}
												</Typography>
												<Typography variant="caption" color="textSecondary" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>
													{jobPosition.createdBy.email}
												</Typography>
											</>
										) : (
											'N/A'
										)}
									</TableCell>
									<TableCell>
										<Box sx={{display: 'flex', gap: 1}}>
											<Button
												size="small"
												variant="outlined"
												onClick={() => navigate(`/careers/${jobPosition.uid}`)}
											>
												View Details
											</Button>
											<Button
												size="small"
												variant="contained"
												onClick={() => handleApplyClick(jobPosition.uid, jobPosition.title)}
												disabled={jobPosition.status !== 'OPEN'}
											>
												Apply
											</Button>
										</Box>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<Paper sx={{p: 4, textAlign: 'center'}}>
					<Typography variant="body1" color="textSecondary">
						No job positions found.
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			{selectedJob && (
				<ApplyToJobDialog
					open={applyDialogOpen}
					onClose={handleCloseApplyDialog}
					jobUid={selectedJob.uid}
					jobTitle={selectedJob.title}
				/>
			)}
		</>
	);
};

export default JobPositionsList;
