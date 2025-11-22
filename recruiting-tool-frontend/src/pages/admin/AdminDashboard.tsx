import {Box, Typography} from '@mui/material';
import {
	People as PeopleIcon,
	Business as BusinessIcon,
	Work as WorkIcon,
	Assignment as AssignmentIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import StatCard from '../../components/cards/stat-card/StatCard';

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
			path: '/careers',
		},
	];

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
				width: '100%',
			}}
		>
			<Box sx={{mb: 4, textAlign: 'center', maxWidth: 800}}>
				<Typography variant="h4" gutterBottom>
					Admin Dashboard
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Welcome back, {user?.name}! Manage your system from this central hub.
				</Typography>
			</Box>

			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 3,
					justifyContent: 'center',
					width: 'calc(280px * 2 + 24px)', // 2 cards + gap (theme spacing 3 = 24px)
				}}
			>
				{stats.map((stat) => (
					<Box
						key={stat.title}
						onClick={() => navigate(stat.path)}
						sx={{
							cursor: 'pointer',
							width: 280,
							minHeight: 160,
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
				))}
			</Box>
		</Box>
	);
};

export default AdminDashboard;
