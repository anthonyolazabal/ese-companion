const API_BASE = "/api/v1";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options?.headers as Record<string, string>) || {}),
    };
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    if (response.status === 401) {
      throw new AuthError("Unauthorized");
    }
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new ApiError(response.status, error.message || "Request failed");
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
