import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test-utils";
import { DeleteConfirmModal } from "../DeleteConfirmModal";

describe("DeleteConfirmModal", () => {
  it("renders with item name", () => {
    renderWithProviders(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        entityName="test-connection"
      />,
    );

    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(screen.getByText("test-connection")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderWithProviders(
      <DeleteConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        entityName="test-connection"
      />,
    );

    expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
  });

  it("calls onConfirm when delete clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    renderWithProviders(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        entityName="test-connection"
      />,
    );

    await user.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when cancel clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        entityName="test-connection"
      />,
    );

    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
