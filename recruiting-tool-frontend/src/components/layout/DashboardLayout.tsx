import {useState} from 'react';
import {
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	Toolbar,
	AppBar,
	IconButton,
	Divider,
} from '@mui/material';
import {Outlet, NavLink, useNavigate} from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import UserAvatar from '../user/UserAvatar';
import {useTranslation} from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';

const drawerWidth = 240;

/**
 * Menu item configuration for DashboardLayout
 */
export interface DashboardMenuItem {
	/** Display text for menu item (can be i18n key or plain text) */
	text: string;
	/** Icon element to display */
	icon: React.ReactNode;
	/** Navigation path */
	path: string;
	/** Whether this item requires super admin role */
	requiresSuperAdmin?: boolean;
}

/**
 * Props for the DashboardLayout component
 */
export interface DashboardLayoutProps {
	/** Title displayed in drawer and app bar (can be i18n key or plain text) */
	title: string;
	/** Menu items to display in navigation */
	menuItems: DashboardMenuItem[];
	/** Child components (typically from Outlet) */
	children?: React.ReactNode;
	/** ARIA label for navigation */
	ariaLabel?: string;
	/** Whether to translate title and menu items using i18n (default: false) */
	translate?: boolean;
	/** Function to check if user has required permissions for menu items */
	canShowMenuItem?: (item: DashboardMenuItem) => boolean;
}

/**
 * DashboardLayout - Reusable layout component for dashboard pages
 *
 * Provides a consistent layout with:
 * - Responsive drawer navigation (mobile + desktop)
 * - App bar with user avatar
 * - Navigation menu items
 * - Profile and "Back to Careers" links
 * - Mobile-optimized spacing and layout
 *
 * Used by HRLayout, AdminLayout, and other dashboard layouts.
 *
 * @example
 * ```tsx
 * const menuItems = [
 *   { text: 'Dashboard', icon: <DashboardIcon />, path: '/hr/dashboard' },
 *   { text: 'Applications', icon: <AssignmentIcon />, path: '/hr/applications' },
 * ];
 *
 * <DashboardLayout
 *   title="HR Panel"
 *   menuItems={menuItems}
 *   ariaLabel="hr navigation"
 * />
 * ```
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
	title,
	menuItems,
	children,
	ariaLabel = 'dashboard navigation',
	translate = false,
	canShowMenuItem,
}) => {
	const {user} = useUserAtom();
	const navigate = useNavigate();
	const {t} = useTranslation();
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	// Translate title if requested
	const displayTitle = translate ? t(title) : title;

	// Filter menu items based on permission check
	const visibleMenuItems = canShowMenuItem
		? menuItems.filter(canShowMenuItem)
		: menuItems;

	const drawer = (
		<Box>
			<Toolbar>
				<Typography variant="h6" noWrap component="div">
					{displayTitle}
				</Typography>
			</Toolbar>
			<Divider />
			<List>
				{visibleMenuItems.map((item) => {
					const itemText = translate ? t(item.text) : item.text;
					return (
						<ListItem key={item.text} disablePadding>
							<ListItemButton
								component={NavLink}
								to={item.path}
								end={item.path.endsWith('/dashboard') || item.path === '/admin'}
								sx={{
									'&.active': {
										bgcolor: 'primary.light',
										color: 'primary.contrastText',
										'& .MuiListItemIcon-root': {
											color: 'primary.contrastText',
										},
									},
								}}
								onClick={() => setMobileOpen(false)} // Close mobile drawer on item click
								aria-label={itemText}
							>
								<ListItemIcon>{item.icon}</ListItemIcon>
								<ListItemText primary={itemText} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
			<Divider />
			<List>
				<ListItem disablePadding>
					<ListItemButton
						component={NavLink}
						to="/profile"
						onClick={() => setMobileOpen(false)}
						aria-label={translate ? t('common.my_profile') : 'My Profile'}
					>
						<ListItemIcon>
							<PersonIcon />
						</ListItemIcon>
						<ListItemText primary={translate ? t('common.my_profile') : 'My Profile'} />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton
						onClick={() => {
							setMobileOpen(false);
							navigate('/careers');
						}}
						aria-label={translate ? t('common.back_to_careers') : 'Back to Careers'}
					>
						<ListItemIcon>
							<ArrowBackIcon />
						</ListItemIcon>
						<ListItemText primary={translate ? t('common.back_to_careers') : 'Back to Careers'} />
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);

	return (
		<Box sx={{minHeight: '100vh'}}>
			<Box sx={{display: 'flex'}}>
				<Box
					component="nav"
					sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
					aria-label={ariaLabel}
				>
					{/* Mobile drawer */}
					<Drawer
						variant="temporary"
						open={mobileOpen}
						onClose={handleDrawerToggle}
						ModalProps={{
							keepMounted: true,
						}}
						sx={{
							display: {xs: 'block', sm: 'none'},
							'& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
						}}
						aria-label={ariaLabel}
					>
						{drawer}
					</Drawer>

					{/* Desktop drawer */}
					<Drawer
						variant="permanent"
						sx={{
							display: {xs: 'none', sm: 'block'},
							'& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
						}}
						open
						aria-label={ariaLabel}
					>
						{drawer}
					</Drawer>
				</Box>

				{/* App bar */}
				<AppBar
					position="fixed"
					sx={{
						width: {sm: `calc(100% - ${drawerWidth}px)`},
						ml: {sm: `${drawerWidth}px`},
					}}
					component="div"
					role="banner"
				>
					<Toolbar>
						<IconButton
							color="inherit"
							aria-label={mobileOpen ? t('aria.close_drawer') : t('aria.open_drawer')}
							aria-expanded={mobileOpen}
							aria-controls="dashboard-drawer"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{mr: 2, display: {sm: 'none'}}}
						>
							<MenuIcon />
						</IconButton>
						<Typography
							variant="h6"
							noWrap
							component="div"
							sx={{
								flexGrow: 1,
								fontSize: {xs: '1rem', sm: '1.25rem'},
							}}
						>
							{displayTitle}
						</Typography>
						<LanguageSelector />
						<IconButton
							component={NavLink}
							to="/profile"
							sx={{p: 0.5}}
							aria-label={t('aria.user_profile')}
						>
							<UserAvatar name={user?.name} avatarUrl={user?.profilePicture} />
						</IconButton>
					</Toolbar>
				</AppBar>
			</Box>

			{/* Main content area */}
			<Box
				component="main"
				sx={{
					ml: {sm: `${drawerWidth}px`},
					p: {xs: 2, sm: 3},
				}}
				role="main"
				aria-label={t('aria.main_content')}
			>
				<Toolbar /> {/* Spacer for fixed AppBar */}
				{children || <Outlet />}
			</Box>
		</Box>
	);
};

export default DashboardLayout;
