import {Box, Card, CardContent, Typography, Grid, Button} from '@mui/material';
import {
	People as PeopleIcon,
	Business as BusinessIcon,
	Work as WorkIcon,
	Assignment as AssignmentIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';

interface StatCardProps {
	title: string;
	icon: React.ReactNode;
	color: string;
	description: string;
}

const StatCard: React.FC<StatCardProps> = ({title, icon, color, description}) => {
	return (
		<Card sx={{height: '100%'}}>
			<CardContent>
				<Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
					<Box
						sx={{
							bgcolor: color,
							color: 'white',
							p: 1.5,
							borderRadius: 2,
							display: 'flex',
							mr: 2,
						}}
					>
						{icon}
					</Box>
					<Typography variant="h6" component="div">
						{title}
					</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary">
					{description}
				</Typography>
			</CardContent>
		</Card>
	);
};

const AdminDashboard: React.FC = () => {
	const {user} = useUserAtom();
	const navigate = useNavigate();

	const stats = [
		{
			title: 'User Management',
			icon: <PeopleIcon />,
			color: '#1976d2',
			description: 'Manage user accounts, roles, and permissions',
			path: '/admin/users',
		},
		{
			title: 'Company Management',
			icon: <BusinessIcon />,
			color: '#2e7d32',
			description: 'Manage companies and their settings',
			path: '/admin/companies',
		},
		{
			title: 'Job Positions',
			icon: <WorkIcon />,
			color: '#ed6c02',
			description: 'View all job positions across companies',
			path: '/job-positions',
		},
		{
			title: 'Hiring Processes',
			icon: <AssignmentIcon />,
			color: '#9c27b0',
			description: 'Monitor all active hiring processes',
			path: '/dashboard',
		},
	];

	return (
		<Box>
			<Box sx={{mb: 4}}>
				<Typography variant="h4" gutterBottom>
					Admin Dashboard
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Welcome back, {user?.name}! Manage your system from this central hub.
				</Typography>
			</Box>

			<Grid container spacing={3}>
				{stats.map((stat) => (
					<Grid item xs={12} sm={6} md={6} key={stat.title}>
						<Box
							onClick={() => navigate(stat.path)}
							sx={{
								cursor: 'pointer',
								height: '100%',
								'&:hover': {
									transform: 'translateY(-4px)',
									transition: 'transform 0.2s ease-in-out',
								},
							}}
						>
							<StatCard
								title={stat.title}
								icon={stat.icon}
								color={stat.color}
								description={stat.description}
							/>
						</Box>
					</Grid>
				))}
			</Grid>

			<Box sx={{mt: 4}}>
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Quick Actions
						</Typography>
						<Box sx={{display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap'}}>
							<Button
								variant="outlined"
								startIcon={<PeopleIcon />}
								onClick={() => navigate('/admin/users')}
							>
								Manage Users
							</Button>
							<Button
								variant="outlined"
								startIcon={<BusinessIcon />}
								onClick={() => navigate('/admin/companies')}
							>
								Manage Companies
							</Button>
							<Button
								variant="outlined"
								startIcon={<AssignmentIcon />}
								onClick={() => navigate('/dashboard')}
							>
								View Dashboard
							</Button>
						</Box>
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
};

export default AdminDashboard;
