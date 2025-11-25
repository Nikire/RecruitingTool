import {Typography, Button, Box} from '@mui/material';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useCandidatesSearch} from '../../hooks/api/state/useSearchState';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import {useDialog} from '../../hooks/useDialog';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import {canManageResources} from '../../utils/permissions';
import {FilterBar, FilterBarFilters} from '../../components/filters';
import CandidatesList from '../../components/candidates/CandidatesList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

const CandidatesPage: React.FC = () => {
	const {t} = useTranslation();
	const createDialog = useDialog<never>();
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useCandidatesSearch();
	const {page, limit, search} = searchState;

	const canManage = canManageResources(user);

	const {handleSearch, handlePageChange, handleLimitChange} =
		useSearchPaginationHandlers(setSearchState);

	// Handle filter changes from FilterBar
	const handleFilterChange = (filters: FilterBarFilters) => {
		setSearchState({
			...searchState,
			search: filters.search,
		});
	};

	// Check if user has access (HR, ADMIN, or SUPER_ADMIN)
	if (!canManage) {
		return <AccessDeniedMessage requiredRoles={['HR', 'ADMIN', 'SUPER_ADMIN']} />;
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
					{t('candidates.title')}
				</Typography>
				{canManage && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={createDialog.open}
						sx={{
							width: {xs: '100%', sm: 'auto'},
							minHeight: '44px',
						}}
						aria-label={t('candidates.create_candidate')}
					>
						{t('candidates.create_candidate')}
					</Button>
				)}
			</Box>

			<FilterBar
				filters={{search}}
				onChange={handleFilterChange}
				searchPlaceholder={t('candidates.search_placeholder')}
			/>

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
