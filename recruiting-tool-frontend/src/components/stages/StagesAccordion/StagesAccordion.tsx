import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
} from '@mui/material';
import React from 'react';
import {ArrowDropDown, LockOpen, CheckCircle, Lock} from '@mui/icons-material';
import {Stage} from '../../../types/stage.types';
import {green, grey} from '@mui/material/colors';
import {AccordionHeaderWrapper} from './StagesAccordion.styles';

type StagesAccordionProps = {
	stage: Stage;
	disabled?: boolean;
};

const StagesAccordion: React.FC<StagesAccordionProps> = ({stage, disabled}) => {
	return (
		<Accordion
			elevation={0}
			defaultExpanded={stage.status === 'CURRENT'}
			disabled={disabled}
			sx={
				disabled
					? {
							backgroundColor: grey[200] + ' !important',
							color: grey[500] + ' !important',
							borderRadius: '20px !important',
					  }
					: {backgroundColor: green.A100, borderRadius: '20px !important'}
			}
		>
			<AccordionSummary expandIcon={<ArrowDropDown />}>
				<AccordionHeaderWrapper>
					{stage.status === 'CURRENT' ? (
						<LockOpen sx={{color: '#000'}} />
					) : stage.status === 'DONE' ? (
						<CheckCircle sx={{color: green.A400}} />
					) : (
						<Lock sx={{color: grey[500]}} />
					)}
					<Typography sx={{fontWeight: 600}} variant="h6">
						{stage.title}
					</Typography>
				</AccordionHeaderWrapper>
			</AccordionSummary>
			<AccordionDetails>
				<Typography variant="body2">{stage.description}</Typography>
			</AccordionDetails>
		</Accordion>
	);
};

export default StagesAccordion;
