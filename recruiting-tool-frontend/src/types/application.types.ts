export enum ApplicationStatus {
	PENDING = 'PENDING',
	REVIEWED = 'REVIEWED',
	REJECTED = 'REJECTED',
	ACCEPTED = 'ACCEPTED',
}

export interface Application {
	uid: string;
	jobPositionUid: string;
	jobPositionTitle: string;
	companyName?: string;
	applicantName: string;
	applicantEmail: string;
	applicantPhone: string;
	resumeFileUid?: string;
	resumeFileName?: string;
	coverLetter?: string;
	customAnswers?: Record<string, any>;
	status: ApplicationStatus;
	appliedAt: Date;
	reviewedAt?: Date;
	reviewedByUid?: string;
	reviewedByName?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateApplicationDto {
	jobPositionUid: string;
	applicantName: string;
	applicantEmail: string;
	applicantPhone: string;
	resumeFileUid?: string;
	coverLetter?: string;
	customAnswers?: Record<string, any>;
}

export interface UpdateApplicationDto {
	status?: ApplicationStatus;
	notes?: string;
}

export interface ApplicationFilterDto {
	jobPositionUid?: string;
	status?: ApplicationStatus;
	page?: number;
	limit?: number;
}

export interface PublicJobPosition {
	uid: string;
	title: string;
	description?: string;
	companyName: string;
}
