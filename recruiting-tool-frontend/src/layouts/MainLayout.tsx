import {Container} from '@mui/material';
import {Outlet} from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';

const MainLayout = () => (
	<>
		<Navbar />
		<Container sx={{paddingTop: 2}} maxWidth="md">
			<Outlet />
		</Container>
	</>
);

export default MainLayout;
