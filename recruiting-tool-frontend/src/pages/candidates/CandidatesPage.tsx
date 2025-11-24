import {useState, useCallback} from 'react';
import {Typography, Button, Box} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useCandidatesSearch} from '../../hooks/api/state/useSearchState';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import {canManageResources} from '../../utils/permissions';
import SearchBar from '../../components/search/SearchBar';
import CandidatesList from '../../components/candidates/CandidatesList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

const CandidatesPage: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useCandidatesSearch();
	const {page, limit, search} = searchState;

	const canManage = canManageResources(user);

	const handleSearch = useCallback((value: string) => {
		setSearchState((prev) => ({...prev, search: value, page: 1}));
	}, [setSearchState]);

	const handlePageChange = useCallback((newPage: number) => {
		setSearchState((prev) => ({...prev, page: newPage}));
	}, [setSearchState]);

	const handleLimitChange = useCallback((newLimit: number) => {
		setSearchState((prev) => ({...prev, limit: newLimit, page: 1}));
	}, [setSearchState]);

	// Check if user has access (HR, ADMIN, or SUPER_ADMIN)
	if (!canManage) {
		return <AccessDeniedMessage requiredRoles={['HR', 'ADMIN', 'SUPER_ADMIN']} />;
	}

	return (
		<Box sx={{mt: 8}}>
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
