import axiosInstance from './axios';
import { Interview, CreateInterviewDto, UpdateInterviewDto } from '../types/interview.types';

export const createInterview = async (data: CreateInterviewDto): Promise<Interview> => {
  const response = await axiosInstance.post('/interview', data);
  return response.data;
};

export const getInterview = async (uid: string): Promise<Interview> => {
  const response = await axiosInstance.get(`/interview/${uid}`);
  return response.data;
};

export const getInterviewsByStage = async (stageUid: string): Promise<Interview[]> => {
  const response = await axiosInstance.get(`/interview/stage/${stageUid}`);
  return response.data;
};

export const updateInterview = async (uid: string, data: UpdateInterviewDto): Promise<Interview> => {
  const response = await axiosInstance.put(`/interview/${uid}`, data);
  return response.data;
};

export const cancelInterview = async (uid: string): Promise<Interview> => {
  const response = await axiosInstance.put(`/interview/${uid}/cancel`);
  return response.data;
};

export const deleteInterview = async (uid: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/interview/${uid}`);
  return response.data;
};
