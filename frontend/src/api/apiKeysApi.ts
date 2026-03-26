import { apiClient } from "./client";
import type {
  ApiKey,
  ApiKeyCreated,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  PaginatedResponse,
} from "./types";

export const apiKeysApi = {
  list: (page = 1, size = 20) =>
    apiClient.fetch<PaginatedResponse<ApiKey>>(
      `/api-keys?page=${page}&size=${size}`,
    ),

  get: (id: string) => apiClient.fetch<ApiKey>(`/api-keys/${id}`),

  create: (data: CreateApiKeyRequest) =>
    apiClient.fetch<ApiKeyCreated>("/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateApiKeyRequest) =>
    apiClient.fetch<ApiKey>(`/api-keys/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient.fetch<void>(`/api-keys/${id}`, { method: "DELETE" }),
};
