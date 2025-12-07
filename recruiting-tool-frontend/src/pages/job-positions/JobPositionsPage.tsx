import {useState} from 'react';
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
	TablePagination,
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
import {useAuthMe} from '../../hooks/api/useAuth';
import {canManageResources} from '../../utils/permissions';
import {useDialog} from '../../hooks/useDialog';

const JobPositionsPage: React.FC = () => {
	const {t} = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();
	const {user, isLoading: userLoading} = useAuthMe();
	const canManage = canManageResources(user);

	// Wait for user data to load before rendering (fixes race condition)
	if (userLoading) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
				<CircularProgress />
			</Box>
		);
	}

	const [selectedJobPosition, setSelectedJobPosition] =
		useState<JobPosition | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const updateDialog = useDialog<JobPosition>();

	// View mode state (grid or list) - saved to localStorage
	const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
		return (localStorage.getItem('jobPositions_viewMode') as 'grid' | 'list') || 'grid';
	});

	// Pagination state
	const [page, setPage] = useState(0); // MUI TablePagination uses 0-based indexing
	const [pageSize, setPageSize] = useState(10);

	// Filter state
	const [filters, setFilters] = useState<JobPositionFiltersState>({
		search: '',
		status: 'ALL',
		department: 'ALL',
		location: '',
		dateFrom: null,
		dateTo: null,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	// Fetch job positions with server-side pagination and filtering
	const {data, isLoading, error} = useListJobPositions({
		page: page + 1, // Convert to 1-based for API
		limit: pageSize,
		search: filters.search || undefined,
		status: filters.status !== 'ALL' ? filters.status : undefined,
		sortBy: filters.sortBy,
		sortOrder: filters.sortOrder,
	});

	const jobPositions = data?.data || [];
	const totalCount = data?.meta?.total || 0;

	const handleViewModeChange = (
		_event: React.MouseEvent<HTMLElement>,
		newMode: 'grid' | 'list' | null
	) => {
		if (newMode !== null) {
			setViewMode(newMode);
			localStorage.setItem('jobPositions_viewMode', newMode);
		}
	};

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
		window.scrollTo({top: 0, behavior: 'smooth'});
	};

	const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPageSize(parseInt(event.target.value, 10));
		setPage(0); // Reset to first page
	};

	const handleFilterChange = (newFilters: JobPositionFiltersState) => {
		setFilters(newFilters);
		setPage(0); // Reset to first page when filters change
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
				{filters.search || filters.status !== 'ALL' || filters.location || filters.dateFrom || filters.dateTo
					? t('job_position_card.no_results')
					: t('job_position_card.no_positions')}
			</Typography>
			{!filters.search && filters.status === 'ALL' && !filters.location && !filters.dateFrom && !filters.dateTo && canManage && (
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

	// Pagination info text
	const getPaginationText = () => {
		if (totalCount === 0) return '';
		const start = page * pageSize + 1;
		const end = Math.min((page + 1) * pageSize, totalCount);
		return t('job_positions.pagination_showing', {start, end, total: totalCount});
	};

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
			<JobPositionFilters filters={filters} onChange={handleFilterChange} />

			{/* Pagination Info */}
			{!isLoading && totalCount > 0 && (
				<Box sx={{mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<Typography variant="body2" color="text.secondary">
						{getPaginationText()}
					</Typography>
				</Box>
			)}

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
			{!isLoading && jobPositions.length === 0 && renderEmptyState()}

			{/* Grid View */}
			{!isLoading && jobPositions.length > 0 && viewMode === 'grid' && (
				<>
					<Grid container spacing={3} justifyContent="center">
						{jobPositions.map((position) => (
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

					{/* Pagination Controls */}
					<Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
						<TablePagination
							component="div"
							count={totalCount}
							page={page}
							onPageChange={handlePageChange}
							rowsPerPage={pageSize}
							onRowsPerPageChange={handlePageSizeChange}
							rowsPerPageOptions={[10, 25, 50]}
							labelRowsPerPage={t('job_positions.per_page')}
							labelDisplayedRows={({from, to, count}) =>
								t('job_positions.pagination_info', {from, to, count})
							}
							sx={{
								'& .MuiTablePagination-toolbar': {
									justifyContent: 'center',
								},
							}}
						/>
					</Box>
				</>
			)}

			{/* List View - Fallback to showing grid message */}
			{!isLoading && jobPositions.length > 0 && viewMode === 'list' && (
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
