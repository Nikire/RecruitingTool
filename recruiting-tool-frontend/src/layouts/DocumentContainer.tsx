import {Box} from '@mui/material';
import {Outlet} from 'react-router';

const DocumentContainer = () => (
	<Box
		sx={{
			minHeight: '100vh',
			display: 'flex',
			backgroundColor: '#fff',
		}}
	>
		<Outlet />
	</Box>
);

export default DocumentContainer;
