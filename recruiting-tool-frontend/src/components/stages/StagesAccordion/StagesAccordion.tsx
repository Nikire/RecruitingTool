import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
} from '@mui/material';
import React from 'react';
import {ArrowDropDown, LockOpen, CheckCircle, Lock} from '@mui/icons-material';
import {Stage} from '../../../types/stage.types';
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
			square={false}
		>
			<AccordionSummary expandIcon={<ArrowDropDown />}>
				<AccordionHeaderWrapper>
					{stage.status === 'CURRENT' ? (
						<LockOpen sx={{color: '#000'}} />
					) : stage.status === 'DONE' ? (
						<CheckCircle color="primary" />
					) : (
						<Lock color="disabled" />
					)}
					<Typography variant="h6">{stage.title}</Typography>
				</AccordionHeaderWrapper>
			</AccordionSummary>
			<AccordionDetails>
				<Typography variant="body2">{stage.description}</Typography>
			</AccordionDetails>
		</Accordion>
	);
};

export default StagesAccordion;
