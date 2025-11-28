import {HiringProcess} from './hiringProcess.types';
import {Stage} from './stage.types';
import {User} from './user.types';
import {CustomQuestion} from './customQuestions';

export interface JobPosition {
	uid: string;
	title: string;
	status: JobPositionStatus;
	description?: string;
	companyUid?: string;
	companyName?: string;
	customQuestions?: Array<CustomQuestion>;
	hiringProcesses?: Array<HiringProcess>;
	stages: Array<Stage>;
	createdBy?: User;
	createdAt?: Date | string;
}

export interface PublicJobPosition {
	uid: string;
	title: string;
	description?: string;
	companyName?: string;
	companyDescription?: string;
	customQuestions?: Array<CustomQuestion>;
	stages?: Array<{
		uid: string;
		title: string;
		description?: string;
		type: string;
		estimatedTime?: number;
		position: number;
		status?: string;
	}>;
	createdAt: Date | string;
}

const jobPositionStatus = {
	OPEN: 'OPEN',
	CLOSED: 'CLOSED',
	CANCELLED: 'CANCELLED',
};

export type JobPositionStatus =
	(typeof jobPositionStatus)[keyof typeof jobPositionStatus];
