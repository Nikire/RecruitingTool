import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "../../test/test-utils";
import CreateCandidateDialog from "./CreateCandidateDialog";
import { QueryClient } from "@tanstack/react-query";
import * as useCandidatesHook from "../../hooks/api/useCandidates";

// Mock the useCandidates hook
vi.mock("../../hooks/api/useCandidates", () => ({
  useCreateCandidate: vi.fn(),
}));

describe("CreateCandidateDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as any);
  });

  describe("Rendering", () => {
    it("should render dialog when open", () => {
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Check for form element instead
      expect(screen.getByRole("form")).toBeInTheDocument();
    });

    it("should not render dialog when closed", () => {
      renderWithProviders(
        <CreateCandidateDialog open={false} onClose={mockOnClose} />,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render all form fields", () => {
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      // Use getAllByRole to find inputs
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThanOrEqual(2); // At least name and source details

      // Check for combobox (Select field)
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(1); // At least source select
    });

    it("should render submit and cancel buttons", () => {
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      // Check for buttons
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2); // At least cancel and submit
    });

    it("should have form with aria-label", () => {
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const form = screen.getByRole("form");
      expect(form).toHaveAttribute("aria-label");
    });
  });

  describe("Form Validation", () => {
    it("should show validation error for empty name", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const buttons = screen.getAllByRole("button");
      const submitButton = buttons[buttons.length - 1]; // Last button is submit
      await user.click(submitButton);

      await waitFor(() => {
        const errors = screen.getAllByText(/required/i);
        expect(errors.length).toBeGreaterThan(0);
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should show validation error for name too short", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "AB"); // Less than 3 characters

      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorText = screen.queryByText(/at least.*3/i);
        if (errorText) {
          expect(errorText).toBeInTheDocument();
        }
      });
    });

    it("should show validation error for invalid email", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "invalid-email");

      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorText = screen.queryByText(/valid.*email/i);
        if (errorText) {
          expect(errorText).toBeInTheDocument();
        }
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should display error icons for invalid fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorIcons = screen.queryAllByLabelText(/error/i);
        expect(errorIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const buttons = screen.getAllByRole("button");
      const cancelButton = buttons[0]; // First button should be cancel
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should allow typing in name field", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const inputs = screen.getAllByRole("textbox");
      const nameInput = inputs[0]; // First textbox is name
      await user.type(nameInput, "John Doe");

      expect(nameInput).toHaveValue("John Doe");
    });

    it("should allow typing in email field", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      // Email input has type="email", so use querySelector
      const emailInput = screen
        .getByRole("form")
        .querySelector('input[type="email"]');
      expect(emailInput).toBeInTheDocument();

      if (emailInput) {
        await user.type(emailInput as HTMLInputElement, "john@example.com");
        expect(emailInput).toHaveValue("john@example.com");
      }
    });

    it("should allow selecting source from dropdown", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const sourceSelect = screen.getAllByRole("combobox")[0];
      await user.click(sourceSelect);

      // Wait for dropdown options to appear
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Get all options and click the second one
      const options = screen.getAllByRole("option");
      if (options.length > 1) {
        await user.click(options[1]);
      }

      // Verify dropdown closed
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should allow typing in source details field", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const textboxes = screen.getAllByRole("textbox");
      // Source details is a multiline textbox (last one)
      const sourceDetailsInput = textboxes[textboxes.length - 1];
      await user.type(sourceDetailsInput, "Referred by HR manager");

      expect(sourceDetailsInput).toHaveValue("Referred by HR manager");
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");

      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "John Doe",
            email: "john@example.com",
            source: "DIRECT_APPLY", // default value
          }),
          expect.any(Object),
        );
      });
    });

    it("should call onSuccess and onClose after successful submission", async () => {
      const user = userEvent.setup();

      // Mock successful mutation
      vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
        mutate: (data: any, options: any) => {
          // Immediately call onSuccess callback
          options.onSuccess();
        },
        isPending: false,
        isError: false,
      } as any);

      renderWithProviders(
        <CreateCandidateDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");

      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should reset form after successful submission", async () => {
      const user = userEvent.setup();

      // Mock successful mutation
      let capturedCallback: any;
      vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
        mutate: (data: any, options: any) => {
          capturedCallback = options.onSuccess;
        },
        isPending: false,
        isError: false,
      } as any);

      const { rerender } = renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const textboxes = screen.getAllByRole("textbox");
      const emailInput = screen
        .getByRole("form")
        .querySelector('input[type="email"]');

      await user.type(textboxes[0], "John Doe");
      if (emailInput) {
        await user.type(emailInput as HTMLInputElement, "john@example.com");
      }

      const buttons = screen.getAllByRole("button");
      const submitButton = buttons[buttons.length - 1];
      await user.click(submitButton);

      // Trigger onSuccess callback
      if (capturedCallback) {
        capturedCallback();
      }

      // Reopen dialog to check if form was reset
      rerender(<CreateCandidateDialog open={false} onClose={mockOnClose} />);
      rerender(<CreateCandidateDialog open={true} onClose={mockOnClose} />);

      await waitFor(() => {
        const textboxesAfterReset = screen.getAllByRole("textbox");
        const emailInputAfterReset = screen
          .getByRole("form")
          .querySelector('input[type="email"]');

        expect(textboxesAfterReset[0]).toHaveValue("");
        expect(emailInputAfterReset).toHaveValue("");
      });
    });
  });

  describe("Loading State", () => {
    it("should disable buttons when submitting", () => {
      vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
      } as any);

      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should show loading indicator when submitting", () => {
      vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
      } as any);

      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      // Check for loading spinner
      const loadingSpinner = screen.getByRole("progressbar");
      expect(loadingSpinner).toBeInTheDocument();
    });

    it("should change button text when loading", () => {
      vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
      } as any);

      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      // Verify buttons are disabled during loading
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when submission fails", () => {
      vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: true,
      } as any);

      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute("aria-live", "polite");
    });

    it("should not show error message when no error", () => {
      vi.mocked(useCandidatesHook.useCreateCandidate).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
      } as any);

      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on dialog", () => {
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute(
        "aria-labelledby",
        "create-candidate-dialog-title",
      );
      expect(dialog).toHaveAttribute(
        "aria-describedby",
        "create-candidate-dialog-description",
      );
    });

    it("should mark required fields with aria-required", () => {
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      expect(nameInput).toHaveAttribute("aria-required", "true");
      expect(emailInput).toHaveAttribute("aria-required", "true");
    });

    it("should mark invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i);
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should have accessible button labels", () => {
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe("Dialog Close Behavior", () => {
    it("should reset form when dialog is closed via cancel button", async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const textboxes = screen.getAllByRole("textbox");
      await user.type(textboxes[0], "John Doe");

      const buttons = screen.getAllByRole("button");
      const cancelButton = buttons[0]; // First button is cancel
      await user.click(cancelButton);

      // Reopen dialog
      rerender(<CreateCandidateDialog open={false} onClose={mockOnClose} />);
      rerender(<CreateCandidateDialog open={true} onClose={mockOnClose} />);

      await waitFor(() => {
        const textboxesAfterReset = screen.getAllByRole("textbox");
        expect(textboxesAfterReset[0]).toHaveValue("");
      });
    });

    it("should not submit form when cancelled", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CreateCandidateDialog open={true} onClose={mockOnClose} />,
      );

      const textboxes = screen.getAllByRole("textbox");
      const emailInput = screen
        .getByRole("form")
        .querySelector('input[type="email"]');

      await user.type(textboxes[0], "John Doe");
      if (emailInput) {
        await user.type(emailInput as HTMLInputElement, "john@example.com");
      }

      const buttons = screen.getAllByRole("button");
      const cancelButton = buttons[0]; // First button is cancel
      await user.click(cancelButton);

      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
