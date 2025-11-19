import {useState} from 'react';
import {Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Toolbar, AppBar, IconButton, Divider} from '@mui/material';
import {Outlet, NavLink, useNavigate} from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {useUserAtom} from '../hooks/api/state/useUserAtom';
import {hasRole, isAdmin} from '../utils/permissions';
import {UserRoles} from '../types/user.types';
import UserAvatar from '../components/user/UserAvatar';

const drawerWidth = 240;

const AdminLayout: React.FC = () => {
	const {user} = useUserAtom();
	const navigate = useNavigate();
	const [mobileOpen, setMobileOpen] = useState(false);
	const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);
	const isAdminUser = isAdmin(user);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const menuItems = [
		{
			text: 'Admin Dashboard',
			icon: <DashboardIcon />,
			path: '/admin',
			requiresSuperAdmin: false,
			requiresAdmin: false,
		},
		{
			text: 'Applications',
			icon: <AssignmentIcon />,
			path: '/admin/applications',
			requiresSuperAdmin: false,
			requiresAdmin: true,
		},
		{
			text: 'Candidates',
			icon: <GroupIcon />,
			path: '/admin/candidates',
			requiresSuperAdmin: false,
			requiresAdmin: true,
		},
		{
			text: 'Companies',
			icon: <BusinessIcon />,
			path: '/admin/companies',
			requiresSuperAdmin: true,
			requiresAdmin: false,
		},
		{
			text: 'Users',
			icon: <PeopleIcon />,
			path: '/admin/users',
			requiresSuperAdmin: true,
			requiresAdmin: false,
		},
	];

	const drawer = (
		<Box>
			<Toolbar>
				<Typography variant="h6" noWrap component="div">
					Admin Panel
				</Typography>
			</Toolbar>
			<Divider />
			<List>
				{menuItems.map((item) => {
					if (item.requiresSuperAdmin && !isSuperAdmin) {
						return null;
					}
					if (item.requiresAdmin && !isAdminUser) {
						return null;
					}

					return (
						<ListItem key={item.text} disablePadding>
							<ListItemButton
								component={NavLink}
								to={item.path}
								end={item.path === '/admin'}
								sx={{
									'&.active': {
										bgcolor: 'primary.light',
										color: 'primary.contrastText',
										'& .MuiListItemIcon-root': {
											color: 'primary.contrastText',
										},
									},
								}}
							>
								<ListItemIcon>{item.icon}</ListItemIcon>
								<ListItemText primary={item.text} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
			<Divider />
			<List>
				<ListItem disablePadding>
					<ListItemButton component={NavLink} to="/profile">
						<ListItemIcon>
							<PersonIcon />
						</ListItemIcon>
						<ListItemText primary="My Profile" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton onClick={() => navigate('/dashboard')}>
						<ListItemIcon>
							<ArrowBackIcon />
						</ListItemIcon>
						<ListItemText primary="Back to Dashboard" />
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
					aria-label="admin navigation"
				>
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
					>
						{drawer}
					</Drawer>
					<Drawer
						variant="permanent"
						sx={{
							display: {xs: 'none', sm: 'block'},
							'& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
						}}
						open
					>
						{drawer}
					</Drawer>
				</Box>

				<AppBar
					position="fixed"
					sx={{
						width: {sm: `calc(100% - ${drawerWidth}px)`},
						ml: {sm: `${drawerWidth}px`},
					}}
				>
					<Toolbar>
						<IconButton
							color="inherit"
							aria-label="open drawer"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{mr: 2, display: {sm: 'none'}}}
						>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" noWrap component="div" sx={{flexGrow: 1}}>
							Administration
						</Typography>
						<IconButton component={NavLink} to="/profile" sx={{p: 0.5}}>
							<UserAvatar name={user?.name} avatarUrl={user?.profilePicture} />
						</IconButton>
					</Toolbar>
				</AppBar>
			</Box>

			<Box
				component="main"
				sx={{
					ml: {sm: `${drawerWidth}px`},
					p: 3,
				}}
			>
				<Outlet />
			</Box>
		</Box>
	);
};

export default AdminLayout;
