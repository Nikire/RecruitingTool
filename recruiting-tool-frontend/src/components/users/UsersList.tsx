import {useState} from 'react';
import {
	Box,
	CircularProgress,
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
import {useListUsers, useDeleteUser} from '../../hooks/api/useUsers';
import {User, UserRoles} from '../../types/user.types';
import Pagination from '../pagination/Pagination';
import UpdateUserDialog from '../dialogs/UpdateUserDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {hasRole} from '../../utils/permissions';

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
	const {user: currentUser} = useUserAtom();
	const isSuperAdmin = hasRole(currentUser, UserRoles.SUPER_ADMIN);

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const {data, isLoading, error} = useListUsers({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const {mutate: deleteUser, isPending: isDeleting} = useDeleteUser();

	const users = data?.data;
	const meta = data?.meta;

	const handleEditClick = (user: User) => {
		setSelectedUser(user);
		setOpenUpdateDialog(true);
	};

	const handleDeleteClick = (user: User) => {
		setSelectedUser(user);
		setOpenDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		if (selectedUser) {
			deleteUser(selectedUser.uid, {
				onSuccess: () => {
					setOpenDeleteDialog(false);
					setSelectedUser(null);
				},
			});
		}
	};

	const handleCloseUpdateDialog = () => {
		setOpenUpdateDialog(false);
		setSelectedUser(null);
	};

	const handleCloseDeleteDialog = () => {
		setOpenDeleteDialog(false);
		setSelectedUser(null);
	};

	const getRoleColor = (role: UserRoles) => {
		switch (role) {
			case UserRoles.SUPER_ADMIN:
				return 'error';
			case UserRoles.ADMIN:
				return 'warning';
			case UserRoles.HR:
				return 'info';
			default:
				return 'default';
		}
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
					Error loading users. Please try again.
				</Typography>
			</Box>
		);
	}

	return (
		<>
			{users && users.length > 0 ? (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><strong>Name</strong></TableCell>
								<TableCell><strong>Email</strong></TableCell>
								<TableCell><strong>Roles</strong></TableCell>
								<TableCell><strong>Company</strong></TableCell>
								<TableCell><strong>Created</strong></TableCell>
								{isSuperAdmin && <TableCell align="right"><strong>Actions</strong></TableCell>}
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
													color={getRoleColor(role)}
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
											<Tooltip title="Edit user">
												<IconButton
													size="small"
													color="primary"
													onClick={() => handleEditClick(user)}
												>
													<EditIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Delete user">
												<IconButton
													size="small"
													color="error"
													onClick={() => handleDeleteClick(user)}
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
						No users found.
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			<UpdateUserDialog
				open={openUpdateDialog}
				onClose={handleCloseUpdateDialog}
				user={selectedUser}
			/>

			<ConfirmDeleteDialog
				open={openDeleteDialog}
				onClose={handleCloseDeleteDialog}
				onConfirm={handleConfirmDelete}
				title="Delete User"
				message="Are you sure you want to delete this user?"
				itemName={selectedUser?.name}
				isDeleting={isDeleting}
			/>
		</>
	);
};

export default UsersList;
