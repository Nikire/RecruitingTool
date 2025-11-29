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
import {useTranslation} from 'react-i18next';
import NavbarDrawer from './NavbarDrawer';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import UserAvatar from '../user/UserAvatar';
import LanguageSelector from '../common/LanguageSelector';

const Navbar: React.FC = () => {
	const {t} = useTranslation();
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
	const {user: logedUser, isAuthenticated} = useUserAtom();

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
				isAuthenticated={isAuthenticated}
				user={logedUser}
			/>
			<Box sx={{flexGrow: 1}}>
				<AppBar position="fixed" color={color} component="nav" role="navigation" aria-label={t('aria.navigation')}>
					<Toolbar>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label={menuOpen ? t('aria.close_menu') : t('aria.open_menu')}
							aria-expanded={menuOpen}
							aria-controls="navbar-drawer"
							sx={{mr: 2}}
							onClick={handleMenuClick}
						>
							<MenuIcon />
						</IconButton>

						<Button
							color="inherit"
							component={NavLink}
							to="/"
							end
							sx={{
								...linkSx,
								textTransform: 'none',
								mr: {xs: 0, sm: 2},
								display: {xs: 'none', sm: 'inline-flex'},
							}}
							aria-label={t('navbar.home')}
						>
							{t('navbar.home')}
						</Button>

						<Typography
							color="inherit"
							variant="h6"
							sx={{
								fontSize: {xs: '1rem', sm: '1.25rem'},
							}}
						>
							{t('navbar.app_title')}
						</Typography>

						<Box sx={{flexGrow: 1}} />
						<LanguageSelector />
						{isAuthenticated ? (
							<Box sx={{display: 'flex', gap: 0.5, alignItems: 'center'}}>
								<Button
									color="inherit"
									component={NavLink}
									to="/logout"
									sx={{...linkSx, display: {xs: 'none', sm: 'inline-flex'}}}
									aria-label={t('navbar.logout')}
								>
									{t('navbar.logout')}
								</Button>
								<IconButton
									component={NavLink}
									to="/profile"
									sx={{p: 0.5}}
									aria-label={t('aria.user_profile')}
								>
									<UserAvatar
										name={logedUser?.name}
										avatarUrl={logedUser?.profilePicture}
									/>
								</IconButton>
							</Box>
						) : (
							<Box sx={{display: 'flex', gap: 0.5}}>
								<Button
									color="inherit"
									component={NavLink}
									to="/login"
									sx={{...linkSx, display: {xs: 'none', sm: 'inline-flex'}}}
									aria-label={t('navbar.login')}
								>
									{t('navbar.login')}
								</Button>
								<Button
									color="inherit"
									component={NavLink}
									to="/signup"
									sx={{...linkSx, display: {xs: 'none', sm: 'inline-flex'}}}
									aria-label={t('navbar.signup')}
								>
									{t('navbar.signup')}
								</Button>
							</Box>
						)}
					</Toolbar>
				</AppBar>
			</Box>
		</>
	);
};

export default Navbar;
