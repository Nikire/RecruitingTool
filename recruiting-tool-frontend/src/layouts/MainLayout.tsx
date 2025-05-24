import {Container} from '@mui/material';
import {Outlet} from 'react-router-dom';

const MainLayout = () => (
	<Container maxWidth="md">
		<Outlet />
	</Container>
);

export default MainLayout;
