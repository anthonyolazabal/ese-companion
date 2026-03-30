import { apiClient } from "./client";
import type {
  Connection,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  TestConnectionResponse,
  PaginatedResponse,
} from "./types";

export const connectionsApi = {
  list: (page = 1, size = 20) =>
    apiClient.fetch<PaginatedResponse<Connection>>(
      `/connections?page=${page}&size=${size}`,
    ),

  get: (id: string) => apiClient.fetch<Connection>(`/connections/${id}`),

  create: (data: CreateConnectionRequest) =>
    apiClient.fetch<Connection>("/connections", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateConnectionRequest) =>
    apiClient.fetch<Connection>(`/connections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient.fetch<void>(`/connections/${id}`, { method: "DELETE" }),

  test: (id: string) =>
    apiClient.fetch<TestConnectionResponse>(`/connections/${id}/test`, {
      method: "POST",
    }),

  health: (id: string) =>
    apiClient.fetch<{ healthStatus: string; lastHealthCheck: string | null }>(
      `/connections/${id}/health`,
    ),
};
