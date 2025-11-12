import axiosInstance from './axios';
import {User, CreateUserDto, UpdateUserDto} from '../types/user.types';
import {PaginationParams, PaginatedResponse} from '../types/pagination.types';

export const usersApi = {
	list: async (params: PaginationParams): Promise<PaginatedResponse<User>> => {
		const response = await axiosInstance.get<PaginatedResponse<User>>('/users/list', {params});
		return response.data;
	},

	getAll: async (): Promise<User[]> => {
		const response = await axiosInstance.get<User[]>('/users');
		return response.data;
	},

	getOne: async (uid: string): Promise<User> => {
		const response = await axiosInstance.get<User>(`/users/${uid}`);
		return response.data;
	},

	create: async (data: CreateUserDto): Promise<User> => {
		const response = await axiosInstance.post<User>('/users', data);
		return response.data;
	},

	update: async (uid: string, data: UpdateUserDto): Promise<User> => {
		const response = await axiosInstance.put<User>(`/users/${uid}`, data);
		return response.data;
	},

	delete: async (uid: string): Promise<{message: string}> => {
		const response = await axiosInstance.delete<{message: string}>(`/users/${uid}`);
		return response.data;
	},
};
