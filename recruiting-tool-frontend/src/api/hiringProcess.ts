import {HiringProcess} from '../types/hiringProcess.types';
import {MessageResponse} from '../types/responses';
import {api} from './axios';

export function getHiringProcesses(
	uid?: string
): Promise<HiringProcess | HiringProcess[]> {
	return api
		.get('/hiring-process' + (uid ? '/' + uid : ''))
		.then((res) => res.data);
}

export function createHiringProcess(
	data: Partial<HiringProcess>
): Promise<HiringProcess> {
	return api.post('/hiring-process', data).then((res) => res.data);
}

export function updateHiringProcess(
	data: Partial<HiringProcess>,
	uid: string
): Promise<HiringProcess> {
	return api.put('/hiring-process/' + uid, data).then((res) => res.data);
}

export function deleteHiringProcess(uid: string): Promise<MessageResponse> {
	return api.delete('/hiring-process/' + uid).then((res) => res.data);
}
