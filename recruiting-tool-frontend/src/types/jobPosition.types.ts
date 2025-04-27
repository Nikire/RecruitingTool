import {HiringProcess} from './hiringProcess.types';
import {Stage} from './stage.types';

export type JobPosition = {
	id?: number;
	uid: string;
	title: string;
	status: JobPositionStatus;
	hiringProcesses: Array<HiringProcess>;
	stages: Array<Stage>;
};
const jobPositionStatus = {
	OPEN: 'OPEN',
	CLOSED: 'CLOSED',
	CANCELLED: 'CANCELLED',
};

export type JobPositionStatus =
	(typeof jobPositionStatus)[keyof typeof jobPositionStatus];
