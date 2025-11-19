import {useState} from 'react';
import {Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, IconButton, Tooltip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useListHiringProcesses, useDeleteHiringProcess} from '../../hooks/api/useHiringProcess';
import {HiringProcess, HiringProcessStatus} from '../../types/hiringProcess.types';
import {useNavigate} from 'react-router-dom';
import Pagination from '../pagination/Pagination';
import UpdateHiringProcessDialog from '../dialogs/UpdateHiringProcessDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';

interface HiringProcessesListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

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

const HiringProcessesList: React.FC<HiringProcessesListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	const [selectedHiringProcess, setSelectedHiringProcess] = useState<HiringProcess | null>(null);
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const {data, isLoading, error} = useListHiringProcesses({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const {mutate: deleteHiringProcess, isPending: isDeleting} = useDeleteHiringProcess();

	const processes = data?.data as HiringProcess[] | undefined;
	const meta = data?.meta;

	const handleEditClick = (process: HiringProcess) => {
		setSelectedHiringProcess(process);
		setOpenUpdateDialog(true);
	};

	const handleDeleteClick = (process: HiringProcess) => {
		setSelectedHiringProcess(process);
		setOpenDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		if (selectedHiringProcess) {
			deleteHiringProcess(selectedHiringProcess.uid, {
				onSuccess: () => {
					setOpenDeleteDialog(false);
					setSelectedHiringProcess(null);
				},
			});
		}
	};

	const handleCloseUpdateDialog = () => {
		setOpenUpdateDialog(false);
		setSelectedHiringProcess(null);
	};

	const handleCloseDeleteDialog = () => {
		setOpenDeleteDialog(false);
		setSelectedHiringProcess(null);
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
					Error loading hiring processes. Please try again.
				</Typography>
			</Box>
		);
	}

	return (
		<>
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
											<Typography variant="caption" sx={{color: 'error.main', fontWeight: 500}}>
												No candidate assigned
											</Typography>
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
										<Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
											<Button
												size="small"
												variant="outlined"
												onClick={() => navigate(`/hiring-process/${process.uid}`)}
											>
												View
											</Button>
											{canManage && (
												<>
													<Tooltip title="Edit hiring process">
														<IconButton
															size="small"
															color="primary"
															onClick={() => handleEditClick(process)}
														>
															<EditIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip title="Delete hiring process">
														<IconButton
															size="small"
															color="error"
															onClick={() => handleDeleteClick(process)}
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
						No hiring processes found.
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			<UpdateHiringProcessDialog
				open={openUpdateDialog}
				onClose={handleCloseUpdateDialog}
				hiringProcess={selectedHiringProcess}
			/>

			<ConfirmDeleteDialog
				open={openDeleteDialog}
				onClose={handleCloseDeleteDialog}
				onConfirm={handleConfirmDelete}
				title="Delete Hiring Process"
				message="Are you sure you want to delete this hiring process? This will also delete all associated stages."
				itemName={selectedHiringProcess?.title}
				isDeleting={isDeleting}
			/>
		</>
	);
};

export default HiringProcessesList;
