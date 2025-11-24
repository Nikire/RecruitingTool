import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import {DashboardLayout, DashboardMenuItem} from '../components/layout';

/**
 * HRLayout - Layout component for HR panel with dedicated navigation
 * Accessible to HR, ADMIN, and SUPER_ADMIN roles
 */
const HRLayout: React.FC = () => {
	const menuItems: DashboardMenuItem[] = [
		{
			text: 'HR Dashboard',
			icon: <DashboardIcon />,
			path: '/hr/dashboard',
		},
		{
			text: 'Applications',
			icon: <AssignmentIcon />,
			path: '/hr/applications',
		},
		{
			text: 'Candidates',
			icon: <GroupIcon />,
			path: '/hr/candidates',
		},
		{
			text: 'Job Positions',
			icon: <WorkIcon />,
			path: '/hr/job-positions',
		},
		{
			text: 'Email Templates',
			icon: <EmailIcon />,
			path: '/hr/email-templates',
		},
	];

	return (
		<DashboardLayout
			title="HR Panel"
			menuItems={menuItems}
			ariaLabel="hr navigation"
		/>
	);
};

export default HRLayout;
