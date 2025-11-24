import {Box, Typography, Grid, CircularProgress, Button, Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
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
import {format} from 'date-fns';
import ApplicationDetailDialog from '../../components/dialogs/ApplicationDetailDialog';
import {Application} from '../../types/application.types';
import {DashboardStatCard} from '../../components/dashboard';
import {StatusChip} from '../../components/common';

/**
 * HRDashboard - Main dashboard for HR users
 * Shows overview of applications, candidates, and job positions with quick actions
 */
const HRDashboard: React.FC = () => {
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

	return (
		<Box sx={{mt: 8}}>
			<Box sx={{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<Typography variant="h4" component="h1">
					HR Dashboard
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => navigate('/hr/job-positions')}
				>
					Create Job Position
				</Button>
			</Box>

			{/* Statistics Cards */}
			<Grid container spacing={3} sx={{mb: 4}}>
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
			<Paper sx={{p: 3}}>
				<Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<Typography variant="h5" component="h2">
						Recent Applications
					</Typography>
					<Button onClick={() => navigate('/hr/applications')}>
						View All
					</Button>
				</Box>

				{isLoading ? (
					<Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
						<CircularProgress />
					</Box>
				) : recentApplications.length === 0 ? (
					<Typography color="text.secondary" sx={{py: 4, textAlign: 'center'}}>
						No applications yet
					</Typography>
				) : (
					<Box>
						{recentApplications.map((application) => (
							<Box
								key={application.uid}
								sx={{
									py: 2,
									borderBottom: '1px solid',
									borderColor: 'divider',
									'&:last-child': {borderBottom: 'none'},
									cursor: 'pointer',
									'&:hover': {bgcolor: 'action.hover'},
									px: 2,
									borderRadius: 1,
									transition: 'background-color 0.2s ease',
								}}
								onClick={() => setSelectedApplication(application)}
							>
								<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1}}>
									<Box sx={{flex: 1}}>
										<Typography variant="subtitle1" fontWeight="medium">
											{application.applicantName}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Applied for: {application.jobPositionTitle}
										</Typography>
										<Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: 'block'}}>
											{application.applicantEmail}
										</Typography>
									</Box>
									<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, ml: 2}}>
										<StatusChip
											status={application.status}
											type="application"
											size="small"
											translate
										/>
										<Typography variant="caption" color="text.secondary">
											{application.appliedAt ? format(new Date(application.appliedAt), 'MMM dd, yyyy') : 'N/A'}
										</Typography>
									</Box>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Paper>

			{/* Quick Actions */}
			<Box sx={{mt: 4}}>
				<Typography variant="h5" component="h2" sx={{mb: 2}}>
					Quick Actions
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6} md={4}>
						<Button
							variant="outlined"
							fullWidth
							startIcon={<WorkIcon />}
							onClick={() => navigate('/hr/job-positions')}
							sx={{py: 2}}
						>
							Manage Job Positions
						</Button>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<Button
							variant="outlined"
							fullWidth
							startIcon={<AssignmentIcon />}
							onClick={() => navigate('/hr/applications')}
							sx={{py: 2}}
						>
							Review Applications
						</Button>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<Button
							variant="outlined"
							fullWidth
							startIcon={<GroupIcon />}
							onClick={() => navigate('/hr/candidates')}
							sx={{py: 2}}
						>
							View Candidates
						</Button>
					</Grid>
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
