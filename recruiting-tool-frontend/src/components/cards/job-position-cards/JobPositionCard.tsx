import {Box, Button, Card, CardContent, Typography, ButtonGroup} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {JobPosition} from '../../../types/jobPosition.types';
import StatusLabel from '../../StatusLabel';

type JobPositionCardProps = {
	jobPosition: JobPosition;
	onManageStages?: () => void;
	canManageStages?: boolean;
};

const JobPositionCard: React.FC<JobPositionCardProps> = ({
	jobPosition,
	onManageStages,
	canManageStages = false,
}) => {
	const navigate = useNavigate();

	return (
		<Card
			variant="elevation"
			elevation={1}
			sx={{
				padding: 2,
				marginBottom: 2,
				display: 'flex',
				minHeight: 75,
			}}
		>
			<Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
				<Typography variant="h6">{jobPosition.title}</Typography>
				<StatusLabel status={jobPosition.status} />
				<Typography variant="body2" color="textSecondary">
					<b>{jobPosition.stages.length}</b> Stages
				</Typography>
			</Box>
			<ButtonGroup
				variant="contained"
				sx={{alignSelf: 'center', marginLeft: 'auto'}}
			>
				{canManageStages && (
					<Button
						color="secondary"
						onClick={onManageStages}
						sx={{fontWeight: 600}}
					>
						Manage Stages
					</Button>
				)}
				<Button
					color="primary"
					onClick={() => navigate(`/job-positions/${jobPosition.uid}`)}
					sx={{fontWeight: 600}}
				>
					View Details
				</Button>
			</ButtonGroup>
		</Card>
	);
};

export default JobPositionCard;
