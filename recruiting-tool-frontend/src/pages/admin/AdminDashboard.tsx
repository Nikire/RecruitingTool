import {Box, Typography} from '@mui/material';
import {
	People as PeopleIcon,
	Business as BusinessIcon,
	Work as WorkIcon,
	Assignment as AssignmentIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {UnifiedStatCard} from '../../components/common';

const AdminDashboard: React.FC = () => {
	const {t} = useTranslation();
	const {user} = useUserAtom();
	const navigate = useNavigate();

	const stats = [
		{
			title: t('admin_dashboard.candidate_management'),
			icon: <PeopleIcon />,
			color: '#1976d2',
			description: t('admin_dashboard.candidate_management_desc'),
			path: '/admin/candidates',
		},
		{
			title: t('admin_dashboard.company_management'),
			icon: <BusinessIcon />,
			color: '#2e7d32',
			description: t('admin_dashboard.company_management_desc'),
			path: '/admin/companies',
		},
		{
			title: t('admin_dashboard.user_management'),
			icon: <AssignmentIcon />,
			color: '#ed6c02',
			description: t('admin_dashboard.user_management_desc'),
			path: '/admin/users',
		},
		{
			title: t('admin_dashboard.job_positions'),
			icon: <WorkIcon />,
			color: '#9c27b0',
			description: t('admin_dashboard.job_positions_desc'),
			path: '/careers',
		},
	];

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				width: '100%',
				py: 6, // Padding top and bottom instead of centering
			}}
		>
			<Box sx={{mb: 4, textAlign: 'center', maxWidth: 800}}>
				<Typography variant="h4" gutterBottom>
					{t('admin_dashboard.title')}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{t('admin_dashboard.welcome', {name: user?.name})}
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
						sx={{
							width: 280,
							minHeight: 160,
						}}
					>
						<UnifiedStatCard
							title={stat.title}
							icon={stat.icon}
							color={stat.color}
							subtitle={stat.description}
							onClick={() => navigate(stat.path)}
							variant="navigation"
						/>
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default AdminDashboard;
