import {Menu as MenuIcon} from '@mui/icons-material';
import {
	AppBar,
	Box,
	Button,
	IconButton,
	PropTypes,
	Toolbar,
	Typography,
} from '@mui/material';
import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import NavbarDrawer from './NavbarDrawer';

const Navbar: React.FC = () => {
	const color: PropTypes.Color = 'secondary';

	const linkSx = {
		textTransform: 'none',
		'&.active': {
			bgcolor: `${color}.dark`,
			color: `${color}.contrastText`,
			'&:hover': {bgcolor: `${color}.main`},
			'&.Mui-focusVisible': {bgcolor: `${color}.main`},
			'&.Mui-selected, &.Mui-selected:hover': {bgcolor: `${color}.main`},
		},
	};

	const [menuOpen, setMenuOpen] = useState(false);

	const handleMenuClick = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<>
			<NavbarDrawer
				isOpen={menuOpen}
				color={color}
				linkSx={linkSx}
				onClose={handleMenuClick}
				handleMenuClick={handleMenuClick}
			/>
			<Box sx={{flexGrow: 1}}>
				<AppBar position="static" color={color}>
					<Toolbar>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label="menu"
							sx={{mr: 2}}
							onClick={handleMenuClick}
						>
							<MenuIcon />
						</IconButton>

						<Typography color="inherit" variant="h6" sx={{mr: 2}}>
							Recruiting Tool
						</Typography>

						<Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
							<Button
								color="inherit"
								component={NavLink}
								to="/"
								end
								sx={linkSx}
							>
								Home
							</Button>
							<Button
								color="inherit"
								component={NavLink}
								to="/job-positions"
								sx={linkSx}
							>
								Job Positions
							</Button>
							<Button
								color="inherit"
								component={NavLink}
								to="/dashboard"
								sx={linkSx}
							>
								Dashboard
							</Button>
						</Box>

						<Box sx={{flexGrow: 1}} />
						<Box sx={{display: 'flex', gap: 0.5}}>
							<Button
								color="inherit"
								component={NavLink}
								to="/login"
								sx={linkSx}
							>
								Login
							</Button>
							<Button
								color="inherit"
								component={NavLink}
								to="/signup"
								sx={linkSx}
							>
								Signup
							</Button>
						</Box>
					</Toolbar>
				</AppBar>
			</Box>
		</>
	);
};

export default Navbar;
