import axiosInstance from './axios';
import {Candidate} from '../types/candidate';
import {PaginationParams, PaginatedResponse} from '../types/pagination.types';

export const getCandidates = async (): Promise<Candidate[]> => {
	const response = await axiosInstance.get('/candidate');
	return response.data;
};

export const listCandidates = async (params: PaginationParams): Promise<PaginatedResponse<Candidate>> => {
	const response = await axiosInstance.get('/candidate/list', {params});
	return response.data;
};

export const getCandidate = async (uid: string): Promise<Candidate> => {
	const response = await axiosInstance.get(`/candidate/${uid}`);
	return response.data;
};

export const createCandidate = async (data: Partial<Candidate>): Promise<Candidate> => {
	const response = await axiosInstance.post('/candidate', data);
	return response.data;
};

export const updateCandidate = async (data: Partial<Candidate>, uid: string): Promise<Candidate> => {
	const response = await axiosInstance.put(`/candidate/${uid}`, data);
	return response.data;
};

export const deleteCandidate = async (uid: string): Promise<void> => {
	await axiosInstance.delete(`/candidate/${uid}`);
};
