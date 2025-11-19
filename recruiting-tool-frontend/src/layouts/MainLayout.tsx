import {Container} from '@mui/material';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import Navbar from '../components/navbar/Navbar';
import {useAuthMe} from '../hooks/api/useAuth';

const MainLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();

	// Validate user session on every page
	const {isError} = useAuthMe();

	// Redirect to login if session is invalid or user is not authenticated
	useEffect(() => {
		const token = localStorage.getItem('authToken');

		// If there's a token but the auth query failed (401, 403, etc.), session is invalid
		if (token && isError) {
			localStorage.removeItem('authToken');
			navigate('/login', {replace: true});
		}
	}, [isError, navigate]);

	// Use wider container for pages with tables
	const widePages = ['/dashboard', '/companies', '/candidates', '/careers'];
	const isWidePage = widePages.includes(location.pathname);
	const maxWidth = isWidePage ? 'xl' : 'md';

	return (
		<>
			<Navbar />
			<Container sx={{paddingTop: 2}} maxWidth={maxWidth}>
				<Outlet />
			</Container>
		</>
	);
};

export default MainLayout;
