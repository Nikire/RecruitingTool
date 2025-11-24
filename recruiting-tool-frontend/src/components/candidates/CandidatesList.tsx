import {useState} from 'react';
import {Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useTranslation} from 'react-i18next';
import {useListCandidates, useDeleteCandidate} from '../../hooks/api/useCandidates';
import {Candidate} from '../../types/candidate';
import Pagination from '../pagination/Pagination';
import UpdateCandidateDialog from '../dialogs/UpdateCandidateDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';

interface CandidatesListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const CandidatesList: React.FC<CandidatesListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const {t} = useTranslation();
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const {data, isLoading, error} = useListCandidates({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const {mutate: deleteCandidate, isPending: isDeleting} = useDeleteCandidate();

	const candidates = data?.data;
	const meta = data?.meta;

	const handleEditClick = (candidate: Candidate) => {
		setSelectedCandidate(candidate);
		setOpenUpdateDialog(true);
	};

	const handleDeleteClick = (candidate: Candidate) => {
		setSelectedCandidate(candidate);
		setOpenDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		if (selectedCandidate) {
			deleteCandidate(selectedCandidate.uid, {
				onSuccess: () => {
					setOpenDeleteDialog(false);
					setSelectedCandidate(null);
				},
			});
		}
	};

	const handleCloseUpdateDialog = () => {
		setOpenUpdateDialog(false);
		setSelectedCandidate(null);
	};

	const handleCloseDeleteDialog = () => {
		setOpenDeleteDialog(false);
		setSelectedCandidate(null);
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
					{t('errors.fetch_failed')}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			{candidates && candidates.length > 0 ? (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><strong>{t('candidates.name_label')}</strong></TableCell>
								<TableCell><strong>{t('candidates.email_label')}</strong></TableCell>
								<TableCell><strong>UID</strong></TableCell>
								{canManage && <TableCell align="right"><strong>{t('common.actions')}</strong></TableCell>}
							</TableRow>
						</TableHead>
						<TableBody>
							{candidates.map((candidate) => (
								<TableRow key={candidate.uid} hover>
									<TableCell>{candidate.name}</TableCell>
									<TableCell>{candidate.email}</TableCell>
									<TableCell>
										<Typography variant="caption" sx={{fontFamily: 'monospace'}}>
											{candidate.uid}
										</Typography>
									</TableCell>
									{canManage && (
										<TableCell align="right">
											<Tooltip title={t('common.edit')}>
												<IconButton
													size="small"
													color="primary"
													onClick={() => handleEditClick(candidate)}
												>
													<EditIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title={t('common.delete')}>
												<IconButton
													size="small"
													color="error"
													onClick={() => handleDeleteClick(candidate)}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<Paper sx={{p: 4, textAlign: 'center'}}>
					<Typography variant="body1" color="textSecondary">
						{t('candidates.no_candidates')}
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			<UpdateCandidateDialog
				open={openUpdateDialog}
				onClose={handleCloseUpdateDialog}
				candidate={selectedCandidate}
			/>

			<ConfirmDeleteDialog
				open={openDeleteDialog}
				onClose={handleCloseDeleteDialog}
				onConfirm={handleConfirmDelete}
				title="Delete Candidate"
				message="Are you sure you want to delete this candidate?"
				itemName={selectedCandidate?.name}
				isDeleting={isDeleting}
			/>
		</>
	);
};

export default CandidatesList;
