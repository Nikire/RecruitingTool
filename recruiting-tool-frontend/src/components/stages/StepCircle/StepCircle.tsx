import {green, grey} from '@mui/material/colors';
import {StepCircleWrapper} from './StepCircle.styles';
import {StageStatus} from '../../../types/stage.types';
import {Typography} from '@mui/material';

type StepCircleProps = {
	position: number;
	status?: StageStatus;
	disabled?: boolean;
};

const StepCircle: React.FC<StepCircleProps> = ({
	position,
	status,
	disabled,
}) => {
	return (
		<StepCircleWrapper
			style={
				disabled
					? {backgroundColor: grey[200]}
					: {
							backgroundColor: status == 'CURRENT' ? '#000' : green.A100,
					  }
			}
		>
			<Typography
				sx={
					disabled
						? {color: grey[500]}
						: {
								color: status == 'CURRENT' ? green.A400 : '#000',
						  }
				}
			>
				{position}
			</Typography>
		</StepCircleWrapper>
	);
};

export default StepCircle;
