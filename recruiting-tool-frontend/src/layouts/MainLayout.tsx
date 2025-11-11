import {Container} from '@mui/material';
import {Outlet, useLocation} from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';

const MainLayout = () => {
	const location = useLocation();

	// Use wider container for pages with tables
	const widePages = ['/dashboard', '/companies', '/candidates'];
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
