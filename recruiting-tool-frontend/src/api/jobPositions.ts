import {JobPosition} from '../types/jobPosition.types';
import {MessageResponse} from '../types/responses';
import {api} from './axios';

// 🛠 Corrección del get
export function getJobPositions(
	uid?: string
): Promise<JobPosition | JobPosition[]> {
	return api.get('/job-position' + (uid ? '/' + uid : ''));
}

export function createJobPosition(
	data: Partial<JobPosition>
): Promise<JobPosition> {
	return api.post('/job-position', data);
}

export function updateJobPosition(
	data: Partial<JobPosition>,
	uid: string
): Promise<JobPosition> {
	return api.put('/job-position/' + uid, data);
}

export function deleteJobPosition(uid: string): Promise<MessageResponse> {
	return api.delete('/job-position/' + uid);
}
