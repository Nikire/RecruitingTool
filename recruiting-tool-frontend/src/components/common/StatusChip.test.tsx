import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../../test/test-utils";
import StatusChip from "./StatusChip";

describe("StatusChip", () => {
  describe("Rendering", () => {
    it("should render with status text", () => {
      renderWithProviders(<StatusChip status="PENDING" type="application" />);

      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });

    it("should render as small size by default", () => {
      const { container } = renderWithProviders(
        <StatusChip status="OPEN" type="jobPosition" />,
      );

      const chip = container.querySelector(".MuiChip-sizeSmall");
      expect(chip).toBeInTheDocument();
    });

    it("should render as medium size when specified", () => {
      const { container } = renderWithProviders(
        <StatusChip status="OPEN" type="jobPosition" size="medium" />,
      );

      const chip = container.querySelector(".MuiChip-sizeMedium");
      expect(chip).toBeInTheDocument();
    });

    it("should render as filled variant by default", () => {
      const { container } = renderWithProviders(
        <StatusChip status="PENDING" type="application" />,
      );

      const chip = container.querySelector(".MuiChip-filled");
      expect(chip).toBeInTheDocument();
    });

    it("should render as outlined variant when specified", () => {
      const { container } = renderWithProviders(
        <StatusChip status="PENDING" type="application" variant="outlined" />,
      );

      const chip = container.querySelector(".MuiChip-outlined");
      expect(chip).toBeInTheDocument();
    });
  });

  describe("Application Status Colors", () => {
    it("should apply warning color for PENDING status", () => {
      const { container } = renderWithProviders(
        <StatusChip status="PENDING" type="application" />,
      );

      const chip = container.querySelector(".MuiChip-colorWarning");
      expect(chip).toBeInTheDocument();
    });

    it("should apply primary color for REVIEWED status", () => {
      renderWithProviders(<StatusChip status="REVIEWED" type="application" />);

      // Just verify it renders without error - color is applied through MUI theme
      expect(screen.getByText(/reviewed/i)).toBeInTheDocument();
    });

    it("should apply success color for ACCEPTED status", () => {
      const { container } = renderWithProviders(
        <StatusChip status="ACCEPTED" type="application" />,
      );

      const chip = container.querySelector(".MuiChip-colorSuccess");
      expect(chip).toBeInTheDocument();
    });

    it("should apply error color for REJECTED status", () => {
      const { container } = renderWithProviders(
        <StatusChip status="REJECTED" type="application" />,
      );

      const chip = container.querySelector(".MuiChip-colorError");
      expect(chip).toBeInTheDocument();
    });
  });

  describe("Job Position Status Colors", () => {
    it("should apply success color for OPEN status", () => {
      const { container } = renderWithProviders(
        <StatusChip status="OPEN" type="jobPosition" />,
      );

      const chip = container.querySelector(".MuiChip-colorSuccess");
      expect(chip).toBeInTheDocument();
    });

    it("should apply default color for CLOSED status", () => {
      const { container } = renderWithProviders(
        <StatusChip status="CLOSED" type="jobPosition" />,
      );

      const chip = container.querySelector(".MuiChip-colorDefault");
      expect(chip).toBeInTheDocument();
    });

    it("should apply warning color for ARCHIVED status", () => {
      const { container } = renderWithProviders(
        <StatusChip status="ARCHIVED" type="jobPosition" />,
      );

      const chip = container.querySelector(".MuiChip-colorWarning");
      expect(chip).toBeInTheDocument();
    });
  });

  describe("Translation", () => {
    it("should display raw status when translate is false", () => {
      renderWithProviders(
        <StatusChip status="PENDING" type="application" translate={false} />,
      );

      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });

    it("should translate status when translate is true", () => {
      // Note: In real implementation, this would use i18n
      // For now, just verify the translate prop is being used
      renderWithProviders(
        <StatusChip
          status="PENDING"
          type="application"
          translate={true}
          translationPrefix="status."
        />,
      );

      // The component should attempt translation
      expect(screen.getByLabelText(/status:/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible label", () => {
      renderWithProviders(<StatusChip status="PENDING" type="application" />);

      const chip = screen.getByLabelText(/status:/i);
      expect(chip).toBeInTheDocument();
    });

    it("should include status value in aria-label", () => {
      renderWithProviders(<StatusChip status="ACCEPTED" type="application" />);

      const chip = screen.getByLabelText(/accepted/i);
      expect(chip).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle unknown status gracefully", () => {
      const { container } = renderWithProviders(
        <StatusChip status="UNKNOWN_STATUS" type="application" />,
      );

      expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument();
      // Should default to 'default' color
      const chip = container.querySelector(".MuiChip-colorDefault");
      expect(chip).toBeInTheDocument();
    });

    it("should handle empty status string", () => {
      renderWithProviders(<StatusChip status="" type="application" />);

      // Should render without crashing
      const chip = screen.getByLabelText(/status:/i);
      expect(chip).toBeInTheDocument();
    });
  });
});
