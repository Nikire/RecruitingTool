import {ChevronLeft as ChevronLeftIcon} from '@mui/icons-material';
import {
	Drawer,
	List,
	ListItemButton,
	ListItemButtonBaseProps,
	ListItemText,
	PropTypes,
} from '@mui/material';
import {NavLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import { User } from '../../types/user.types';
import { isAdmin, canManageResources } from '../../utils/permissions';

type NavbarDrawerProps = {
	isOpen?: boolean;
	onClose?: () => void;
	color?: PropTypes.Color;
	linkSx?: ListItemButtonBaseProps['sx'];
	handleMenuClick?: () => void;
	isAuthenticated?: boolean;
	user?: User | null;
};

const NavbarDrawer: React.FC<NavbarDrawerProps> = ({
	isOpen,
	onClose,
	color,
	linkSx,
	handleMenuClick,
	isAuthenticated,
	user,
}) => {
	const {t} = useTranslation();

	return (
		<Drawer
			anchor="left"
			color={color}
			open={isOpen}
			onClose={onClose}
			id="navbar-drawer"
			aria-label={t('aria.navigation')}
		>
			<List color="inherit" sx={{minWidth: 200, padding: 0, margin: 0}} role="navigation">
				<ListItemButton
					divider
					disableGutters
					color="secondary"
					sx={{
						justifyContent: 'center',
						bgcolor: `${color}.dark`,
						color: `${color}.contrastText`,
						'&:hover': {bgcolor: `${color}.light`},
						'&.Mui-focusVisible': {bgcolor: `${color}.light`},
						'&.Mui-selected, &.Mui-selected:hover': {bgcolor: `${color}.light`},
					}}
					onClick={handleMenuClick}
					aria-label={t('aria.close_drawer')}
				>
					<ChevronLeftIcon sx={{color: `${color}.contrastText`}} />
				</ListItemButton>
				<ListItemButton component={NavLink} sx={linkSx} to="/" end aria-label={t('navbar.home')}>
					<ListItemText color="inherit" primary={t('navbar.home')} />
				</ListItemButton>
				<ListItemButton component={NavLink} sx={linkSx} to="/careers" aria-label={t('navbar.careers')}>
					<ListItemText color="inherit" primary={t('navbar.careers')} />
				</ListItemButton>
				{isAuthenticated && canManageResources(user ?? null) && (
					<ListItemButton component={NavLink} sx={linkSx} to="/hr/dashboard" aria-label={t('navbar.hr_panel')}>
						<ListItemText color="inherit" primary={t('navbar.hr_panel')} />
					</ListItemButton>
				)}
				{isAuthenticated && isAdmin(user ?? null) && (
					<ListItemButton component={NavLink} sx={linkSx} to="/admin" aria-label={t('navbar.admin_panel')}>
						<ListItemText color="inherit" primary={t('navbar.admin_panel')} />
					</ListItemButton>
				)}
			</List>
		</Drawer>
	);
};

export default NavbarDrawer;
