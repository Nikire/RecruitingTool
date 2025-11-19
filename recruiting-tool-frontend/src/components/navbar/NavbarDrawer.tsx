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
	return (
		<Drawer anchor="left" color={color} open={isOpen} onClose={onClose}>
			<List color="inherit" sx={{minWidth: 200, padding: 0, margin: 0}}>
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
				>
					<ChevronLeftIcon sx={{color: `${color}.contrastText`}} />
				</ListItemButton>
				<ListItemButton component={NavLink} sx={linkSx} to="/" end>
					<ListItemText color="inherit" primary="Home" />
				</ListItemButton>
				<ListItemButton component={NavLink} sx={linkSx} to="/careers">
					<ListItemText color="inherit" primary="Careers" />
				</ListItemButton>
				{isAuthenticated && (
					<ListItemButton component={NavLink} sx={linkSx} to="/dashboard">
						<ListItemText color="inherit" primary="Dashboard" />
					</ListItemButton>
				)}
				{isAuthenticated && isAdmin(user ?? null) && (
					<ListItemButton component={NavLink} sx={linkSx} to="/admin">
						<ListItemText color="inherit" primary="Admin Panel" />
					</ListItemButton>
				)}
			</List>
		</Drawer>
	);
};

export default NavbarDrawer;
