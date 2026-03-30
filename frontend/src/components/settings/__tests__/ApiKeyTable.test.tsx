import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import type { ApiKey, PaginatedResponse } from "../../../api/types";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../../../api/apiKeysApi", () => ({
  apiKeysApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../ApiKeyCreateDrawer", () => ({
  ApiKeyCreateDrawer: () => null,
}));

import { apiKeysApi } from "../../../api/apiKeysApi";
import { ApiKeyTable } from "../ApiKeyTable";

const mockKeys: ApiKey[] = [
  {
    id: "key-1",
    name: "Production Key",
    keyPrefix: "ese_abc1",
    scopes: ["ese:read", "ese:write"],
    expiresAt: "2027-01-01T00:00:00Z",
    lastUsedAt: null,
    createdAt: "2025-01-01T00:00:00Z",
    userId: "user-1",
  },
  {
    id: "key-2",
    name: "Admin Key",
    keyPrefix: "ese_xyz9",
    scopes: ["ese:admin"],
    expiresAt: "2027-06-01T00:00:00Z",
    lastUsedAt: "2025-06-15T00:00:00Z",
    createdAt: "2025-03-01T00:00:00Z",
    userId: "user-1",
  },
];

describe("ApiKeyTable", () => {
  it("renders key list with prefixes", async () => {
    const response: PaginatedResponse<ApiKey> = {
      items: mockKeys,
      page: 1,
      size: 20,
      total: 2,
    };
    vi.mocked(apiKeysApi.list).mockResolvedValue(response);

    renderWithProviders(<ApiKeyTable />);

    expect(
      await screen.findByText("Production Key"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin Key")).toBeInTheDocument();
    expect(screen.getByText("ese_abc1...")).toBeInTheDocument();
    expect(screen.getByText("ese_xyz9...")).toBeInTheDocument();
  });

  it("shows scope badges", async () => {
    const response: PaginatedResponse<ApiKey> = {
      items: mockKeys,
      page: 1,
      size: 20,
      total: 2,
    };
    vi.mocked(apiKeysApi.list).mockResolvedValue(response);

    renderWithProviders(<ApiKeyTable />);

    expect(await screen.findByText("ese:read")).toBeInTheDocument();
    expect(screen.getByText("ese:write")).toBeInTheDocument();
    expect(screen.getByText("ese:admin")).toBeInTheDocument();
  });

  it("shows create button", async () => {
    vi.mocked(apiKeysApi.list).mockResolvedValue({
      items: [],
      page: 1,
      size: 20,
      total: 0,
    });

    renderWithProviders(<ApiKeyTable />);

    expect(screen.getByText("Create API Key")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    vi.mocked(apiKeysApi.list).mockReturnValue(new Promise(() => {})); // never resolves

    renderWithProviders(<ApiKeyTable />);

    expect(screen.getByText("Loading API keys...")).toBeInTheDocument();
  });
});
