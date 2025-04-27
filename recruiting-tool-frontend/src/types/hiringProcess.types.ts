import {Candidate} from './candidate';
import {Stage} from './stage.types';

export type HiringProcess = {
	uid: string;
	title: string;
	status: HiringProcessStatus;
	stages: Array<Stage>;
	candidate?: Candidate;
};

const hiringProcessStatus = {
	OPEN: 'OPEN',
	CLOSED: 'CLOSED',
	IN_PROGRESS: 'IN_PROGRESS',
	CANCELLED: 'CANCELLED',
	REJECTED: 'REJECTED',
};

export type HiringProcessStatus =
	(typeof hiringProcessStatus)[keyof typeof hiringProcessStatus];
