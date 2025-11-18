import {HiringProcess} from './hiringProcess.types';
import {Stage} from './stage.types';
import {User} from './user.types';

export interface JobPosition {
	uid: string;
	title: string;
	status: JobPositionStatus;
	companyUid?: string;
	companyName?: string;
	hiringProcesses?: Array<HiringProcess>;
	stages: Array<Stage>;
	createdBy?: User;
}
const jobPositionStatus = {
	OPEN: 'OPEN',
	CLOSED: 'CLOSED',
	CANCELLED: 'CANCELLED',
};

export type JobPositionStatus =
	(typeof jobPositionStatus)[keyof typeof jobPositionStatus];
