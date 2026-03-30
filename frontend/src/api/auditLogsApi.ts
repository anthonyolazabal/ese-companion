import { apiClient } from "./client";
import type {
  AuditLogEntry,
  AuditLogDetail,
  PaginatedResponse,
} from "./types";

export interface AuditLogFilters {
  page?: number;
  size?: number;
  domain?: string;
  action?: string;
  actorName?: string;
  connectionName?: string;
  resourceType?: string;
  from?: string;
  to?: string;
}

export const auditLogsApi = {
  list: (filters: AuditLogFilters = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(filters.page ?? 1));
    params.set("size", String(filters.size ?? 20));
    if (filters.domain) params.set("domain", filters.domain);
    if (filters.action) params.set("action", filters.action);
    if (filters.actorName) params.set("actorName", filters.actorName);
    if (filters.connectionName)
      params.set("connectionName", filters.connectionName);
    if (filters.resourceType)
      params.set("resourceType", filters.resourceType);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return apiClient.fetch<PaginatedResponse<AuditLogEntry>>(
      `/audit-logs?${params}`,
    );
  },

  get: (id: number) =>
    apiClient.fetch<AuditLogDetail>(`/audit-logs/${id}`),
};
