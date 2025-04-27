import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineItem, {timelineItemClasses} from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import React from 'react';
import StepCircle from '../StepCircle/StepCircle';
import {Stage} from '../../../types/stage.types';
import {green} from '@mui/material/colors';
import StagesAccordion from '../StagesAccordion/StagesAccordion';

type StagesTimelineProps = {
	stages: Stage[];
};

const StagesTimeline: React.FC<StagesTimelineProps> = ({stages}) => {
	return (
		<Timeline
			sx={{
				[`& .${timelineItemClasses.root}:before`]: {
					flex: 0,
					padding: 0,
				},
			}}
		>
			{stages?.map((stage, i) =>
				i === stages.length - 1 ? (
					<TimelineItem key={'timeline-stage-' + i}>
						<TimelineSeparator>
							<StepCircle
								status={stage.status}
								disabled={stage.status === 'OPEN'}
								position={i + 1}
							/>
						</TimelineSeparator>
						<TimelineContent>
							<StagesAccordion
								stage={stage}
								disabled={stage.status !== 'CURRENT'}
							/>
						</TimelineContent>
					</TimelineItem>
				) : (
					<TimelineItem key={'timeline-stage-' + i}>
						<TimelineSeparator>
							<StepCircle
								status={stage.status}
								disabled={stage.status === 'OPEN'}
								position={i + 1}
							/>
							<TimelineConnector sx={{width: '10px', background: green.A400}} />
						</TimelineSeparator>
						<TimelineContent>
							<StagesAccordion
								stage={stage}
								disabled={stage.status !== 'CURRENT'}
							/>
						</TimelineContent>
					</TimelineItem>
				)
			)}
		</Timeline>
	);
};

export default StagesTimeline;
