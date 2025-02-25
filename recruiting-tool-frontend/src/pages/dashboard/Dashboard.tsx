import React from 'react';
import {Typography} from '@mui/material';
import {DashboardWrapper} from './Dashboard.styles';

const Dashboard: React.FC = () => {
	return (
		<DashboardWrapper>
			<Typography variant="h4" gutterBottom>
				Dashboard
			</Typography>
		</DashboardWrapper>
	);
};

export default Dashboard;
