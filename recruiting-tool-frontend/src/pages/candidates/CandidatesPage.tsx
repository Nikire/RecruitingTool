import {Typography, Button, Box} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useCandidatesSearch} from '../../hooks/api/state/useSearchState';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import {useDialog} from '../../hooks/useDialog';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import {canManageResources} from '../../utils/permissions';
import SearchBar from '../../components/search/SearchBar';
import CandidatesList from '../../components/candidates/CandidatesList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

const CandidatesPage: React.FC = () => {
	const createDialog = useDialog<never>();
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useCandidatesSearch();
	const {page, limit, search} = searchState;

	const canManage = canManageResources(user);

	const {handleSearch, handlePageChange, handleLimitChange} =
		useSearchPaginationHandlers(setSearchState);

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
						onClick={createDialog.open}
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
				open={createDialog.isOpen}
				onClose={createDialog.close}
			/>
		</Box>
	);
};

export default CandidatesPage;
