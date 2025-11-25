import {Box, Button, Card, Typography, ButtonGroup} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
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
	const {t} = useTranslation();
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
					<b>{jobPosition.stages.length}</b> {t('job_positions.stages_count', {count: jobPosition.stages.length})}
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
						{t('job_positions.manage_stages')}
					</Button>
				)}
				<Button
					color="primary"
					onClick={() => navigate(`/careers/${jobPosition.uid}`)}
					sx={{fontWeight: 600}}
				>
					{t('job_positions.view_details')}
				</Button>
			</ButtonGroup>
		</Card>
	);
};

export default JobPositionCard;
