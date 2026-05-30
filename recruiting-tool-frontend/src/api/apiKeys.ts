import api from "./axios";

export interface ApiKey {
  uid: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKey {
  rawKey: string;
}

export interface CreateApiKeyDto {
  name: string;
  expiresAt?: string;
  scopes?: string[];
}

export interface UpdateApiKeyDto {
  name?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export const apiKeysApi = {
  list: async (): Promise<ApiKey[]> => {
    const response = await api.get("/api-keys");
    return response.data;
  },

  create: async (data: CreateApiKeyDto): Promise<ApiKeyCreated> => {
    const response = await api.post("/api-keys", data);
    return response.data;
  },

  update: async (uid: string, data: UpdateApiKeyDto): Promise<ApiKey> => {
    const response = await api.patch(`/api-keys/${uid}`, data);
    return response.data;
  },

  revoke: async (uid: string): Promise<void> => {
    await api.delete(`/api-keys/${uid}`);
  },
};
