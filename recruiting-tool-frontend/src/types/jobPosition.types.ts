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
	createdBy?: {
		uid: string;
		name: string;
		email: string;
	};
	createdAt?: Date | string;
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
export type WorkLocation = 'REMOTE' | 'HYBRID' | 'ON_SITE';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export interface PublicJobPosition {
	uid: string;
	title: string;
	description?: string;
	status: 'OPEN' | 'CLOSED' | 'CANCELLED';
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
	// New fields from Issue #164
	jobCategory?: string;
	jobType?: JobType;
	workLocation?: WorkLocation;
	experienceLevel?: ExperienceLevel;
	salaryMin?: number;
	salaryMax?: number;
	salaryCurrency?: string;
	createdAt: Date | string;
}

const jobPositionStatus = {
	OPEN: 'OPEN',
	CLOSED: 'CLOSED',
	CANCELLED: 'CANCELLED',
};

export type JobPositionStatus =
	(typeof jobPositionStatus)[keyof typeof jobPositionStatus];
