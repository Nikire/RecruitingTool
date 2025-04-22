export type Stage = {
	uid: string;
	title: string;
	type: StageType;
	description: string;
	position?: number;
	status?: StageStatus;
};

const stageStatus = {
	OPEN: 'OPEN',
	CURRENT: 'CURRENT',
	CANCELLED: 'CANCELLED',
	DONE: 'DONE',
};

export type StageStatus = (typeof stageStatus)[keyof typeof stageStatus];

const stageType = {
	INTERVIEW: 'INTERVIEW',
	TECHNICAL_INTERVIEW: 'TECHNICAL_INTERVIEW',
	FINAL_INTERVIEW: 'FINAL_INTERVIEW',
	OFFER: 'OFFER',
};

export type StageType = (typeof stageType)[keyof typeof stageType];
