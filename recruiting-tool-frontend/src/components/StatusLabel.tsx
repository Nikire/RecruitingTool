import {Chip, ChipProps} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {JobPositionStatus} from '../types/jobPosition.types';
import {StageStatus} from '../types/stage.types';
import {HiringProcessStatus} from '../types/hiringProcess.types';

type StatusLabelProps = {
	status: JobPositionStatus | StageStatus | HiringProcessStatus;
};

const StatusLabel: React.FC<StatusLabelProps> = ({status}) => {
	const {t} = useTranslation();
	let color: ChipProps['color'] = 'default';

	switch (status) {
		case 'OPEN':
			color = 'info';
			break;
		case 'CURRENT':
			color = 'info';
			break;
		case 'CANCELLED':
			color = 'error';
			break;
		case 'DONE':
			color = 'success';
			break;
		case 'CLOSED':
			color = 'error';
			break;
		case 'IN_PROGRESS':
			color = 'secondary';
			break;
		case 'REJECTED':
			color = 'error';
			break;
		default:
			color = 'primary';
			break;
	}

	return <Chip label={t(`status.${status.toLowerCase()}`)} color={color} sx={{fontWeight: 600}} />;
};

export default StatusLabel;
