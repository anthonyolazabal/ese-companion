import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import { AlgorithmPicker } from "../AlgorithmPicker";
import type { Algorithm } from "../AlgorithmPicker";

describe("AlgorithmPicker", () => {
  it("default value is PKCS5S2", () => {
    renderWithProviders(
      <AlgorithmPicker value="PKCS5S2" onChange={vi.fn()} />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("PKCS5S2");
  });

  it("shows warning for PLAIN", () => {
    renderWithProviders(
      <AlgorithmPicker value="PLAIN" onChange={vi.fn()} />,
    );

    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("shows warning for MD5", () => {
    renderWithProviders(
      <AlgorithmPicker value="MD5" onChange={vi.fn()} />,
    );

    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("does not show warning for strong algorithms", () => {
    renderWithProviders(
      <AlgorithmPicker value="BCRYPT" onChange={vi.fn()} />,
    );

    expect(screen.queryByText("Weak")).not.toBeInTheDocument();
  });

  it("calls onChange with selected algorithm", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(
      <AlgorithmPicker value="PKCS5S2" onChange={onChange} />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "BCRYPT");

    expect(onChange).toHaveBeenCalledWith("BCRYPT", 12);
  });
});
