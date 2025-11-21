import {Box, Button, Container, Typography} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

const Home: React.FC = () => {
	const navigate = useNavigate();

	return (
		<Container sx={{mt: 12}} maxWidth="lg">
			<Box
				sx={{
					py: 12,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
				}}
			>
				<WorkOutlineIcon sx={{fontSize: 80, color: 'primary.main', mb: 3}} />
				<Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
					Welcome to Recruiting Tool
				</Typography>
				<Typography
					variant="h5"
					color="text.secondary"
					sx={{mb: 4, maxWidth: 600}}
				>
					Streamline your hiring process and find the perfect candidates for
					your team
				</Typography>
				<Box sx={{display: 'flex', gap: 2}}>
					<Button
						variant="contained"
						size="large"
						onClick={() => navigate('/careers')}
					>
						Explore Open Positions
					</Button>
					<Button
						variant="outlined"
						size="large"
						onClick={() => navigate('/login')}
					>
						Login
					</Button>
				</Box>
			</Box>
		</Container>
	);
};

export default Home;
