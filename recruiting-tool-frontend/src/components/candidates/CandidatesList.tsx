import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Card,
	CardContent,
	Skeleton,
	Stack,
	IconButton,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useTranslation} from 'react-i18next';
import {useListCandidates, useDeleteCandidate} from '../../hooks/api/useCandidates';
import {useDialog} from '../../hooks/useDialog';
import {useConfirmDelete} from '../../hooks/useConfirmDelete';
import {Candidate} from '../../types/candidate';
import Pagination from '../pagination/Pagination';
import UpdateCandidateDialog from '../dialogs/UpdateCandidateDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import {TableRowActions} from '../tables';
import TableSkeletonLoader from '../common/TableSkeletonLoader';

interface CandidatesListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

// Skeleton loader for loading state
const CandidateCardSkeleton = () => (
	<Card sx={{mb: 2, p: 2}}>
		<Stack spacing={1}>
			<Skeleton variant="text" width="70%" height={28} />
			<Skeleton variant="text" width="50%" height={20} />
			<Skeleton variant="text" width="60%" height={20} />
			<Box sx={{display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end'}}>
				<Skeleton variant="circular" width={40} height={40} />
				<Skeleton variant="circular" width={40} height={40} />
			</Box>
		</Stack>
	</Card>
);

// Mobile card view component
const CandidateCardView: React.FC<{
	candidate: Candidate;
	canManage: boolean;
	onEdit: (candidate: Candidate) => void;
	onDelete: (candidate: Candidate) => void;
}> = ({candidate, canManage, onEdit, onDelete}) => {
	const {t} = useTranslation();
	return (
		<Card
			sx={{
				mb: 2,
				p: 2,
				transition: 'all 0.2s ease-in-out',
				'&:hover': {
					boxShadow: 3,
					transform: 'translateY(-2px)',
				},
			}}
		>
			<CardContent sx={{p: 0, '&:last-child': {pb: 0}}}>
				<Typography variant="h6" sx={{mb: 1, fontSize: {xs: '1.1rem', sm: '1.25rem'}}}>
					{candidate.name}
				</Typography>

				<Typography variant="body2" color="textSecondary" sx={{mb: 0.5}}>
					{t('candidates.email_label')}: {candidate.email}
				</Typography>

				<Typography variant="caption" color="textSecondary" sx={{display: 'block', mb: 2, fontFamily: 'monospace'}}>
					UID: {candidate.uid}
				</Typography>

				{canManage && (
					<Box
						sx={{
							display: 'flex',
							gap: 1,
							justifyContent: 'flex-end',
							mt: 2,
						}}
					>
						<IconButton
							size="small"
							color="primary"
							onClick={() => onEdit(candidate)}
							aria-label={t('users.edit_user_tooltip')}
							sx={{
								minHeight: 44,
								minWidth: 44,
							}}
						>
							<EditIcon />
						</IconButton>
						<IconButton
							size="small"
							color="error"
							onClick={() => onDelete(candidate)}
							aria-label={t('users.delete_user_tooltip')}
							sx={{
								minHeight: 44,
								minWidth: 44,
							}}
						>
							<DeleteIcon />
						</IconButton>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

const CandidatesList: React.FC<CandidatesListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const {t} = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	const updateDialog = useDialog<Candidate>();
	const deleteMutation = useDeleteCandidate();
	const deleteConfirm = useConfirmDelete<Candidate>(deleteMutation);

	const {data, isLoading, error} = useListCandidates({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const candidates = data?.data;
	const meta = data?.meta;

	const handleEditClick = (candidate: Candidate) => {
		updateDialog.openWith(candidate);
	};

	const handleDeleteClick = (candidate: Candidate) => {
		deleteConfirm.confirmDelete(candidate);
	};

	// Show skeleton loader on INITIAL load, not on refetch
	if (isLoading && !data) {
		return (
			<Box sx={{width: '100%'}}>
				{isMobile ? (
					<Box sx={{width: '100%'}}>
						{[1, 2, 3].map((i) => (
							<CandidateCardSkeleton key={i} />
						))}
					</Box>
				) : (
					<TableSkeletonLoader rows={limit} columns={canManage ? 4 : 3} />
				)}
			</Box>
		);
	}

	if (error && !data) {
		return (
			<Box sx={{p: {xs: 2, sm: 4}}}>
				<Typography color="error" sx={{fontSize: {xs: '0.95rem', sm: '1rem'}}}>
					{t('errors.fetch_failed')}
				</Typography>
			</Box>
		);
	}

	// Mobile view (card layout)
	if (isMobile) {
		return (
			<>
				{candidates && candidates.length > 0 ? (
					<Box sx={{width: '100%'}}>
						{candidates.map((candidate) => (
							<CandidateCardView
								key={candidate.uid}
								candidate={candidate}
								canManage={canManage}
								onEdit={handleEditClick}
								onDelete={handleDeleteClick}
							/>
						))}
					</Box>
				) : (
					<Paper sx={{p: {xs: 2, sm: 4}, textAlign: 'center'}}>
						<Typography variant="body1" color="textSecondary">
							{t('candidates.no_candidates')}
						</Typography>
					</Paper>
				)}

				{meta && (
					<Pagination
						meta={meta}
						onPageChange={onPageChange}
						onLimitChange={onLimitChange}
					/>
				)}

				<UpdateCandidateDialog
					open={updateDialog.isOpen}
					onClose={updateDialog.close}
					candidate={updateDialog.selectedItem}
				/>

				<ConfirmDeleteDialog
					open={deleteConfirm.isOpen}
					onClose={deleteConfirm.handleCancel}
					onConfirm={deleteConfirm.handleConfirm}
					title="Delete Candidate"
					message="Are you sure you want to delete this candidate?"
					itemName={deleteConfirm.selectedItem?.name}
					isDeleting={deleteConfirm.isDeleting}
				/>
			</>
		);
	}

	// Desktop view (table layout)
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
											<TableRowActions
												onEdit={() => handleEditClick(candidate)}
												onDelete={() => handleDeleteClick(candidate)}
											/>
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
				open={updateDialog.isOpen}
				onClose={updateDialog.close}
				candidate={updateDialog.selectedItem}
			/>

			<ConfirmDeleteDialog
				open={deleteConfirm.isOpen}
				onClose={deleteConfirm.handleCancel}
				onConfirm={deleteConfirm.handleConfirm}
				title="Delete Candidate"
				message="Are you sure you want to delete this candidate?"
				itemName={deleteConfirm.selectedItem?.name}
				isDeleting={deleteConfirm.isDeleting}
			/>
		</>
	);
};

export default CandidatesList;
