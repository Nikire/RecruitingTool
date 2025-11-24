import {Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, IconButton, Tooltip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useTranslation} from 'react-i18next';
import {useListHiringProcesses, useDeleteHiringProcess} from '../../hooks/api/useHiringProcess';
import {HiringProcess} from '../../types/hiringProcess.types';
import {useNavigate} from 'react-router-dom';
import Pagination from '../pagination/Pagination';
import UpdateHiringProcessDialog from '../dialogs/UpdateHiringProcessDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ErrorMessage from '../common/ErrorMessage';
import {getHiringProcessStatusColor} from '../../utils/statusColors';
import {useDialog} from '../../hooks/useDialog';
import {useConfirmDelete} from '../../hooks/useConfirmDelete';

interface HiringProcessesListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const HiringProcessesList: React.FC<HiringProcessesListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const {t} = useTranslation();
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	// Dialog state management using custom hooks
	const updateDialog = useDialog<HiringProcess>();
	const deleteMutation = useDeleteHiringProcess();
	const deleteConfirm = useConfirmDelete<HiringProcess>(deleteMutation);

	const {data, isLoading, error} = useListHiringProcesses({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const processes = data?.data as HiringProcess[] | undefined;
	const meta = data?.meta;

	// Only show loading spinner on INITIAL load, not on refetch
	if (isLoading && !data) {
		return <LoadingSpinner />;
	}

	if (error && !data) {
		return <ErrorMessage message="errors.fetch_failed" />;
	}

	return (
		<>
			{processes && processes.length > 0 ? (
				<TableContainer component={Paper} sx={{width: '100%', overflowX: 'auto'}}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell sx={{minWidth: 150}}><strong>{t('hiring_processes.title')}</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>{t('companies.title')}</strong></TableCell>
								<TableCell sx={{minWidth: 100}}><strong>{t('status.pending')}</strong></TableCell>
								<TableCell sx={{minWidth: 80}}><strong>{t('stages.title')}</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>{t('candidates.title')}</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>{t('job_positions.created_by')}</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>{t('common.actions')}</strong></TableCell>
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
											color={getHiringProcessStatusColor(process.status)}
											size="small"
										/>
									</TableCell>
									<TableCell>{process.stages?.length || 0} {t('stages.title').toLowerCase()}</TableCell>
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
												{t('hiring_processes.no_candidate')}
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
												{t('common.view')}
											</Button>
											{canManage && (
												<>
													<Tooltip title={t('common.edit')}>
														<IconButton
															size="small"
															color="primary"
															onClick={() => updateDialog.openWith(process)}
														>
															<EditIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip title={t('common.delete')}>
														<IconButton
															size="small"
															color="error"
															onClick={() => deleteConfirm.confirmDelete(process)}
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
				<EmptyState message="hiring_processes.no_processes" />
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			<UpdateHiringProcessDialog
				open={updateDialog.isOpen}
				onClose={updateDialog.close}
				hiringProcess={updateDialog.selectedItem}
			/>

			<ConfirmDeleteDialog
				open={deleteConfirm.isOpen}
				onClose={deleteConfirm.handleCancel}
				onConfirm={deleteConfirm.handleConfirm}
				title={t('dialogs.delete_confirmation')}
				message={t('hiring_processes.delete_message')}
				itemName={deleteConfirm.selectedItem?.title}
				isDeleting={deleteConfirm.isDeleting}
			/>
		</>
	);
};

export default HiringProcessesList;
