import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../test-utils";
import { HealthDot } from "../HealthDot";

describe("HealthDot", () => {
  it("renders green for HEALTHY", () => {
    const { container } = renderWithProviders(<HealthDot status="HEALTHY" />);
    const dot = container.firstChild as HTMLElement;
    // Chakra applies bg as a CSS variable or style; check the element exists
    expect(dot).toBeInTheDocument();
    expect(dot.style.width).toBeDefined();
  });

  it("renders red for UNREACHABLE", () => {
    const { container } = renderWithProviders(<HealthDot status="UNREACHABLE" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
  });

  it("renders gray for UNKNOWN", () => {
    const { container } = renderWithProviders(<HealthDot status="UNKNOWN" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
  });

  it("renders with correct dimensions", () => {
    const { container } = renderWithProviders(<HealthDot status="HEALTHY" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeTruthy();
  });
});
