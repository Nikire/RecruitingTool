import {useState, useMemo} from 'react';
import {
	Typography,
	Box,
	Grid,
	Container,
	Paper,
	Skeleton,
	Stack,
	Chip,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Drawer,
	IconButton,
	Button,
	Divider,
	useMediaQuery,
	useTheme,
	Pagination,
	SelectChangeEvent,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {usePublicJobPositions} from '../../hooks/api/useJobPositions';
import PublicJobCard from '../../components/careers/PublicJobCard';
import JobSearchFilters from '../../components/careers/JobSearchFilters';
import {ApplyToJobDialog} from '../../components/dialogs/ApplyToJobDialog';
import {useDialog} from '../../hooks/useDialog';
import WorkIcon from '@mui/icons-material/Work';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';

interface Filters {
	search: string;
	category: string;
	jobType: string;
	workLocation: string;
	experienceLevel: string;
	salaryMin: string;
	salaryMax: string;
	company: string;
}

const ITEMS_PER_PAGE = 12;

const CareersPage: React.FC = () => {
	const {t} = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));

	// Dialog state
	const applyDialog = useDialog<{uid: string; title: string}>();

	// Filter state
	const [filters, setFilters] = useState<Filters>({
		search: '',
		category: '',
		jobType: '',
		workLocation: '',
		experienceLevel: '',
		salaryMin: '',
		salaryMax: '',
		company: '',
	});

	// Pagination state
	const [page, setPage] = useState(1);

	// Mobile filter drawer state
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

	// Fetch public job positions
	const {data: jobPositions, isLoading, error} = usePublicJobPositions({enabled: true});

	// Get unique companies for filter
	const uniqueCompanies = useMemo(() => {
		if (!jobPositions) return [];
		const companies = new Set(
			jobPositions.map((job) => job.companyName).filter((name): name is string => !!name)
		);
		return Array.from(companies).sort();
	}, [jobPositions]);

	// Filter and paginate jobs
	const {filteredJobs, totalPages, displayedJobs} = useMemo(() => {
		let filtered =
			jobPositions?.filter((job) => {
				// Search filter
				if (filters.search) {
					const searchLower = filters.search.toLowerCase();
					const matchesSearch =
						job.title.toLowerCase().includes(searchLower) ||
						job.companyName?.toLowerCase().includes(searchLower);
					if (!matchesSearch) return false;
				}

				// Company filter
				if (filters.company && job.companyName !== filters.company) {
					return false;
				}

				// Status filter - only show OPEN positions
				if (job.status !== 'OPEN') {
					return false;
				}

				// Future filters will go here (category, jobType, etc.)
				// These fields are placeholders for when backend Issue #164 is ready

				return true;
			}) || [];

		const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
		const startIndex = (page - 1) * ITEMS_PER_PAGE;
		const displayedJobs = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

		return {filteredJobs: filtered, totalPages, displayedJobs};
	}, [jobPositions, filters, page]);

	const openJobsCount = filteredJobs.length;

	const handleApplyClick = (uid: string, title: string) => {
		applyDialog.openWith({uid, title});
	};

	const handleFilterChange = (key: keyof Filters, value: string) => {
		setFilters((prev) => ({...prev, [key]: value}));
		setPage(1); // Reset to first page when filters change
	};

	const handleClearFilters = () => {
		setFilters({
			search: '',
			category: '',
			jobType: '',
			workLocation: '',
			experienceLevel: '',
			salaryMin: '',
			salaryMax: '',
			company: '',
		});
		setPage(1);
	};

	const activeFilterCount = useMemo(() => {
		return Object.entries(filters).filter(([key, value]) => key !== 'search' && value !== '')
			.length;
	}, [filters]);

	const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
		window.scrollTo({top: 0, behavior: 'smooth'});
	};

	// Filter sidebar component
	const FilterSidebar = () => (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				border: 1,
				borderColor: 'divider',
				borderRadius: 2,
				position: 'sticky',
				top: 24,
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Typography variant="h6" sx={{fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1}}>
					<FilterListIcon />
					{t('careersFilters.filters')}
				</Typography>
				{activeFilterCount > 0 && (
					<Button size="small" onClick={handleClearFilters}>
						{t('careersFilters.clear_all')}
					</Button>
				)}
			</Box>

			<Stack spacing={3}>
				{/* Company Filter */}
				<FormControl fullWidth size="small">
					<InputLabel>{t('careersFilters.company')}</InputLabel>
					<Select
						value={filters.company}
						onChange={(e: SelectChangeEvent) => handleFilterChange('company', e.target.value)}
						label={t('careersFilters.company')}
					>
						<MenuItem value="">{t('careersFilters.all_companies')}</MenuItem>
						{uniqueCompanies.map((company) => (
							<MenuItem key={company} value={company}>
								<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
									<BusinessIcon fontSize="small" />
									{company}
								</Box>
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<Divider />

				{/* Category Filter - Placeholder for future */}
				<FormControl fullWidth size="small" disabled>
					<InputLabel>{t('careersFilters.category')}</InputLabel>
					<Select value={filters.category} label={t('careersFilters.category')}>
						<MenuItem value="">{t('careersFilters.all_categories')}</MenuItem>
						<MenuItem value="engineering">{t('careersFilters.engineering')}</MenuItem>
						<MenuItem value="marketing">{t('careersFilters.marketing')}</MenuItem>
						<MenuItem value="sales">{t('careersFilters.sales')}</MenuItem>
						<MenuItem value="design">{t('careersFilters.design')}</MenuItem>
						<MenuItem value="product">{t('careersFilters.product')}</MenuItem>
					</Select>
				</FormControl>

				{/* Job Type Filter - Placeholder for future */}
				<FormControl fullWidth size="small" disabled>
					<InputLabel>{t('careersFilters.job_type')}</InputLabel>
					<Select value={filters.jobType} label={t('careersFilters.job_type')}>
						<MenuItem value="">{t('careersFilters.all_types')}</MenuItem>
						<MenuItem value="full_time">{t('careersFilters.full_time')}</MenuItem>
						<MenuItem value="part_time">{t('careersFilters.part_time')}</MenuItem>
						<MenuItem value="contract">{t('careersFilters.contract')}</MenuItem>
						<MenuItem value="internship">{t('careersFilters.internship')}</MenuItem>
					</Select>
				</FormControl>

				{/* Work Location Filter - Placeholder for future */}
				<FormControl fullWidth size="small" disabled>
					<InputLabel>{t('careersFilters.work_location')}</InputLabel>
					<Select value={filters.workLocation} label={t('careersFilters.work_location')}>
						<MenuItem value="">{t('careersFilters.all_locations')}</MenuItem>
						<MenuItem value="remote">{t('careersFilters.remote')}</MenuItem>
						<MenuItem value="hybrid">{t('careersFilters.hybrid')}</MenuItem>
						<MenuItem value="onsite">{t('careersFilters.onsite')}</MenuItem>
					</Select>
				</FormControl>

				{/* Experience Level Filter - Placeholder for future */}
				<FormControl fullWidth size="small" disabled>
					<InputLabel>{t('careersFilters.experience_level')}</InputLabel>
					<Select
						value={filters.experienceLevel}
						label={t('careersFilters.experience_level')}
					>
						<MenuItem value="">{t('careersFilters.all_levels')}</MenuItem>
						<MenuItem value="entry">{t('careersFilters.entry_level')}</MenuItem>
						<MenuItem value="mid">{t('careersFilters.mid_level')}</MenuItem>
						<MenuItem value="senior">{t('careersFilters.senior_level')}</MenuItem>
						<MenuItem value="lead">{t('careersFilters.lead_level')}</MenuItem>
					</Select>
				</FormControl>

				<Divider />

				{/* Salary Range - Placeholder for future */}
				<Box>
					<Typography variant="body2" sx={{mb: 2, fontWeight: 600}}>
						{t('careersFilters.salary_range')}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{t('careersFilters.coming_soon')}
					</Typography>
				</Box>
			</Stack>
		</Paper>
	);

	// Skeleton loader for loading state
	const SkeletonCard = () => (
		<Paper
			sx={{
				p: 3,
				height: 320,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
			}}
		>
			<Stack direction="row" spacing={2} alignItems="center">
				<Skeleton variant="circular" width={56} height={56} />
				<Box sx={{flex: 1}}>
					<Skeleton variant="text" width="60%" />
				</Box>
			</Stack>
			<Skeleton variant="text" width="90%" height={40} />
			<Skeleton variant="text" width="70%" />
			<Stack direction="row" spacing={1}>
				<Skeleton variant="rectangular" width={80} height={24} sx={{borderRadius: 2}} />
				<Skeleton variant="rectangular" width={80} height={24} sx={{borderRadius: 2}} />
			</Stack>
			<Box sx={{flex: 1}} />
			<Skeleton variant="rectangular" height={48} sx={{borderRadius: 1}} />
		</Paper>
	);

	return (
		<Box
			sx={{
				minHeight: '100vh',
				bgcolor: 'background.default',
				pb: 8,
			}}
		>
			{/* Hero section */}
			<Box
				sx={{
					bgcolor: 'primary.main',
					color: 'primary.contrastText',
					py: {xs: 6, sm: 8, md: 10},
					mb: 6,
					background: (theme) =>
						`linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					position: 'relative',
					overflow: 'hidden',
					'&::before': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundImage:
							'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
						pointerEvents: 'none',
					},
				}}
			>
				<Container maxWidth="xl" sx={{position: 'relative', zIndex: 1}}>
					<Box sx={{textAlign: 'center', maxWidth: 800, mx: 'auto'}}>
						<Typography
							variant="h2"
							sx={{
								fontWeight: 800,
								mb: 2,
								fontSize: {xs: '2rem', sm: '2.75rem', md: '3.5rem'},
								lineHeight: 1.2,
								textShadow: '0 2px 4px rgba(0,0,0,0.1)',
							}}
						>
							{t('careersHero.title')}
						</Typography>
						<Typography
							variant="h6"
							sx={{
								mb: 4,
								opacity: 0.95,
								fontSize: {xs: '1rem', sm: '1.25rem'},
								fontWeight: 400,
								lineHeight: 1.6,
							}}
						>
							{t('careersHero.subtitle')}
						</Typography>

						{/* Job count badge */}
						<Box
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 1,
								bgcolor: 'rgba(255,255,255,0.2)',
								backdropFilter: 'blur(10px)',
								px: 3,
								py: 1.5,
								borderRadius: 3,
								border: '1px solid rgba(255,255,255,0.3)',
							}}
						>
							<WorkIcon sx={{fontSize: 24}} />
							<Typography variant="h6" sx={{fontWeight: 700}}>
								{isLoading
									? '...'
									: t('careers.open_positions_count', {count: openJobsCount})}
							</Typography>
						</Box>
					</Box>
				</Container>
			</Box>

			{/* Main content */}
			<Container maxWidth="xl">
				{/* Search bar */}
				<Box sx={{mb: 4}}>
					<JobSearchFilters
						search={filters.search}
						onSearchChange={(value) => handleFilterChange('search', value)}
					/>
				</Box>

				{/* Filter button for mobile */}
				{isMobile && (
					<Box sx={{mb: 3}}>
						<Button
							variant="outlined"
							startIcon={<FilterListIcon />}
							onClick={() => setFilterDrawerOpen(true)}
							fullWidth
							sx={{py: 1.5}}
						>
							{t('careersFilters.filters')}
							{activeFilterCount > 0 && (
								<Chip
									label={activeFilterCount}
									size="small"
									color="primary"
									sx={{ml: 1}}
								/>
							)}
						</Button>
					</Box>
				)}

				{/* Layout with sidebar and content */}
				<Box sx={{display: 'flex', gap: 4}}>
					{/* Desktop Filter Sidebar */}
					{!isMobile && (
						<Box sx={{width: 280, flexShrink: 0}}>
							<FilterSidebar />
						</Box>
					)}

					{/* Mobile Filter Drawer */}
					<Drawer
						anchor="left"
						open={filterDrawerOpen}
						onClose={() => setFilterDrawerOpen(false)}
						PaperProps={{
							sx: {width: 320, p: 2},
						}}
					>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								mb: 2,
							}}
						>
							<Typography variant="h6" sx={{fontWeight: 700}}>
								{t('careersFilters.filters')}
							</Typography>
							<IconButton onClick={() => setFilterDrawerOpen(false)}>
								<CloseIcon />
							</IconButton>
						</Box>
						<FilterSidebar />
					</Drawer>

					{/* Job listings */}
					<Box sx={{flex: 1}}>
						{/* Results count and active filters */}
						{!isLoading && !error && (
							<Box sx={{mb: 3}}>
								<Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
									{t('careersResults.showing_results', {
										count: displayedJobs.length,
										total: filteredJobs.length,
									})}
								</Typography>

								{/* Active filter chips */}
								{activeFilterCount > 0 && (
									<Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
										{filters.company && (
											<Chip
												label={`${t('careersFilters.company')}: ${filters.company}`}
												onDelete={() => handleFilterChange('company', '')}
												size="small"
											/>
										)}
										{filters.category && (
											<Chip
												label={`${t('careersFilters.category')}: ${filters.category}`}
												onDelete={() => handleFilterChange('category', '')}
												size="small"
											/>
										)}
									</Stack>
								)}
							</Box>
						)}

						{/* Loading state */}
						{isLoading && (
							<Grid container spacing={3}>
								{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
									<Grid
										item
										key={i}
										xs={12}
										sm={6}
										lg={4}
										sx={{
											overflow: 'visible',
											display: 'flex',
											justifyContent: 'center',
										}}
									>
										<Box sx={{width: 400, maxWidth: '100%'}}>
											<SkeletonCard />
										</Box>
									</Grid>
								))}
							</Grid>
						)}

						{/* Error state */}
						{error && !isLoading && (
							<Box sx={{textAlign: 'center', py: 8}}>
								<Typography color="error" variant="h6" gutterBottom>
									{t('errors.fetch_failed')}
								</Typography>
								<Typography color="text.secondary">
									{t('errors.try_again')}
								</Typography>
							</Box>
						)}

						{/* Empty state - no jobs */}
						{!isLoading &&
							!error &&
							filteredJobs.length === 0 &&
							!filters.search &&
							activeFilterCount === 0 && (
								<Box sx={{textAlign: 'center', py: 8}}>
									<WorkIcon
										sx={{fontSize: 80, color: 'text.disabled', mb: 2}}
									/>
									<Typography variant="h5" gutterBottom sx={{fontWeight: 600}}>
										{t('careers.no_positions_yet')}
									</Typography>
									<Typography color="text.secondary">
										{t('careers.check_back_soon')}
									</Typography>
								</Box>
							)}

						{/* Empty state - no search/filter results */}
						{!isLoading &&
							!error &&
							filteredJobs.length === 0 &&
							(filters.search || activeFilterCount > 0) && (
								<Box sx={{textAlign: 'center', py: 8}}>
									<SearchOffIcon
										sx={{fontSize: 80, color: 'text.disabled', mb: 2}}
									/>
									<Typography variant="h5" gutterBottom sx={{fontWeight: 600}}>
										{t('careers.no_results_found')}
									</Typography>
									<Typography color="text.secondary" sx={{mb: 3}}>
										{t('careers.try_different_keywords')}
									</Typography>
									<Button variant="outlined" onClick={handleClearFilters}>
										{t('careersFilters.clear_all')}
									</Button>
								</Box>
							)}

						{/* Job cards grid */}
						{!isLoading && !error && displayedJobs.length > 0 && (
							<>
								<Grid container spacing={3}>
									{displayedJobs.map((job) => (
										<Grid
											key={job.uid}
											item
											xs={12}
											sm={6}
											lg={4}
											sx={{
												overflow: 'visible',
												display: 'flex',
												justifyContent: 'center',
											}}
										>
											<PublicJobCard
												jobPosition={job}
												onApplyClick={handleApplyClick}
											/>
										</Grid>
									))}
								</Grid>

								{/* Pagination */}
								{totalPages > 1 && (
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'center',
											mt: 6,
										}}
									>
										<Pagination
											count={totalPages}
											page={page}
											onChange={handlePageChange}
											color="primary"
											size={isMobile ? 'medium' : 'large'}
											showFirstButton
											showLastButton
											sx={{
												'& .MuiPaginationItem-root': {
													fontWeight: 600,
												},
											}}
										/>
									</Box>
								)}
							</>
						)}
					</Box>
				</Box>
			</Container>

			{/* Apply dialog */}
			{applyDialog.selectedItem && (
				<ApplyToJobDialog
					open={applyDialog.isOpen}
					onClose={applyDialog.close}
					jobUid={applyDialog.selectedItem.uid}
					jobTitle={applyDialog.selectedItem.title}
				/>
			)}
		</Box>
	);
};

export default CareersPage;
