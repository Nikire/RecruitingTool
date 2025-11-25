import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import {useUserAtom} from '../hooks/api/state/useUserAtom';
import {hasRole} from '../utils/permissions';
import {UserRoles} from '../types/user.types';
import {DashboardLayout, DashboardMenuItem} from '../components/layout';
import { useTranslation } from 'react-i18next';

/**
 * AdminLayout - Layout component for system administration
 * Accessible to ADMIN and SUPER_ADMIN roles only
 */
const AdminLayout: React.FC = () => {
	const { t } = useTranslation();
	const {user} = useUserAtom();
	const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

	const menuItems: DashboardMenuItem[] = [
		{
			text: t('admin_layout.dashboard'),
			icon: <DashboardIcon />,
			path: '/admin',
			requiresSuperAdmin: false,
		},
		{
			text: t('admin_layout.companies'),
			icon: <BusinessIcon />,
			path: '/admin/companies',
			requiresSuperAdmin: true,
		},
		{
			text: t('admin_layout.users'),
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
			title={t('admin_layout.title')}
			menuItems={menuItems}
			ariaLabel={t('admin_layout.aria_label')}
			canShowMenuItem={canShowMenuItem}
		/>
	);
};

export default AdminLayout;
