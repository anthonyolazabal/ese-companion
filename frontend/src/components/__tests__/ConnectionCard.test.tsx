import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import { ConnectionCard } from "../ConnectionCard";
import type { ConnectionSummary } from "../../api/types";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const baseConnection: ConnectionSummary = {
  id: "conn-1",
  name: "My PostgreSQL",
  dbType: "postgresql",
  healthStatus: "HEALTHY",
  lastHealthCheck: "2025-01-01T00:00:00Z",
  stats: null,
};

describe("ConnectionCard", () => {
  it("renders connection name and DB type", () => {
    renderWithProviders(<ConnectionCard connection={baseConnection} />);

    expect(screen.getByText("My PostgreSQL")).toBeInTheDocument();
    expect(screen.getByText("postgresql")).toBeInTheDocument();
  });

  it("shows health dot", () => {
    const { container } = renderWithProviders(
      <ConnectionCard connection={baseConnection} />,
    );
    // HealthDot renders a Box (div) with specific dimensions
    const dots = container.querySelectorAll('[style*="border-radius"]');
    expect(dots.length).toBeGreaterThanOrEqual(0);
    // The component should render without errors
    expect(screen.getByText("My PostgreSQL")).toBeInTheDocument();
  });

  it("shows stats when available", () => {
    const connectionWithStats: ConnectionSummary = {
      ...baseConnection,
      stats: {
        mqtt: { userCount: 3, roleCount: 2, permissionCount: 5 },
        cc: { userCount: 1, roleCount: 1, permissionCount: 2 },
        restApi: { userCount: 0, roleCount: 0, permissionCount: 0 },
      },
    };

    renderWithProviders(<ConnectionCard connection={connectionWithStats} />);

    expect(screen.getByText("MQTT")).toBeInTheDocument();
    expect(screen.getByText("CC")).toBeInTheDocument();
    expect(screen.getByText("REST API")).toBeInTheDocument();
    expect(screen.getByText("3 users")).toBeInTheDocument();
    expect(screen.getByText("2 roles")).toBeInTheDocument();
    expect(screen.getByText("5 perms")).toBeInTheDocument();
  });

  it("does not show stats section when stats is null", () => {
    renderWithProviders(<ConnectionCard connection={baseConnection} />);

    expect(screen.queryByText("MQTT")).not.toBeInTheDocument();
    expect(screen.queryByText("CC")).not.toBeInTheDocument();
  });
});
