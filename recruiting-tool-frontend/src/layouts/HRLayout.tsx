import {useState} from 'react';
import {Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Toolbar, AppBar, IconButton, Divider} from '@mui/material';
import {Outlet, NavLink, useNavigate} from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import {useUserAtom} from '../hooks/api/state/useUserAtom';
import UserAvatar from '../components/user/UserAvatar';

const drawerWidth = 240;

/**
 * HRLayout - Layout component for HR panel with dedicated navigation
 * Accessible to HR, ADMIN, and SUPER_ADMIN roles
 */
const HRLayout: React.FC = () => {
	const {user} = useUserAtom();
	const navigate = useNavigate();
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const menuItems = [
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

	const drawer = (
		<Box>
			<Toolbar>
				<Typography variant="h6" noWrap component="div">
					HR Panel
				</Typography>
			</Toolbar>
			<Divider />
			<List>
				{menuItems.map((item) => (
					<ListItem key={item.text} disablePadding>
						<ListItemButton
							component={NavLink}
							to={item.path}
							end={item.path === '/hr/dashboard'}
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
				))}
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
					aria-label="hr navigation"
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
							Human Resources
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

export default HRLayout;
