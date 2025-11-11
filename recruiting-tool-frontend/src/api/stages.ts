import axiosInstance from './axios';
import {Stage} from '../types/stage.types';

export const getStage = async (uid: string): Promise<Stage> => {
	const response = await axiosInstance.get(`/stages/${uid}`);
	return response.data;
};

export const createStage = async (data: Partial<Stage>): Promise<Stage> => {
	const response = await axiosInstance.post('/stages', data);
	return response.data;
};

export const bulkCreateStages = async (data: Partial<Stage>[]): Promise<Stage[]> => {
	const response = await axiosInstance.post('/stages/bulk', data);
	return response.data;
};

export const updateStage = async (data: Partial<Stage>, uid: string): Promise<Stage> => {
	const response = await axiosInstance.put(`/stages/${uid}`, data);
	return response.data;
};

export const deleteStage = async (uid: string): Promise<void> => {
	await axiosInstance.delete(`/stages/${uid}`);
};
