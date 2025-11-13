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
			title: 'Candidate Management',
			icon: <PeopleIcon />,
			color: '#1976d2',
			description: 'Manage candidates and their applications',
			path: '/admin/candidates',
		},
		{
			title: 'Company Management',
			icon: <BusinessIcon />,
			color: '#2e7d32',
			description: 'Manage companies and their settings',
			path: '/admin/companies',
		},
		{
			title: 'User Management',
			icon: <AssignmentIcon />,
			color: '#ed6c02',
			description: 'Manage user accounts, roles, and permissions',
			path: '/admin/users',
		},
		{
			title: 'Job Positions',
			icon: <WorkIcon />,
			color: '#9c27b0',
			description: 'View all job positions across companies',
			path: '/job-positions',
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

			<Grid container spacing={3} sx={{maxWidth: 900, margin: '0 auto'}}>
				{stats.map((stat) => (
					<Grid item xs={12} sm={6} key={stat.title}>
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
		</Box>
	);
};

export default AdminDashboard;
