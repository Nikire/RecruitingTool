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

type NavbarDrawerProps = {
	isOpen?: boolean;
	onClose?: () => void;
	color?: PropTypes.Color;
	linkSx?: ListItemButtonBaseProps['sx'];
	handleMenuClick?: () => void;
};

const NavbarDrawer: React.FC<NavbarDrawerProps> = ({
	isOpen,
	onClose,
	color,
	linkSx,
	handleMenuClick,
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
				<ListItemButton component={NavLink} sx={linkSx} to="/">
					<ListItemText color="inherit" primary="Home" />
				</ListItemButton>
				<ListItemButton component={NavLink} sx={linkSx} to="/job-positions">
					<ListItemText color="inherit" primary="Job Positions" />
				</ListItemButton>
				<ListItemButton component={NavLink} sx={linkSx} to="/dashboard">
					<ListItemText color="inherit" primary="Dashboard" />
				</ListItemButton>
			</List>
		</Drawer>
	);
};

export default NavbarDrawer;
