import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";

// Mock all external dependencies before importing the component
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: "/" }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("../../auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../api/dashboardApi", () => ({
  dashboardApi: { get: vi.fn() },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

import { useAuth } from "../../auth/useAuth";
import { useQuery } from "@tanstack/react-query";

const mockConnections = [
  {
    id: "conn-1",
    name: "PG Main",
    dbType: "postgresql",
    healthStatus: "HEALTHY",
    lastHealthCheck: null,
    stats: null,
  },
  {
    id: "conn-2",
    name: "MySQL Dev",
    dbType: "mysql",
    healthStatus: "UNREACHABLE",
    lastHealthCheck: null,
    stats: null,
  },
];

// We import Sidebar lazily after mocks are set up
import { Sidebar } from "../Sidebar";

describe("Sidebar", () => {
  it("shows Dashboard link", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: false,
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", username: "user1", email: "u@t.com", role: "viewer" },
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(useQuery).mockReturnValue({
      data: { connections: [], totalConnections: 0, healthyConnections: 0, unreachableConnections: 0 },
    } as ReturnType<typeof useQuery>);

    renderWithProviders(<Sidebar mobileOpen={false} onMobileClose={() => {}} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows admin section when user is admin", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: true,
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", username: "admin", email: "a@t.com", role: "admin" },
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(useQuery).mockReturnValue({
      data: { connections: [], totalConnections: 0, healthyConnections: 0, unreachableConnections: 0 },
    } as ReturnType<typeof useQuery>);

    renderWithProviders(<Sidebar mobileOpen={false} onMobileClose={() => {}} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Audit Logs")).toBeInTheDocument();
  });

  it("hides admin section when user is not admin", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: false,
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", username: "user1", email: "u@t.com", role: "viewer" },
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(useQuery).mockReturnValue({
      data: { connections: [], totalConnections: 0, healthyConnections: 0, unreachableConnections: 0 },
    } as ReturnType<typeof useQuery>);

    renderWithProviders(<Sidebar mobileOpen={false} onMobileClose={() => {}} />);
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("shows connection list", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: false,
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", username: "user1", email: "u@t.com", role: "viewer" },
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(useQuery).mockReturnValue({
      data: {
        connections: mockConnections,
        totalConnections: 2,
        healthyConnections: 1,
        unreachableConnections: 1,
      },
    } as ReturnType<typeof useQuery>);

    renderWithProviders(<Sidebar mobileOpen={false} onMobileClose={() => {}} />);
    expect(screen.getByText("PG Main")).toBeInTheDocument();
    expect(screen.getByText("MySQL Dev")).toBeInTheDocument();
  });
});
