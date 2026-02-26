import api from "./axios";
import {
  Company,
  CompanyProfile,
  CompanyUser,
  CreateCompanyDto,
  ForceJoinDto,
  ForceJoinResponse,
  TransferOwnershipDto,
  TransferOwnershipResponse,
  UpdateCompanyDto,
  UpdateCompanyProfileDto,
} from "../types/company.types";
import { PaginationParams, PaginatedResponse } from "../types/pagination.types";

export interface PublicCompany {
  uid: string;
  name: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  description?: string;
}

export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get("/company");
    return response.data;
  },

  list: async (
    params: PaginationParams,
  ): Promise<PaginatedResponse<Company>> => {
    const response = await api.get("/company/list", { params });
    return response.data;
  },

  getOne: async (uid: string): Promise<Company> => {
    const response = await api.get(`/company/${uid}`);
    return response.data;
  },

  create: async (data: CreateCompanyDto): Promise<Company> => {
    const response = await api.post("/company", data);
    return response.data;
  },

  update: async (uid: string, data: UpdateCompanyDto): Promise<Company> => {
    const response = await api.put(`/company/${uid}`, data);
    return response.data;
  },

  delete: async (uid: string): Promise<{ message: string }> => {
    const response = await api.delete(`/company/${uid}`);
    return response.data;
  },

  getPublicWithJobs: async (): Promise<PublicCompany[]> => {
    const response = await api.get("/company/public/with-jobs");
    return response.data;
  },

  getCompanyUsers: async (
    uid: string,
    params: PaginationParams,
  ): Promise<PaginatedResponse<CompanyUser>> => {
    const response = await api.get(`/company/${uid}/users`, { params });
    return response.data;
  },

  transferOwnership: async (
    uid: string,
    data: TransferOwnershipDto,
  ): Promise<TransferOwnershipResponse> => {
    const response = await api.post(`/company/${uid}/transfer-ownership`, data);
    return response.data;
  },

  forceJoinUser: async (
    uid: string,
    data: ForceJoinDto,
  ): Promise<ForceJoinResponse> => {
    const response = await api.post(`/company/${uid}/force-join`, data);
    return response.data;
  },

  getMyProfile: async (): Promise<CompanyProfile> => {
    const response = await api.get("/company/profile");
    return response.data;
  },

  updateMyProfile: async (
    data: UpdateCompanyProfileDto,
  ): Promise<CompanyProfile> => {
    const response = await api.patch("/company/profile", data);
    return response.data;
  },

  uploadLogo: async (file: File): Promise<CompanyProfile> => {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await api.post("/company/profile/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
