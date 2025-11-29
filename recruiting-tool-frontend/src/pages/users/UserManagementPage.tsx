import {Box, Button, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Add as AddIcon} from '@mui/icons-material';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useUsersSearch} from '../../hooks/api/state/useSearchState';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import {hasRole} from '../../utils/permissions';
import {UserRoles} from '../../types/user.types';
import {useState} from 'react';
import SearchBar from '../../components/search/SearchBar';
import UsersList from '../../components/users/UsersList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';
import CreateUserDialog from '../../components/dialogs/CreateUserDialog';

const UserManagementPage: React.FC = () => {
	const {t} = useTranslation();
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useUsersSearch();
	const {page, limit, search} = searchState;
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

	const {handleSearch, handlePageChange, handleLimitChange} =
		useSearchPaginationHandlers(setSearchState);

	// Check if user has SUPER_ADMIN access
	if (!isSuperAdmin) {
		return <AccessDeniedMessage requiredRoles={['SUPER_ADMIN']} />;
	}

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: {xs: 'column', sm: 'row'},
					justifyContent: 'space-between',
					alignItems: {xs: 'flex-start', sm: 'center'},
					mb: {xs: 2, sm: 3},
					gap: 2,
				}}
			>
				<Typography variant="h4" sx={{fontSize: {xs: '1.5rem', sm: '2.125rem'}}}>
					{t('users.title')}
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setCreateDialogOpen(true)}
					sx={{
						width: {xs: '100%', sm: 'auto'},
						minHeight: '44px',
					}}
					aria-label={t('users.create_user')}
				>
					{t('users.create_user')}
				</Button>
			</Box>

			<Box sx={{mb: 3, maxWidth: {xs: '100%', sm: 400}}}>
				<SearchBar onSearch={handleSearch} placeholder={t('users.search_placeholder')} value={search} />
			</Box>

			<UsersList
				page={page}
				limit={limit}
				search={search}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
			/>

			<CreateUserDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
		</Box>
	);
};

export default UserManagementPage;
