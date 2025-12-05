import {useState} from 'react';
import {Typography, Box, Grid, Container, Paper, Skeleton, Stack} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {usePublicJobPositions} from '../../hooks/api/useJobPositions';
import PublicJobCard from '../../components/careers/PublicJobCard';
import JobSearchFilters from '../../components/careers/JobSearchFilters';
import {ApplyToJobDialog} from '../../components/dialogs/ApplyToJobDialog';
import {useDialog} from '../../hooks/useDialog';
import WorkIcon from '@mui/icons-material/Work';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const CareersPage: React.FC = () => {
	const {t} = useTranslation();
	const [search, setSearch] = useState('');

	// Dialog state
	const applyDialog = useDialog<{uid: string; title: string}>();

	// Fetch public job positions
	const {data: jobPositions, isLoading, error} = usePublicJobPositions({enabled: true});

	// Filter jobs based on search
	const filteredJobs =
		jobPositions?.filter((job) => {
			if (!search) return true;
			const searchLower = search.toLowerCase();
			return (
				job.title.toLowerCase().includes(searchLower) ||
				job.companyName?.toLowerCase().includes(searchLower)
			);
		}) || [];

	const openJobsCount = filteredJobs.filter((job) => job.status === 'OPEN').length;

	const handleApplyClick = (uid: string, title: string) => {
		applyDialog.openWith({uid, title});
	};

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
				<Container maxWidth="lg" sx={{position: 'relative', zIndex: 1}}>
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
							{t('careers.hero_title')}
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
							{t('careers.hero_subtitle')}
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
			<Container maxWidth="lg">
				{/* Search and filters */}
				<JobSearchFilters search={search} onSearchChange={setSearch} />

				{/* Loading state */}
				{isLoading && (
					<Grid container spacing={3} justifyContent="center">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Grid
								item
								key={i}
								xs={12}
								sm={6}
								md={4}
								sx={{overflow: 'visible', display: 'flex', justifyContent: 'center'}}
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
				{!isLoading && !error && filteredJobs.length === 0 && !search && (
					<Box sx={{textAlign: 'center', py: 8}}>
						<WorkIcon sx={{fontSize: 80, color: 'text.disabled', mb: 2}} />
						<Typography variant="h5" gutterBottom sx={{fontWeight: 600}}>
							{t('careers.no_positions_yet')}
						</Typography>
						<Typography color="text.secondary">
							{t('careers.check_back_soon')}
						</Typography>
					</Box>
				)}

				{/* Empty state - no search results */}
				{!isLoading && !error && filteredJobs.length === 0 && search && (
					<Box sx={{textAlign: 'center', py: 8}}>
						<SearchOffIcon sx={{fontSize: 80, color: 'text.disabled', mb: 2}} />
						<Typography variant="h5" gutterBottom sx={{fontWeight: 600}}>
							{t('careers.no_results_found')}
						</Typography>
						<Typography color="text.secondary">
							{t('careers.try_different_keywords')}
						</Typography>
					</Box>
				)}

				{/* Job cards grid */}
				{!isLoading && !error && filteredJobs.length > 0 && (
					<Grid container spacing={3} justifyContent="center">
						{filteredJobs.map((job) => (
							<Grid
								key={job.uid}
								item
								xs={12}
								sm={6}
								md={4}
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
				)}
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
