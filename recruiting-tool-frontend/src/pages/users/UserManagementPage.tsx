import {useCallback} from 'react';
import {Box, Button, Typography, Alert} from '@mui/material';
import {Add as AddIcon} from '@mui/icons-material';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useUsersSearch} from '../../hooks/api/state/useSearchState';
import {hasRole} from '../../utils/permissions';
import {UserRoles} from '../../types/user.types';
import SearchBar from '../../components/search/SearchBar';
import UsersList from '../../components/users/UsersList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

const UserManagementPage: React.FC = () => {
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useUsersSearch();
	const {page, limit, search} = searchState;

	const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

	const handleSearch = useCallback((value: string) => {
		setSearchState((prev) => ({...prev, search: value, page: 1}));
	}, [setSearchState]);

	const handlePageChange = useCallback((newPage: number) => {
		setSearchState((prev) => ({...prev, page: newPage}));
	}, [setSearchState]);

	const handleLimitChange = useCallback((newLimit: number) => {
		setSearchState((prev) => ({...prev, limit: newLimit, page: 1}));
	}, [setSearchState]);

	// Check if user has SUPER_ADMIN access
	if (!isSuperAdmin) {
		return <AccessDeniedMessage requiredRoles={['SUPER_ADMIN']} />;
	}

	return (
		<Box>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
				<Typography variant="h4">
					User Management
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					disabled
				>
					Create User
				</Button>
			</Box>

			<Alert severity="info" sx={{mb: 3}}>
				User creation is currently only available through the API. Update and delete operations are available through this interface.
			</Alert>

			<Box sx={{mb: 3, maxWidth: 400}}>
				<SearchBar onSearch={handleSearch} placeholder="Search by name or email..." value={search} />
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
