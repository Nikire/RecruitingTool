import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import {useUserAtom} from '../hooks/api/state/useUserAtom';
import {hasRole} from '../utils/permissions';
import {UserRoles} from '../types/user.types';
import {DashboardLayout, DashboardMenuItem} from '../components/layout';

/**
 * AdminLayout - Layout component for system administration
 * Accessible to ADMIN and SUPER_ADMIN roles only
 */
const AdminLayout: React.FC = () => {
	const {user} = useUserAtom();
	const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

	const menuItems: DashboardMenuItem[] = [
		{
			text: 'Admin Dashboard',
			icon: <DashboardIcon />,
			path: '/admin',
			requiresSuperAdmin: false,
		},
		{
			text: 'Companies',
			icon: <BusinessIcon />,
			path: '/admin/companies',
			requiresSuperAdmin: true,
		},
		{
			text: 'Users',
			icon: <PeopleIcon />,
			path: '/admin/users',
			requiresSuperAdmin: true,
		},
	];

	// Filter menu items based on super admin status
	const canShowMenuItem = (item: DashboardMenuItem) => {
		if (item.requiresSuperAdmin && !isSuperAdmin) {
			return false;
		}
		return true;
	};

	return (
		<DashboardLayout
			title="Admin Panel"
			menuItems={menuItems}
			ariaLabel="admin navigation"
			canShowMenuItem={canShowMenuItem}
		/>
	);
};

export default AdminLayout;
