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
	IconButton,
	Tooltip,
	Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useTranslation} from 'react-i18next';
import {useListUsers, useDeleteUser} from '../../hooks/api/useUsers';
import {User, UserRoles} from '../../types/user.types';
import Pagination from '../pagination/Pagination';
import UpdateUserDialog from '../dialogs/UpdateUserDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {hasRole} from '../../utils/permissions';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import ErrorMessage from '../common/ErrorMessage';
import {getUserRoleColor} from '../../utils/statusColors';
import {useDialog} from '../../hooks/useDialog';
import {useConfirmDelete} from '../../hooks/useConfirmDelete';

interface UsersListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const UsersList: React.FC<UsersListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const {t} = useTranslation();
	const {user: currentUser} = useUserAtom();
	const isSuperAdmin = hasRole(currentUser, UserRoles.SUPER_ADMIN);

	// Dialog state management using custom hooks
	const updateDialog = useDialog<User>();
	const deleteMutation = useDeleteUser();
	const deleteConfirm = useConfirmDelete<User>(deleteMutation);

	const {data, isLoading, error} = useListUsers({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const users = data?.data;
	const meta = data?.meta;

	// Only show loading spinner on INITIAL load, not on refetch
	if (isLoading && !data) {
		return <LoadingSpinner />;
	}

	if (error && !data) {
		return <ErrorMessage message="users.error_loading" />;
	}

	return (
		<>
			{users && users.length > 0 ? (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><strong>{t('users.name_label')}</strong></TableCell>
								<TableCell><strong>{t('users.email_label')}</strong></TableCell>
								<TableCell><strong>{t('users.roles_label')}</strong></TableCell>
								<TableCell><strong>{t('users.company_label')}</strong></TableCell>
								<TableCell><strong>{t('users.created_label')}</strong></TableCell>
								{isSuperAdmin && <TableCell align="right"><strong>{t('common.actions')}</strong></TableCell>}
							</TableRow>
						</TableHead>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.uid} hover>
									<TableCell>{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
											{user.roles.map((role) => (
												<Chip
													key={role}
													label={role}
													size="small"
													color={getUserRoleColor(role)}
												/>
											))}
										</Box>
									</TableCell>
									<TableCell>{user.company?.name || '-'}</TableCell>
									<TableCell>
										{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
									</TableCell>
									{isSuperAdmin && (
										<TableCell align="right">
											<Tooltip title={t('users.edit_user_tooltip')}>
												<IconButton
													size="small"
													color="primary"
													onClick={() => updateDialog.openWith(user)}
												>
													<EditIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title={t('users.delete_user_tooltip')}>
												<IconButton
													size="small"
													color="error"
													onClick={() => deleteConfirm.confirmDelete(user)}
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
				<EmptyState message="users.no_users" />
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			<UpdateUserDialog
				open={updateDialog.isOpen}
				onClose={updateDialog.close}
				user={updateDialog.selectedItem}
			/>

			<ConfirmDeleteDialog
				open={deleteConfirm.isOpen}
				onClose={deleteConfirm.handleCancel}
				onConfirm={deleteConfirm.handleConfirm}
				title={t('users.delete_user_title')}
				message={t('users.delete_user_message')}
				itemName={deleteConfirm.selectedItem?.name}
				isDeleting={deleteConfirm.isDeleting}
			/>
		</>
	);
};

export default UsersList;
