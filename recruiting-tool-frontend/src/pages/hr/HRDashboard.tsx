import {Box, Typography, Grid, Button, Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import {useApplications} from '../../hooks/api/useApplications';
import {useCandidates} from '../../hooks/api/useCandidates';
import {useJobPositions} from '../../hooks/api/useJobPositions';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import {Navigate} from 'react-router-dom';
import ApplicationDetailDialog from '../../components/dialogs/ApplicationDetailDialog';
import {Application} from '../../types/application.types';
import {DashboardStatCard, ApplicationListItem, QuickActionButton} from '../../components/dashboard';
import SkeletonLoader from '../../components/common/SkeletonLoader';

/**
 * HRDashboard - Main dashboard for HR users
 * Shows overview of applications, candidates, and job positions with quick actions
 */
const HRDashboard: React.FC = () => {
	const {t} = useTranslation();
	const {user} = useUserAtom();
	const navigate = useNavigate();
	const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

	// Permission check
	const hasAccess = canManageResources(user);
	if (!hasAccess) {
		return <Navigate to="/login" />;
	}

	// Fetch data
	const {data: applications, isLoading: applicationsLoading} = useApplications();
	const {data: candidates, isLoading: candidatesLoading} = useCandidates();
	const {data: jobPositions, isLoading: jobPositionsLoading} = useJobPositions();

	// Calculate statistics
	const totalApplications = applications?.length || 0;
	const pendingApplications = applications?.filter(app => app.status === 'PENDING')?.length || 0;
	const totalCandidates = candidates?.length || 0;
	const totalJobPositions = jobPositions?.length || 0;
	const openPositions = jobPositions?.filter(job => job.status === 'OPEN')?.length || 0;

	// Get recent applications (last 5)
	const recentApplications = applications?.slice(0, 5) || [];

	const isLoading = applicationsLoading || candidatesLoading || jobPositionsLoading;

	// Dashboard stat cards data
	const statsData = [
		{
			title: 'Applications',
			value: totalApplications,
			subtitle: `${pendingApplications} pending review`,
			icon: <AssignmentIcon />,
			iconColor: 'primary.main',
			onClick: () => navigate('/hr/applications'),
		},
		{
			title: 'Candidates',
			value: totalCandidates,
			subtitle: 'Active in hiring processes',
			icon: <GroupIcon />,
			iconColor: 'success.main',
			onClick: () => navigate('/hr/candidates'),
		},
		{
			title: 'Job Positions',
			value: totalJobPositions,
			subtitle: `${openPositions} currently open`,
			icon: <WorkIcon />,
			iconColor: 'info.main',
			onClick: () => navigate('/hr/job-positions'),
		},
		{
			title: 'Pending Review',
			value: pendingApplications,
			subtitle: 'Applications need attention',
			icon: <AssignmentIcon />,
			iconColor: 'warning.main',
		},
	];

	// Quick actions configuration
	const quickActions = [
		{
			icon: <WorkIcon />,
			label: 'dashboard.manage_positions',
			onClick: () => navigate('/hr/job-positions'),
		},
		{
			icon: <AssignmentIcon />,
			label: 'dashboard.review_applications',
			onClick: () => navigate('/hr/applications'),
		},
		{
			icon: <GroupIcon />,
			label: 'dashboard.view_candidates',
			onClick: () => navigate('/hr/candidates'),
		},
	];

	return (
		<Box>
			<Box
				sx={{
					mb: {xs: 2, sm: 4},
					display: 'flex',
					flexDirection: {xs: 'column', sm: 'row'},
					justifyContent: 'space-between',
					alignItems: {xs: 'flex-start', sm: 'center'},
					gap: 2,
				}}
			>
				<Typography
					variant="h4"
					component="h1"
					sx={{fontSize: {xs: '1.5rem', sm: '2.125rem'}}}
				>
					{t('dashboard.title')}
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => navigate('/hr/job-positions')}
					sx={{
						width: {xs: '100%', sm: 'auto'},
						minHeight: '44px', // Minimum touch target
					}}
					aria-label={t('dashboard.create_position')}
				>
					{t('dashboard.create_position')}
				</Button>
			</Box>

			{/* Statistics Cards */}
			<Grid container spacing={{xs: 2, sm: 3}} sx={{mb: {xs: 3, sm: 4}}}>
				{statsData.map((stat, index) => (
					<Grid item xs={12} sm={6} md={3} key={index}>
						<DashboardStatCard
							title={stat.title}
							value={stat.value}
							subtitle={stat.subtitle}
							icon={stat.icon}
							iconColor={stat.iconColor}
							isLoading={isLoading}
							onClick={stat.onClick}
						/>
					</Grid>
				))}
			</Grid>

			{/* Recent Applications */}
			<Paper sx={{p: {xs: 2, sm: 3}}}>
				<Box
					sx={{
						mb: {xs: 2, sm: 3},
						display: 'flex',
						flexDirection: {xs: 'column', sm: 'row'},
						justifyContent: 'space-between',
						alignItems: {xs: 'flex-start', sm: 'center'},
						gap: 2,
					}}
				>
					<Typography
						variant="h5"
						component="h2"
						sx={{fontSize: {xs: '1.25rem', sm: '1.5rem'}}}
					>
						{t('dashboard.recent_applications')}
					</Typography>
					<Button
						onClick={() => navigate('/hr/applications')}
						sx={{
							width: {xs: '100%', sm: 'auto'},
							minHeight: '44px',
						}}
					>
						{t('dashboard.view_all')}
					</Button>
				</Box>

				{isLoading ? (
					<SkeletonLoader variant="list" count={5} />
				) : recentApplications.length === 0 ? (
					<Typography color="text.secondary" sx={{py: 4, textAlign: 'center'}}>
						{t('dashboard.no_applications')}
					</Typography>
				) : (
					<Box>
						{recentApplications.map((application) => (
							<ApplicationListItem
								key={application.uid}
								application={application}
								onClick={setSelectedApplication}
							/>
						))}
					</Box>
				)}
			</Paper>

			{/* Quick Actions */}
			<Box sx={{mt: {xs: 3, sm: 4}}}>
				<Typography
					variant="h5"
					component="h2"
					sx={{
						mb: 2,
						fontSize: {xs: '1.25rem', sm: '1.5rem'},
					}}
				>
					{t('dashboard.quick_actions')}
				</Typography>
				<Grid container spacing={2}>
					{quickActions.map((action, index) => (
						<QuickActionButton
							key={index}
							icon={action.icon}
							label={action.label}
							onClick={action.onClick}
							translate
						/>
					))}
				</Grid>
			</Box>

			{/* Application Detail Dialog */}
			<ApplicationDetailDialog
				open={!!selectedApplication}
				onClose={() => setSelectedApplication(null)}
				application={selectedApplication}
			/>
		</Box>
	);
};

export default HRDashboard;
