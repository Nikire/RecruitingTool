import {useState, useMemo} from 'react';
import {
	Typography,
	Box,
	useTheme,
	useMediaQuery,
	Button,
	Grid,
	Paper,
	CircularProgress,
	ToggleButton,
	ToggleButtonGroup,
	Skeleton,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import InboxIcon from '@mui/icons-material/Inbox';
import {JobPosition, JobPositionStatus} from '../../types/jobPosition.types';
import ManageStagesDialog from '../../components/dialogs/ManageStagesDialog';
import CreateJobPositionDialog from '../../components/dialogs/CreateJobPositionDialog';
import UpdateJobPositionDialog from '../../components/dialogs/UpdateJobPositionDialog';
import JobPositionCard from '../../components/job-positions/JobPositionCard';
import JobPositionFilters, {
	JobPositionFiltersState,
} from '../../components/job-positions/JobPositionFilters';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import {useNavigate} from 'react-router-dom';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import {useDialog} from '../../hooks/useDialog';

const JobPositionsPage: React.FC = () => {
	const {t} = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	const [selectedJobPosition, setSelectedJobPosition] =
		useState<JobPosition | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const updateDialog = useDialog<JobPosition>();

	// View mode state (grid or list) - saved to localStorage
	const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
		return (localStorage.getItem('jobPositions_viewMode') as 'grid' | 'list') || 'grid';
	});

	// Filter state
	const [filters, setFilters] = useState<JobPositionFiltersState>({
		search: '',
		status: 'ALL',
		department: 'ALL',
	});

	// Fetch job positions
	const {data, isLoading, error} = useListJobPositions({
		page: 1,
		limit: 100,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const jobPositions = data?.data || [];

	// Filter job positions based on filter state
	const filteredJobPositions = useMemo(() => {
		return jobPositions.filter((position) => {
			// Search filter
			if (
				filters.search &&
				!position.title.toLowerCase().includes(filters.search.toLowerCase())
			) {
				return false;
			}

			// Status filter
			if (filters.status !== 'ALL' && position.status !== filters.status) {
				return false;
			}

			// Department filter (for now just show all - department data not in JobPosition type)
			// This can be implemented when department field is added to backend

			return true;
		});
	}, [jobPositions, filters]);

	const handleViewModeChange = (
		_event: React.MouseEvent<HTMLElement>,
		newMode: 'grid' | 'list' | null
	) => {
		if (newMode !== null) {
			setViewMode(newMode);
			localStorage.setItem('jobPositions_viewMode', newMode);
		}
	};

	const handleCloseStagesDialog = () => {
		setSelectedJobPosition(null);
	};

	const handleViewDetails = (jobPosition: JobPosition) => {
		navigate(`/hr/job-positions/${jobPosition.uid}`);
	};

	const handleEdit = (jobPosition: JobPosition) => {
		updateDialog.openWith(jobPosition);
	};

	// Loading skeleton cards
	const renderSkeletonCards = () => (
		<Grid container spacing={3} justifyContent="center">
			{[1, 2, 3].map((i) => (
				<Grid item xs={12} sm={6} md={4} key={i} sx={{overflow: 'visible'}}>
					<Paper
						sx={{
							height: '100%',
							width: 360,
							maxWidth: '100%',
							mx: 'auto',
							p: 2,
						}}
					>
						<Skeleton variant="rectangular" height={40} sx={{mb: 2}} />
						<Skeleton variant="text" width="60%" />
						<Skeleton variant="text" width="80%" />
						<Skeleton variant="text" width="40%" />
						<Box sx={{display: 'flex', gap: 1, mt: 2}}>
							<Skeleton variant="circular" width={32} height={32} />
							<Skeleton variant="circular" width={32} height={32} />
						</Box>
					</Paper>
				</Grid>
			))}
		</Grid>
	);

	// Empty state
	const renderEmptyState = () => (
		<Paper sx={{p: 8, textAlign: 'center'}}>
			<InboxIcon sx={{fontSize: 80, color: 'text.disabled', mb: 2}} />
			<Typography variant="h6" color="textSecondary" gutterBottom>
				{filters.search || filters.status !== 'ALL'
					? t('job_position_card.no_results')
					: t('job_position_card.no_positions')}
			</Typography>
			{!filters.search && filters.status === 'ALL' && canManage && (
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={() => setCreateDialogOpen(true)}
					sx={{mt: 2}}
				>
					{t('job_positions.create_new')}
				</Button>
			)}
		</Paper>
	);

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: {xs: 2, sm: 3},
				}}
			>
				<Box>
					<Typography
						variant={isMobile ? 'h5' : 'h4'}
						sx={{
							fontSize: {xs: '1.5rem', sm: '1.75rem', md: '2rem'},
							fontWeight: 600,
							mb: 0.5,
						}}
					>
						{t('job_positions.title')}
					</Typography>
					<Typography
						variant="body2"
						color="textSecondary"
						sx={{fontSize: {xs: '0.875rem', sm: '1rem'}}}
					>
						{t('job_positions.subtitle')}
					</Typography>
				</Box>
				<Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
					{/* View Toggle */}
					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={handleViewModeChange}
						aria-label={t('job_position_card.view_mode')}
						size="small"
						sx={{display: {xs: 'none', sm: 'flex'}}}
					>
						<ToggleButton value="grid" aria-label={t('job_position_card.grid_view')}>
							<GridViewIcon />
						</ToggleButton>
						<ToggleButton value="list" aria-label={t('job_position_card.list_view')}>
							<ViewListIcon />
						</ToggleButton>
					</ToggleButtonGroup>

					{canManage && (
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={() => setCreateDialogOpen(true)}
							sx={{display: {xs: 'none', sm: 'flex'}}}
						>
							{t('job_positions.create_new')}
						</Button>
					)}
				</Box>
			</Box>

			{/* Mobile Create Button */}
			{canManage && (
				<Button
					variant="contained"
					color="primary"
					fullWidth
					startIcon={<AddIcon />}
					onClick={() => setCreateDialogOpen(true)}
					sx={{display: {xs: 'flex', sm: 'none'}, mb: 2}}
				>
					{t('job_positions.create_new')}
				</Button>
			)}

			{/* Filters */}
			<JobPositionFilters filters={filters} onChange={setFilters} />

			{/* Error State */}
			{error && !data && (
				<Paper sx={{p: 4, textAlign: 'center'}}>
					<Typography color="error">
						{t('job_positions_table.error_loading')}
					</Typography>
				</Paper>
			)}

			{/* Loading State */}
			{isLoading && renderSkeletonCards()}

			{/* Empty State */}
			{!isLoading && filteredJobPositions.length === 0 && renderEmptyState()}

			{/* Grid View */}
			{!isLoading && filteredJobPositions.length > 0 && viewMode === 'grid' && (
				<Grid container spacing={3} justifyContent="center">
					{filteredJobPositions.map((position) => (
						<Grid
							item
							xs={12}
							sm={6}
							md={4}
							key={position.uid}
							sx={{overflow: 'visible'}}
						>
							<JobPositionCard
								jobPosition={position}
								onView={handleViewDetails}
								onEdit={canManage ? handleEdit : undefined}
							/>
						</Grid>
					))}
				</Grid>
			)}

			{/* List View - Fallback to showing grid message */}
			{!isLoading && filteredJobPositions.length > 0 && viewMode === 'list' && (
				<Paper sx={{p: 4, textAlign: 'center'}}>
					<Typography variant="body1" color="textSecondary">
						{t('job_position_card.list_view_coming_soon')}
					</Typography>
					<Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
						{t('job_position_card.use_grid_view')}
					</Typography>
				</Paper>
			)}

			{/* Dialogs */}
			{selectedJobPosition && (
				<ManageStagesDialog
					open={!!selectedJobPosition}
					onClose={handleCloseStagesDialog}
					jobPositionUid={selectedJobPosition.uid}
					jobPositionTitle={selectedJobPosition.title}
					existingStages={selectedJobPosition.stages}
				/>
			)}

			<CreateJobPositionDialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
			/>

			<UpdateJobPositionDialog
				open={updateDialog.isOpen}
				onClose={updateDialog.close}
				jobPosition={updateDialog.selectedItem}
			/>
		</Box>
	);
};

export default JobPositionsPage;
