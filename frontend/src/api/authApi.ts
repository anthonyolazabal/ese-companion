import { apiClient } from "./client";
import type { LoginResponse, TokenResponse } from "./types";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return apiClient.fetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function refresh(
  refreshToken: string,
): Promise<TokenResponse> {
  return apiClient.fetch<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logout(): Promise<void> {
  return apiClient.fetch<void>("/auth/logout", {
    method: "POST",
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return apiClient.fetch<void>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
