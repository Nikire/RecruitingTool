import {Box, Button, Typography, Alert} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Add as AddIcon} from '@mui/icons-material';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useUsersSearch} from '../../hooks/api/state/useSearchState';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import {hasRole} from '../../utils/permissions';
import {UserRoles} from '../../types/user.types';
import SearchBar from '../../components/search/SearchBar';
import UsersList from '../../components/users/UsersList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

const UserManagementPage: React.FC = () => {
	const {t} = useTranslation();
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useUsersSearch();
	const {page, limit, search} = searchState;

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
					disabled
					sx={{
						width: {xs: '100%', sm: 'auto'},
						minHeight: '44px',
					}}
				>
					{t('users.create_user')}
				</Button>
			</Box>

			<Alert severity="info" sx={{mb: 3}}>
				{t('users.api_only_message')}
			</Alert>

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
		</Box>
	);
};

export default UserManagementPage;
