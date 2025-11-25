import {Typography, Button, Box, Menu, MenuItem, ListItemIcon, ListItemText} from '@mui/material';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useState} from 'react';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useCandidatesSearch} from '../../hooks/api/state/useSearchState';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import {useDialog} from '../../hooks/useDialog';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import ManualCandidateDialog from '../../components/dialogs/ManualCandidateDialog';
import {canManageResources} from '../../utils/permissions';
import {FilterBar, FilterBarFilters} from '../../components/filters';
import CandidatesList from '../../components/candidates/CandidatesList';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';

const CandidatesPage: React.FC = () => {
	const {t} = useTranslation();
	const createDialog = useDialog<never>();
	const manualDialog = useDialog<never>();
	const {user} = useUserAtom();
	const [searchState, setSearchState] = useCandidatesSearch();
	const {page, limit, search} = searchState;
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const canManage = canManageResources(user);

	const {handleSearch, handlePageChange, handleLimitChange} =
		useSearchPaginationHandlers(setSearchState);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleCreateFromApplication = () => {
		handleMenuClose();
		createDialog.open();
	};

	const handleCreateManual = () => {
		handleMenuClose();
		manualDialog.open();
	};

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
					<Box>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							endIcon={<KeyboardArrowDownIcon />}
							onClick={handleMenuOpen}
							sx={{
								width: {xs: '100%', sm: 'auto'},
								minHeight: '44px',
							}}
							aria-label={t('candidates.create_candidate')}
							aria-controls={anchorEl ? 'add-candidate-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={anchorEl ? 'true' : undefined}
						>
							{t('candidates.create_candidate')}
						</Button>
						<Menu
							id="add-candidate-menu"
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
							MenuListProps={{
								'aria-labelledby': 'add-candidate-button',
							}}
						>
							<MenuItem onClick={handleCreateFromApplication}>
								<ListItemIcon>
									<AddIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText>
									{t('candidates.create_from_application')}
								</ListItemText>
							</MenuItem>
							<MenuItem onClick={handleCreateManual}>
								<ListItemIcon>
									<PersonAddIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText
									primary={t('candidates.create_manual')}
									secondary={t('candidates.create_manual_hint')}
								/>
							</MenuItem>
						</Menu>
					</Box>
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

			<ManualCandidateDialog
				open={manualDialog.isOpen}
				onClose={manualDialog.close}
			/>
		</Box>
	);
};

export default CandidatesPage;
