import {Box, Button, Card, CardContent, Typography} from '@mui/material';
import {JobPosition} from '../../../types/jobPosition.types';
import StatusLabel from '../../StatusLabel';

type JobPositionCardProps = {
	jobPosition: JobPosition;
};

const JobPositionCard: React.FC<JobPositionCardProps> = ({jobPosition}) => {
	return (
		<Card
			variant="elevation"
			elevation={1}
			sx={{
				padding: 2,
				marginBottom: 2,
				display: 'flex',
				maxHeight: 75,
				height: 75,
			}}
		>
			<Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
				<Typography variant="h6">{jobPosition.title}</Typography>
				<StatusLabel status={jobPosition.status} />
				<Typography variant="body2" color="textSecondary">
					<b>{jobPosition.stages.length}</b> Stages
				</Typography>
			</Box>
			<Button
				variant="contained"
				color="primary"
				sx={{alignSelf: 'center', marginLeft: 'auto', fontWeight: 600}}
			>
				View Details
			</Button>
		</Card>
	);
};

export default JobPositionCard;
