import api from './axios';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '../types/company.types';
import { PaginationParams, PaginatedResponse } from '../types/pagination.types';

export interface PublicCompany {
	uid: string;
	name: string;
	logoUrl?: string;
}

export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get('/company');
    return response.data;
  },

  list: async (params: PaginationParams): Promise<PaginatedResponse<Company>> => {
    const response = await api.get('/company/list', { params });
    return response.data;
  },

  getOne: async (uid: string): Promise<Company> => {
    const response = await api.get(`/company/${uid}`);
    return response.data;
  },

  create: async (data: CreateCompanyDto): Promise<Company> => {
    const response = await api.post('/company', data);
    return response.data;
  },

  update: async (uid: string, data: UpdateCompanyDto): Promise<Company> => {
    const response = await api.put(`/company/${uid}`, data);
    return response.data;
  },

  delete: async (uid: string): Promise<{message: string}> => {
    const response = await api.delete(`/company/${uid}`);
    return response.data;
  },

  getPublicWithJobs: async (): Promise<PublicCompany[]> => {
    const response = await api.get('/company/public/with-jobs');
    return response.data;
  },
};
