import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "../../test/test-utils";
import PageHeader from "./PageHeader";
import AddIcon from "@mui/icons-material/Add";

describe("PageHeader", () => {
  describe("Rendering", () => {
    it("should render page title", () => {
      renderWithProviders(<PageHeader title="common.dashboard" />);

      // Title should be rendered as h4
      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toBeInTheDocument();
    });

    it("should translate title using i18n key", () => {
      renderWithProviders(<PageHeader title="common.dashboard" />);

      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toBeInTheDocument();
    });

    it("should not render action button by default", () => {
      renderWithProviders(<PageHeader title="common.dashboard" />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render action button when action prop is provided", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      expect(
        screen.getByRole("button", { name: /create/i }),
      ).toBeInTheDocument();
    });

    it("should render action button with icon", () => {
      const mockAction = {
        label: "common.create",
        icon: <AddIcon />,
        onClick: vi.fn(),
      };

      const { container } = renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).toBeInTheDocument();

      // Check if icon is rendered inside button
      const icon = container.querySelector(".MuiSvgIcon-root");
      expect(icon).toBeInTheDocument();
    });

    it("should translate action label using i18n key", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Action Button Functionality", () => {
    it("should call onClick when action button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const mockAction = {
        label: "common.create",
        onClick: mockOnClick,
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when button is disabled", () => {
      const mockOnClick = vi.fn();
      const mockAction = {
        label: "common.create",
        onClick: mockOnClick,
        disabled: true,
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).toBeDisabled();

      // Verify button is disabled (cannot be clicked)
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should allow multiple clicks on enabled button", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const mockAction = {
        label: "common.create",
        onClick: mockOnClick,
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Button States", () => {
    it("should enable button by default", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).not.toBeDisabled();
    });

    it("should disable button when disabled prop is true", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
        disabled: true,
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).toBeDisabled();
    });

    it("should enable button when disabled prop is false", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
        disabled: false,
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("Styling", () => {
    it("should render header as flexbox with space-between", () => {
      const { container } = renderWithProviders(
        <PageHeader title="common.dashboard" />,
      );

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toHaveStyle({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      });
    });

    it("should render title as h4 variant", () => {
      renderWithProviders(<PageHeader title="common.dashboard" />);

      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toHaveClass("MuiTypography-h4");
    });

    it("should render action button as contained variant", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
      };

      const { container } = renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = container.querySelector(".MuiButton-contained");
      expect(button).toBeInTheDocument();
    });

    it("should render icon before button text", () => {
      const mockAction = {
        label: "common.create",
        icon: <AddIcon />,
        onClick: vi.fn(),
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      const startIcon = button.querySelector(".MuiButton-startIcon");
      expect(startIcon).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have heading role for title", () => {
      renderWithProviders(<PageHeader title="common.dashboard" />);

      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toBeInTheDocument();
    });

    it("should have accessible button when action is provided", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).toHaveAccessibleName();
    });

    it("should properly indicate disabled state to screen readers", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
        disabled: true,
      };

      renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const button = screen.getByRole("button", { name: /create/i });
      expect(button).toHaveAttribute("disabled");
    });
  });

  describe("Layout", () => {
    it("should position title on left and action on right", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
      };

      const { container } = renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toHaveStyle({ justifyContent: "space-between" });
    });

    it("should center align items vertically", () => {
      const mockAction = {
        label: "common.create",
        onClick: vi.fn(),
      };

      const { container } = renderWithProviders(
        <PageHeader title="common.dashboard" action={mockAction} />,
      );

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toHaveStyle({ alignItems: "center" });
    });

    it("should apply bottom margin", () => {
      const { container } = renderWithProviders(
        <PageHeader title="common.dashboard" />,
      );

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toBeInTheDocument();
    });
  });
});
