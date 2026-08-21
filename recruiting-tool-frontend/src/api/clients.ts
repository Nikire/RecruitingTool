import api from "./axios";
import {
  Client,
  CreateClientDto,
  UpdateClientDto,
} from "../types/client.types";
import { PaginationParams, PaginatedResponse } from "../types/pagination.types";
import { MessageResponse } from "../types/responses";

export interface ClientListParams extends PaginationParams {
  status?: string;
}

export const clientsApi = {
  /** Every client of the current company. Used by pickers and filter dropdowns. */
  getAll: async (): Promise<Client[]> => {
    const response = await api.get("/client");
    return response.data;
  },

  list: async (
    params: ClientListParams,
  ): Promise<PaginatedResponse<Client>> => {
    const response = await api.get("/client/list", { params });
    return response.data;
  },

  getOne: async (uid: string): Promise<Client> => {
    const response = await api.get(`/client/${uid}`);
    return response.data;
  },

  create: async (data: CreateClientDto): Promise<Client> => {
    const response = await api.post("/client", data);
    return response.data;
  },

  update: async (uid: string, data: UpdateClientDto): Promise<Client> => {
    const response = await api.put(`/client/${uid}`, data);
    return response.data;
  },

  remove: async (uid: string): Promise<MessageResponse> => {
    const response = await api.delete(`/client/${uid}`);
    return response.data;
  },
};
