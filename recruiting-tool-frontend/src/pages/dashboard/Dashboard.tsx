import {Box, Typography, Button} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useJobPositionsSearch} from '../../hooks/api/state/useSearchState';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import {useDialog} from '../../hooks/useDialog';
import CreateJobPositionDialog from '../../components/dialogs/CreateJobPositionDialog';
import {canManageResources} from '../../utils/permissions';
import SearchBar from '../../components/search/SearchBar';
import JobPositionsManagementList from '../../components/job-positions/JobPositionsManagementList';

const Dashboard: React.FC = () => {
	const createDialog = useDialog<never>();
	const [searchState, setSearchState] = useJobPositionsSearch();
	const {page, limit, search} = searchState;
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	const {handleSearch, handlePageChange, handleLimitChange} =
		useSearchPaginationHandlers(setSearchState);

	return (
		<Box sx={{width: '100%'}}>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
				<Typography variant="h4">
					Job Positions Dashboard
				</Typography>
				{canManage && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={createDialog.open}
					>
						Create Job Position
					</Button>
				)}
			</Box>

			<Box sx={{mb: 3, maxWidth: 400}}>
				<SearchBar onSearch={handleSearch} placeholder="Search job positions..." value={search} />
			</Box>

			<JobPositionsManagementList
				page={page}
				limit={limit}
				search={search}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
			/>

			<CreateJobPositionDialog
				open={createDialog.isOpen}
				onClose={createDialog.close}
			/>
		</Box>
	);
};

export default Dashboard;
