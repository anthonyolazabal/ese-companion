import { apiClient } from "./client";
import type { DashboardResponse } from "./types";

export const dashboardApi = {
  get: () => apiClient.fetch<DashboardResponse>("/dashboard"),
};
