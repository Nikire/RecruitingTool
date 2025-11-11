import {Candidate} from './candidate';
import {Stage} from './stage.types';

export interface HiringProcess {
	uid: string;
	title: string;
	status: HiringProcessStatus;
	stages: Array<Stage>;
	candidate?: Candidate;
	company?: {
		uid: string;
		name: string;
	};
	jobPosition?: {
		uid: string;
		title: string;
		createdBy?: {
			uid: string;
			name: string;
			email: string;
		};
	};
}

const hiringProcessStatus = {
	OPEN: 'OPEN',
	CLOSED: 'CLOSED',
	IN_PROGRESS: 'IN_PROGRESS',
	CANCELLED: 'CANCELLED',
	REJECTED: 'REJECTED',
};

export type HiringProcessStatus =
	(typeof hiringProcessStatus)[keyof typeof hiringProcessStatus];
