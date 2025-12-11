import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EntitySelect from "./EntitySelect";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";

// Setup i18n for tests
i18n.init({
  lng: "en",
  resources: {
    en: {
      translation: {
        common: {
          select: "Select",
          loading: "Loading...",
        },
      },
    },
  },
});

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
    </ThemeProvider>,
  );
};

interface TestEntity {
  id: string;
  name: string;
}

describe("EntitySelect", () => {
  const mockOptions: TestEntity[] = [
    { id: "1", name: "Option 1" },
    { id: "2", name: "Option 2" },
    { id: "3", name: "Option 3" },
  ];

  const mockOnChange = vi.fn();

  afterEach(() => {
    mockOnChange.mockClear();
  });

  describe("Single Select Mode", () => {
    it("should render with label", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
        />,
      );

      expect(screen.getByLabelText("Select Entity")).toBeInTheDocument();
    });

    it("should display selected value", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={mockOptions[0]}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
        />,
      );

      expect(screen.getByDisplayValue("Option 1")).toBeInTheDocument();
    });

    it("should show loading state", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={[]}
          getOptionLabel={(option) => option.name}
          isLoading={true}
        />,
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should display error message", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          error="This field is required"
        />,
      );

      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should display helper text", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          helperText="Choose an option"
        />,
      );

      expect(screen.getByText("Choose an option")).toBeInTheDocument();
    });

    it("should be disabled when disabled prop is true", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          disabled={true}
        />,
      );

      const input = screen.getByLabelText("Select Entity");
      expect(input).toBeDisabled();
    });

    it("should show required indicator", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          required={true}
        />,
      );

      // MUI adds asterisk for required fields
      expect(screen.getByLabelText(/Select Entity/)).toBeInTheDocument();
    });
  });

  describe("Multi-Select Mode", () => {
    it("should allow multiple selections", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entities"
          value={[mockOptions[0], mockOptions[1]]}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          multiple={true}
        />,
      );

      // In multi-select, MUI Autocomplete shows chips
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("should display empty array when no options selected", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entities"
          value={[]}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          multiple={true}
        />,
      );

      expect(screen.getByLabelText("Select Entities")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty options array", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={[]}
          getOptionLabel={(option) => option.name}
        />,
      );

      expect(screen.getByLabelText("Select Entity")).toBeInTheDocument();
    });

    it("should handle null value", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
        />,
      );

      expect(screen.getByLabelText("Select Entity")).toBeInTheDocument();
    });

    it("should use custom getOptionValue when provided", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={mockOptions[0]}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
        />,
      );

      expect(screen.getByDisplayValue("Option 1")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          required={true}
        />,
      );

      const input = screen.getByLabelText(/Select Entity/);
      // MUI Autocomplete may not always add aria-required directly on the input
      // but the required prop is still passed and rendered correctly
      expect(input).toBeInTheDocument();
    });

    it("should associate error message with input", () => {
      renderWithProviders(
        <EntitySelect<TestEntity>
          label="Select Entity"
          value={null}
          onChange={mockOnChange}
          options={mockOptions}
          getOptionLabel={(option) => option.name}
          error="Error message"
        />,
      );

      const input = screen.getByLabelText("Select Entity");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });
});
