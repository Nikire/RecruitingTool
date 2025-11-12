import {useState, useCallback} from 'react';
import {Typography, Button, Box, Alert} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useCandidatesSearch} from '../../hooks/api/state/useSearchState';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import {canManageResources, isAdmin} from '../../utils/permissions';
import SearchBar from '../../components/search/SearchBar';
import CandidatesList from '../../components/candidates/CandidatesList';

const CandidatesPage: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useCandidatesSearch();
	const {page, limit, search} = searchState;

	const canManage = canManageResources(user);
	const hasAdminAccess = isAdmin(user);

	const handleSearch = useCallback((value: string) => {
		setSearchState((prev) => ({...prev, search: value, page: 1}));
	}, [setSearchState]);

	const handlePageChange = useCallback((newPage: number) => {
		setSearchState((prev) => ({...prev, page: newPage}));
	}, [setSearchState]);

	const handleLimitChange = useCallback((newLimit: number) => {
		setSearchState((prev) => ({...prev, limit: newLimit, page: 1}));
	}, [setSearchState]);

	// Check if user has admin access
	if (!hasAdminAccess) {
		return (
			<Box sx={{p: 4}}>
				<Alert severity="error" sx={{mb: 2}}>
					Access Denied: You need ADMIN or SUPER_ADMIN role to view candidates.
				</Alert>
				<Typography variant="body1">
					Please contact your administrator if you believe you should have access to this page.
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{p: 4}}>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
				<Typography variant="h4">
					Candidates
				</Typography>
				{canManage && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setOpenDialog(true)}
					>
						Create Candidate
					</Button>
				)}
			</Box>

			<Box sx={{mb: 3, maxWidth: 400}}>
				<SearchBar onSearch={handleSearch} placeholder="Search by name or email..." value={search} />
			</Box>

			<CandidatesList
				page={page}
				limit={limit}
				search={search}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
			/>

			<CreateCandidateDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
			/>
		</Box>
	);
};

export default CandidatesPage;
