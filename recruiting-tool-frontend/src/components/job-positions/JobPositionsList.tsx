import {useState} from 'react';
import {Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, Button} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useListJobPositions, useDeleteJobPosition} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import Pagination from '../pagination/Pagination';
import {useNavigate} from 'react-router-dom';
import UpdateJobPositionDialog from '../dialogs/UpdateJobPositionDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';

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
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null);
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const {data, isLoading, error} = useListJobPositions({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const {mutate: deleteJobPosition, isPending: isDeleting} = useDeleteJobPosition();

	const jobPositions = data?.data;
	const meta = data?.meta;

	const handleEditClick = (jobPosition: JobPosition) => {
		setSelectedJobPosition(jobPosition);
		setOpenUpdateDialog(true);
	};

	const handleDeleteClick = (jobPosition: JobPosition) => {
		setSelectedJobPosition(jobPosition);
		setOpenDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		if (selectedJobPosition) {
			deleteJobPosition(selectedJobPosition.uid, {
				onSuccess: () => {
					setOpenDeleteDialog(false);
					setSelectedJobPosition(null);
				},
			});
		}
	};

	const handleCloseUpdateDialog = () => {
		setOpenUpdateDialog(false);
		setSelectedJobPosition(null);
	};

	const handleCloseDeleteDialog = () => {
		setOpenDeleteDialog(false);
		setSelectedJobPosition(null);
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
								<TableCell sx={{minWidth: 120}}><strong>Hiring Processes</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>Created By</strong></TableCell>
								<TableCell sx={{minWidth: 180}}><strong>Actions</strong></TableCell>
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
									<TableCell>
										<Chip
											label={`${jobPosition.hiringProcesses?.length || 0} processes`}
											color="primary"
											variant="outlined"
											size="small"
										/>
									</TableCell>
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
										<Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
											<Button
												size="small"
												variant="outlined"
												onClick={() => navigate(`/job-position/${jobPosition.uid}`)}
											>
												View Details
											</Button>
											{canManage && (
												<>
													<Tooltip title="Edit job position">
														<IconButton
															size="small"
															color="primary"
															onClick={() => handleEditClick(jobPosition)}
														>
															<EditIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip title="Delete job position">
														<IconButton
															size="small"
															color="error"
															onClick={() => handleDeleteClick(jobPosition)}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</>
											)}
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

			<UpdateJobPositionDialog
				open={openUpdateDialog}
				onClose={handleCloseUpdateDialog}
				jobPosition={selectedJobPosition}
			/>

			<ConfirmDeleteDialog
				open={openDeleteDialog}
				onClose={handleCloseDeleteDialog}
				onConfirm={handleConfirmDelete}
				title="Delete Job Position"
				message="Are you sure you want to delete this job position? This will also delete all associated stages and hiring processes."
				itemName={selectedJobPosition?.title}
				isDeleting={isDeleting}
			/>
		</>
	);
};

export default JobPositionsList;
