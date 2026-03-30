import { apiClient } from "./client";
import type {
  CompanionUser,
  CreateCompanionUserRequest,
  UpdateCompanionUserRequest,
  PaginatedResponse,
} from "./types";

export const usersApi = {
  list: (page = 1, size = 20) =>
    apiClient.fetch<PaginatedResponse<CompanionUser>>(
      `/users?page=${page}&size=${size}`,
    ),

  get: (id: string) => apiClient.fetch<CompanionUser>(`/users/${id}`),

  create: (data: CreateCompanionUserRequest) =>
    apiClient.fetch<CompanionUser>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCompanionUserRequest) =>
    apiClient.fetch<CompanionUser>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient.fetch<void>(`/users/${id}`, { method: "DELETE" }),
};
