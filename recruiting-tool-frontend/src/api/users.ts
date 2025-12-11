import axiosInstance from "./axios";
import { User, CreateUserDto, UpdateUserDto } from "../types/user.types";
import { PaginationParams, PaginatedResponse } from "../types/pagination.types";

export const usersApi = {
  list: async (params: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await axiosInstance.get<PaginatedResponse<User>>(
      "/users/list",
      { params },
    );
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get<User[]>("/users");
    return response.data;
  },

  getOne: async (uid: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${uid}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await axiosInstance.post<User>("/users", data);
    return response.data;
  },

  update: async (uid: string, data: UpdateUserDto): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${uid}`, data);
    return response.data;
  },

  delete: async (uid: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(
      `/users/${uid}`,
    );
    return response.data;
  },

  deactivate: async (uid: string): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${uid}/deactivate`);
    return response.data;
  },

  reactivate: async (uid: string): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${uid}/reactivate`);
    return response.data;
  },

  getActivity: async (uid: string): Promise<any[]> => {
    const response = await axiosInstance.get<any[]>(`/users/${uid}/activity`);
    return response.data;
  },

  uploadResume: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<User>("/users/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getResumeDownloadUrl: async (): Promise<{
    downloadUrl: string;
    fileName: string;
  }> => {
    const response = await axiosInstance.get<{
      downloadUrl: string;
      fileName: string;
    }>("/users/resume/download");
    return response.data;
  },

  deleteResume: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(
      "/users/resume",
    );
    return response.data;
  },
};
