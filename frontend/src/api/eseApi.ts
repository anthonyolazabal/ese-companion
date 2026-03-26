import { apiClient } from "./client";
import type {
  EseUser,
  CreateEseUserRequest,
  UpdateEseUserRequest,
  EseRole,
  CreateEseRoleRequest,
  UpdateEseRoleRequest,
  MqttPermission,
  CreateMqttPermissionRequest,
  StringPermission,
  CreateStringPermissionRequest,
  ConnectionStats,
  PaginatedResponse,
} from "./types";

export const eseApi = {
  // Users
  listUsers: (
    connId: string,
    domain: string,
    page = 1,
    size = 20,
    search?: string,
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (search) params.set("search", search);
    return apiClient.fetch<PaginatedResponse<EseUser>>(
      `/ese/${connId}/${domain}/users?${params}`,
    );
  },

  getUser: (connId: string, domain: string, userId: number) =>
    apiClient.fetch<EseUser>(`/ese/${connId}/${domain}/users/${userId}`),

  createUser: (connId: string, domain: string, data: CreateEseUserRequest) =>
    apiClient.fetch<EseUser>(`/ese/${connId}/${domain}/users`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateUser: (
    connId: string,
    domain: string,
    userId: number,
    data: UpdateEseUserRequest,
  ) =>
    apiClient.fetch<EseUser>(`/ese/${connId}/${domain}/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (connId: string, domain: string, userId: number) =>
    apiClient.fetch<void>(`/ese/${connId}/${domain}/users/${userId}`, {
      method: "DELETE",
    }),

  // Roles
  listRoles: (connId: string, domain: string, page = 1, size = 20) =>
    apiClient.fetch<PaginatedResponse<EseRole>>(
      `/ese/${connId}/${domain}/roles?page=${page}&size=${size}`,
    ),

  createRole: (connId: string, domain: string, data: CreateEseRoleRequest) =>
    apiClient.fetch<EseRole>(`/ese/${connId}/${domain}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRole: (
    connId: string,
    domain: string,
    roleId: number,
    data: UpdateEseRoleRequest,
  ) =>
    apiClient.fetch<EseRole>(`/ese/${connId}/${domain}/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteRole: (connId: string, domain: string, roleId: number) =>
    apiClient.fetch<void>(`/ese/${connId}/${domain}/roles/${roleId}`, {
      method: "DELETE",
    }),

  // Permissions
  listPermissions: (connId: string, domain: string, page = 1, size = 20) =>
    apiClient.fetch<
      PaginatedResponse<MqttPermission | StringPermission>
    >(
      `/ese/${connId}/${domain}/permissions?page=${page}&size=${size}`,
    ),

  createMqttPermission: (connId: string, data: CreateMqttPermissionRequest) =>
    apiClient.fetch<MqttPermission>(`/ese/${connId}/mqtt/permissions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createStringPermission: (
    connId: string,
    domain: string,
    data: CreateStringPermissionRequest,
  ) =>
    apiClient.fetch<StringPermission>(
      `/ese/${connId}/${domain}/permissions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  deletePermission: (connId: string, domain: string, permId: number) =>
    apiClient.fetch<void>(
      `/ese/${connId}/${domain}/permissions/${permId}`,
      { method: "DELETE" },
    ),

  // Associations
  assignRoleToUser: (
    connId: string,
    domain: string,
    userId: number,
    roleId: number,
  ) =>
    apiClient.fetch<void>(
      `/ese/${connId}/${domain}/users/${userId}/roles/${roleId}`,
      { method: "POST" },
    ),

  revokeRoleFromUser: (
    connId: string,
    domain: string,
    userId: number,
    roleId: number,
  ) =>
    apiClient.fetch<void>(
      `/ese/${connId}/${domain}/users/${userId}/roles/${roleId}`,
      { method: "DELETE" },
    ),

  assignPermissionToUser: (
    connId: string,
    domain: string,
    userId: number,
    permId: number,
  ) =>
    apiClient.fetch<void>(
      `/ese/${connId}/${domain}/users/${userId}/permissions/${permId}`,
      { method: "POST" },
    ),

  revokePermissionFromUser: (
    connId: string,
    domain: string,
    userId: number,
    permId: number,
  ) =>
    apiClient.fetch<void>(
      `/ese/${connId}/${domain}/users/${userId}/permissions/${permId}`,
      { method: "DELETE" },
    ),

  assignPermissionToRole: (
    connId: string,
    domain: string,
    roleId: number,
    permId: number,
  ) =>
    apiClient.fetch<void>(
      `/ese/${connId}/${domain}/roles/${roleId}/permissions/${permId}`,
      { method: "POST" },
    ),

  revokePermissionFromRole: (
    connId: string,
    domain: string,
    roleId: number,
    permId: number,
  ) =>
    apiClient.fetch<void>(
      `/ese/${connId}/${domain}/roles/${roleId}/permissions/${permId}`,
      { method: "DELETE" },
    ),

  // Role permission IDs
  getRolePermissionIds: (connId: string, domain: string, roleId: number) =>
    apiClient.fetch<number[]>(
      `/ese/${connId}/${domain}/roles/${roleId}/permissions`,
    ),

  // Stats
  stats: (connId: string) =>
    apiClient.fetch<ConnectionStats>(`/ese/${connId}/stats`),
};
