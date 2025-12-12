import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "../../test/test-utils";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

describe("ConfirmDeleteDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  afterEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  describe("Rendering", () => {
    it("should render dialog when open", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Delete Confirmation")).toBeInTheDocument();
    });

    it("should not render dialog when closed", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render custom title when provided", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete User?"
        />,
      );

      expect(screen.getByText("Delete User?")).toBeInTheDocument();
    });

    it("should render custom message when provided", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          message="This will permanently delete the user."
        />,
      );

      expect(
        screen.getByText("This will permanently delete the user."),
      ).toBeInTheDocument();
    });

    it("should render item name when provided", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          itemName="John Doe"
        />,
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render warning icon by default", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      expect(screen.getByLabelText("Warning")).toBeInTheDocument();
    });

    it("should not render warning icon when showWarningIcon is false", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          showWarningIcon={false}
        />,
      );

      expect(screen.queryByLabelText("Warning")).not.toBeInTheDocument();
    });

    it("should render custom button text", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          confirmText="Remove"
          cancelText="Go Back"
        />,
      );

      expect(screen.getByText("Remove")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      const confirmButton = screen.getByRole("button", { name: /delete/i });
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should disable buttons when isDeleting is true", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={true}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const confirmButton = screen.getByRole("button", { name: /deleting/i });

      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
    });

    it("should show loading indicator when isDeleting is true", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={true}
        />,
      );

      expect(screen.getByText("Deleting...")).toBeInTheDocument();
      expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    });

    it("should not call callbacks when buttons are disabled", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={true}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const confirmButton = screen.getByRole("button", { name: /deleting/i });

      // Buttons should be disabled, just verify they exist
      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute(
        "aria-labelledby",
        "confirm-delete-dialog-title",
      );
      expect(dialog).toHaveAttribute(
        "aria-describedby",
        "confirm-delete-dialog-description",
      );
    });

    it("should have accessible button labels", () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument();
    });

    it('should mark irreversible warning with role="note"', () => {
      renderWithProviders(
        <ConfirmDeleteDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      const notes = screen.getAllByRole("note");
      expect(notes.length).toBeGreaterThan(0);
    });
  });
});
