import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import {DashboardLayout, DashboardMenuItem} from '../components/layout';
import { useTranslation } from 'react-i18next';

/**
 * HRLayout - Layout component for HR panel with dedicated navigation
 * Accessible to HR, ADMIN, and SUPER_ADMIN roles
 */
const HRLayout: React.FC = () => {
	const { t } = useTranslation();

	const menuItems: DashboardMenuItem[] = [
		{
			text: t('hr_layout.dashboard'),
			icon: <DashboardIcon />,
			path: '/hr/dashboard',
		},
		{
			text: t('hr_layout.applications'),
			icon: <AssignmentIcon />,
			path: '/hr/applications',
		},
		{
			text: t('hr_layout.candidates'),
			icon: <GroupIcon />,
			path: '/hr/candidates',
		},
		{
			text: t('hr_layout.job_positions'),
			icon: <WorkIcon />,
			path: '/hr/job-positions',
		},
		{
			text: t('hr_layout.analytics'),
			icon: <AnalyticsIcon />,
			path: '/hr/analytics',
		},
		{
			text: t('hr_layout.email_templates'),
			icon: <EmailIcon />,
			path: '/hr/email-templates',
		},
		{
			text: t('hr_layout.team'),
			icon: <PeopleIcon />,
			path: '/settings/team',
		},
	];

	return (
		<DashboardLayout
			title={t('hr_layout.title')}
			menuItems={menuItems}
			ariaLabel={t('hr_layout.aria_label')}
		/>
	);
};

export default HRLayout;
