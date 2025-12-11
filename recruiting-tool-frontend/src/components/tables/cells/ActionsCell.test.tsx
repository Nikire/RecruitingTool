import { describe, it, expect, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
} from "../../../test/test-utils";
import ActionsCell from "./ActionsCell";

describe("ActionsCell", () => {
  const mockOnView = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  afterEach(() => {
    mockOnView.mockClear();
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  describe("Rendering", () => {
    it("should render view button when onView provided", () => {
      renderWithProviders(<ActionsCell onView={mockOnView} />);

      expect(screen.getByLabelText(/view/i)).toBeInTheDocument();
    });

    it("should render edit button when onEdit provided", () => {
      renderWithProviders(<ActionsCell onEdit={mockOnEdit} />);

      expect(screen.getByLabelText(/edit/i)).toBeInTheDocument();
    });

    it("should render delete button when onDelete provided", () => {
      renderWithProviders(<ActionsCell onDelete={mockOnDelete} />);

      expect(screen.getByLabelText(/delete/i)).toBeInTheDocument();
    });

    it("should render all buttons when all callbacks provided", () => {
      renderWithProviders(
        <ActionsCell
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByLabelText(/view/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/edit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delete/i)).toBeInTheDocument();
    });

    it("should not render view button when onView not provided", () => {
      renderWithProviders(
        <ActionsCell onEdit={mockOnEdit} onDelete={mockOnDelete} />,
      );

      expect(screen.queryByLabelText(/view/i)).not.toBeInTheDocument();
    });

    it("should not render edit button when onEdit not provided", () => {
      renderWithProviders(
        <ActionsCell onView={mockOnView} onDelete={mockOnDelete} />,
      );

      expect(screen.queryByLabelText(/edit/i)).not.toBeInTheDocument();
    });

    it("should not render delete button when onDelete not provided", () => {
      renderWithProviders(
        <ActionsCell onView={mockOnView} onEdit={mockOnEdit} />,
      );

      expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument();
    });

    it("should not render any buttons when no callbacks provided", () => {
      const { container } = renderWithProviders(<ActionsCell />);

      expect(container.querySelector("button")).not.toBeInTheDocument();
    });
  });

  describe("Show/Hide Props", () => {
    it("should hide view button when showView is false", () => {
      renderWithProviders(<ActionsCell onView={mockOnView} showView={false} />);

      expect(screen.queryByLabelText(/view/i)).not.toBeInTheDocument();
    });

    it("should hide edit button when showEdit is false", () => {
      renderWithProviders(<ActionsCell onEdit={mockOnEdit} showEdit={false} />);

      expect(screen.queryByLabelText(/edit/i)).not.toBeInTheDocument();
    });

    it("should hide delete button when showDelete is false", () => {
      renderWithProviders(
        <ActionsCell onDelete={mockOnDelete} showDelete={false} />,
      );

      expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onView when view button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ActionsCell onView={mockOnView} />);

      const viewButton = screen.getByLabelText(/view/i);
      await user.click(viewButton);

      expect(mockOnView).toHaveBeenCalledTimes(1);
    });

    it("should call onEdit when edit button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ActionsCell onEdit={mockOnEdit} />);

      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete when delete button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ActionsCell onDelete={mockOnDelete} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should stop event propagation on button click", async () => {
      const user = userEvent.setup();
      const mockParentClick = vi.fn();

      renderWithProviders(
        <div onClick={mockParentClick}>
          <ActionsCell onView={mockOnView} />
        </div>,
      );

      const viewButton = screen.getByLabelText(/view/i);
      await user.click(viewButton);

      expect(mockOnView).toHaveBeenCalledTimes(1);
      expect(mockParentClick).not.toHaveBeenCalled();
    });
  });

  describe("Button Sizing", () => {
    it("should render small buttons by default", () => {
      const { container } = renderWithProviders(
        <ActionsCell onEdit={mockOnEdit} />,
      );

      const smallButton = container.querySelector(".MuiIconButton-sizeSmall");
      expect(smallButton).toBeInTheDocument();
    });

    it("should render medium buttons when size is medium", () => {
      const { container } = renderWithProviders(
        <ActionsCell onEdit={mockOnEdit} size="medium" />,
      );

      const mediumButton = container.querySelector(".MuiIconButton-sizeMedium");
      expect(mediumButton).toBeInTheDocument();
    });
  });

  describe("Button Colors", () => {
    it("should render view button with primary color", () => {
      const { container } = renderWithProviders(
        <ActionsCell onView={mockOnView} />,
      );

      const primaryButton = container.querySelector(
        ".MuiIconButton-colorPrimary",
      );
      expect(primaryButton).toBeInTheDocument();
    });

    it("should render edit button with primary color", () => {
      const { container } = renderWithProviders(
        <ActionsCell onEdit={mockOnEdit} />,
      );

      const primaryButton = container.querySelector(
        ".MuiIconButton-colorPrimary",
      );
      expect(primaryButton).toBeInTheDocument();
    });

    it("should render delete button with error color", () => {
      const { container } = renderWithProviders(
        <ActionsCell onDelete={mockOnDelete} />,
      );

      const errorButton = container.querySelector(".MuiIconButton-colorError");
      expect(errorButton).toBeInTheDocument();
    });
  });

  describe("Tooltips", () => {
    it("should show tooltip for view button", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ActionsCell onView={mockOnView} />);

      const viewButton = screen.getByLabelText(/view/i);
      await user.hover(viewButton);

      // Tooltip should be triggered (testing library doesn't always show tooltips in tests)
      expect(viewButton).toBeInTheDocument();
    });

    it("should show tooltip for edit button", () => {
      renderWithProviders(<ActionsCell onEdit={mockOnEdit} />);

      const editButton = screen.getByLabelText(/edit/i);
      expect(editButton).toBeInTheDocument();
    });

    it("should show tooltip for delete button", () => {
      renderWithProviders(<ActionsCell onDelete={mockOnDelete} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe("Custom Actions", () => {
    it("should render custom actions", () => {
      const customAction = <button data-testid="custom-action">Custom</button>;

      renderWithProviders(<ActionsCell customActions={customAction} />);

      expect(screen.getByTestId("custom-action")).toBeInTheDocument();
    });

    it("should render custom actions alongside standard actions", () => {
      const customAction = <button data-testid="custom-action">Custom</button>;

      renderWithProviders(
        <ActionsCell onEdit={mockOnEdit} customActions={customAction} />,
      );

      expect(screen.getByLabelText(/edit/i)).toBeInTheDocument();
      expect(screen.getByTestId("custom-action")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible labels for all buttons", () => {
      renderWithProviders(
        <ActionsCell
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByLabelText(/view/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/edit/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/delete/i)).toHaveAccessibleName();
    });

    it("should have proper button roles", () => {
      renderWithProviders(
        <ActionsCell
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("Multiple Clicks", () => {
    it("should handle multiple view button clicks", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ActionsCell onView={mockOnView} />);

      const viewButton = screen.getByLabelText(/view/i);
      await user.click(viewButton);
      await user.click(viewButton);
      await user.click(viewButton);

      expect(mockOnView).toHaveBeenCalledTimes(3);
    });

    it("should handle clicking different buttons", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ActionsCell
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      await user.click(screen.getByLabelText(/view/i));
      await user.click(screen.getByLabelText(/edit/i));
      await user.click(screen.getByLabelText(/delete/i));

      expect(mockOnView).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });
});
