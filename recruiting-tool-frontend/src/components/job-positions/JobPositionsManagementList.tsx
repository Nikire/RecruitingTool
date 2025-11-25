import {Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, Button} from '@mui/material';
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
import {useDialog} from '../../hooks/useDialog';
import {useConfirmDelete} from '../../hooks/useConfirmDelete';
import { useTranslation } from 'react-i18next';
import TableSkeletonLoader from '../common/TableSkeletonLoader';

interface JobPositionsManagementListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const JobPositionsManagementList: React.FC<JobPositionsManagementListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	// Dialog state management using custom hooks
	const updateDialog = useDialog<JobPosition>();
	const deleteMutation = useDeleteJobPosition();
	const deleteConfirm = useConfirmDelete<JobPosition>(deleteMutation);

	const {data, isLoading, error} = useListJobPositions({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const jobPositions = data?.data;
	const meta = data?.meta;

	// Show skeleton loader on INITIAL load, not on refetch
	if (isLoading && !data) {
		return <TableSkeletonLoader rows={limit} columns={7} />;
	}

	if (error && !data) {
		return (
			<Box sx={{p: 4}}>
				<Typography color="error">
					{t('job_positions_table.error_loading')}
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
								<TableCell sx={{minWidth: 200}}><strong>{t('job_positions_table.header_job_title')}</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>{t('job_positions_table.header_company')}</strong></TableCell>
								<TableCell sx={{minWidth: 100}}><strong>{t('job_positions_table.header_status')}</strong></TableCell>
								<TableCell sx={{minWidth: 80}}><strong>{t('job_positions_table.header_stages')}</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>{t('job_positions_table.header_hiring_processes')}</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>{t('job_positions_table.header_created_by')}</strong></TableCell>
								<TableCell sx={{minWidth: 180}}><strong>{t('job_positions_table.header_actions')}</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{jobPositions.map((jobPosition) => (
								<TableRow key={jobPosition.uid} hover>
									<TableCell sx={{maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
										{jobPosition.title}
									</TableCell>
									<TableCell>{jobPosition.companyName || t('common.n_a')}</TableCell>
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
											label={t('job_positions_table.processes_count', { count: jobPosition.hiringProcesses?.length || 0 })}
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
											t('common.n_a')
										)}
									</TableCell>
									<TableCell>
										<Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
											<Button
												size="small"
												variant="outlined"
												onClick={() => navigate(`/careers/${jobPosition.uid}`)}
											>
												{t('job_positions.view_details')}
											</Button>
											{canManage && (
												<>
													<Tooltip title={t('job_positions_table.edit_tooltip')}>
														<IconButton
															size="small"
															color="primary"
															onClick={() => updateDialog.openWith(jobPosition)}
														>
															<EditIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip title={t('job_positions_table.delete_tooltip')}>
														<IconButton
															size="small"
															color="error"
															onClick={() => deleteConfirm.confirmDelete(jobPosition)}
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
						{t('job_positions_table.no_positions')}
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			<UpdateJobPositionDialog
				open={updateDialog.isOpen}
				onClose={updateDialog.close}
				jobPosition={updateDialog.selectedItem}
			/>

			<ConfirmDeleteDialog
				open={deleteConfirm.isOpen}
				onClose={deleteConfirm.handleCancel}
				onConfirm={deleteConfirm.handleConfirm}
				title={t('job_positions_table.delete_title')}
				message={t('job_positions_table.delete_message')}
				itemName={deleteConfirm.selectedItem?.title}
				isDeleting={deleteConfirm.isDeleting}
			/>
		</>
	);
};

export default JobPositionsManagementList;
