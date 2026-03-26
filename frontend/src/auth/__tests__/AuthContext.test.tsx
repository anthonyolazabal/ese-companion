import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, act, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import { AuthProvider, AuthContext } from "../AuthContext";
import { useContext } from "react";
import type { AuthContextValue } from "../AuthContext";

vi.mock("../../api/authApi", () => ({
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("../../api/client", () => ({
  apiClient: {
    setToken: vi.fn(),
  },
}));

import * as authApi from "../../api/authApi";

const TestConsumer = ({
  onContext,
}: {
  onContext: (ctx: AuthContextValue) => void;
}) => {
  const ctx = useContext(AuthContext);
  if (ctx) onContext(ctx);
  return (
    <div>
      <span data-testid="authenticated">
        {ctx?.isAuthenticated ? "yes" : "no"}
      </span>
      <span data-testid="admin">{ctx?.isAdmin ? "yes" : "no"}</span>
      <span data-testid="username">{ctx?.user?.username ?? "none"}</span>
    </div>
  );
};

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});

describe("AuthProvider", () => {
  it("is initially not authenticated", async () => {
    renderWithProviders(
      <AuthProvider>
        <TestConsumer onContext={() => {}} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("no");
    });
  });

  it("after login, user is available and isAuthenticated is true", async () => {
    const mockUser = {
      id: "1",
      username: "admin",
      email: "admin@test.com",
      role: "admin",
    };

    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: mockUser,
    });

    let contextValue: AuthContextValue | null = null;

    renderWithProviders(
      <AuthProvider>
        <TestConsumer
          onContext={(ctx) => {
            contextValue = ctx;
          }}
        />
      </AuthProvider>,
    );

    await act(async () => {
      await contextValue!.login("admin", "password");
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("yes");
    expect(screen.getByTestId("username").textContent).toBe("admin");
  });

  it("after logout, user is null", async () => {
    const mockUser = {
      id: "1",
      username: "admin",
      email: "admin@test.com",
      role: "admin",
    };

    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: mockUser,
    });
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    let contextValue: AuthContextValue | null = null;

    renderWithProviders(
      <AuthProvider>
        <TestConsumer
          onContext={(ctx) => {
            contextValue = ctx;
          }}
        />
      </AuthProvider>,
    );

    await act(async () => {
      await contextValue!.login("admin", "password");
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("yes");

    await act(async () => {
      await contextValue!.logout();
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("no");
  });

  it("isAdmin returns true for admin role", async () => {
    const mockUser = {
      id: "1",
      username: "admin",
      email: "admin@test.com",
      role: "admin",
    };

    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: mockUser,
    });

    let contextValue: AuthContextValue | null = null;

    renderWithProviders(
      <AuthProvider>
        <TestConsumer
          onContext={(ctx) => {
            contextValue = ctx;
          }}
        />
      </AuthProvider>,
    );

    await act(async () => {
      await contextValue!.login("admin", "password");
    });

    expect(screen.getByTestId("admin").textContent).toBe("yes");
  });
});
