import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, AuthError, ApiError } from "../client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  apiClient.setToken(null);
});

describe("ApiClient", () => {
  it("adds Authorization header when token is set", async () => {
    apiClient.setToken("my-token");
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "ok" }),
    });

    await apiClient.fetch("/test");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer my-token");
  });

  it("throws AuthError on 401 response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(apiClient.fetch("/test")).rejects.toThrow(AuthError);
  });

  it("throws ApiError on non-OK response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Internal Server Error" }),
    });

    await expect(apiClient.fetch("/test")).rejects.toThrow(ApiError);
    try {
      await apiClient.fetch("/test");
    } catch (e) {
      expect((e as ApiError).status).toBe(500);
    }
  });

  it("works without token (no auth header)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "ok" }),
    });

    await apiClient.fetch("/test");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBeUndefined();
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await apiClient.fetch("/test");
    expect(result).toBeUndefined();
  });
});
