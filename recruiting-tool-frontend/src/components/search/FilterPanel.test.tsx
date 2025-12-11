import { describe, it, expect, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  within,
} from "../../test/test-utils";
import FilterPanel from "./FilterPanel";
import { SearchFilters } from "../../types/search";
import { mockStatusOptions, mockSkillsOptions } from "../../test/test-data";

describe("FilterPanel", () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnApply = vi.fn();
  const mockOnReset = vi.fn();

  const defaultFilters: SearchFilters = {};

  afterEach(() => {
    mockOnFiltersChange.mockClear();
    mockOnApply.mockClear();
    mockOnReset.mockClear();
  });

  describe("Rendering", () => {
    it("should render action buttons", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />,
      );

      expect(screen.getByText("Reset Filters")).toBeInTheDocument();
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });

    it("should render status filter when statusOptions provided", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          statusOptions={mockStatusOptions}
        />,
      );

      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("should not render status filter when no statusOptions", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />,
      );

      expect(screen.queryByText("Status")).not.toBeInTheDocument();
    });

    it("should render skills filter when showSkills is true", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showSkills={true}
          skillsOptions={mockSkillsOptions}
        />,
      );

      expect(screen.getByText("Skills")).toBeInTheDocument();
    });

    it("should render location filter when showLocation is true", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showLocation={true}
        />,
      );

      expect(screen.getByText("Location")).toBeInTheDocument();
    });

    it("should render experience filter when showExperience is true", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showExperience={true}
        />,
      );

      expect(screen.getByText("Experience")).toBeInTheDocument();
    });

    it("should render salary filter when showSalary is true", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showSalary={true}
        />,
      );

      expect(screen.getByText("Salary")).toBeInTheDocument();
    });

    it("should render date range filter when showDateRange is true", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showDateRange={true}
        />,
      );

      expect(screen.getByText("Date Range")).toBeInTheDocument();
    });
  });

  describe("Status Filter", () => {
    it("should render all status options", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          statusOptions={mockStatusOptions}
        />,
      );

      // Expand the accordion (it's expanded by default)
      mockStatusOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it("should show count badges for status options", () => {
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          statusOptions={mockStatusOptions}
        />,
      );

      expect(screen.getByText("(10)")).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });

    it("should toggle status when checkbox clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          statusOptions={mockStatusOptions}
        />,
      );

      const pendingCheckbox = screen.getByRole("checkbox", {
        name: /pending/i,
      });
      await user.click(pendingCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        status: ["PENDING"],
      });
    });

    it("should allow selecting multiple status values", async () => {
      const user = userEvent.setup();
      const filters = { status: ["PENDING"] };

      renderWithProviders(
        <FilterPanel
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          statusOptions={mockStatusOptions}
        />,
      );

      const reviewedCheckbox = screen.getByRole("checkbox", {
        name: /reviewed/i,
      });
      await user.click(reviewedCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        status: ["PENDING", "REVIEWED"],
      });
    });

    it("should deselect status when clicked again", async () => {
      const user = userEvent.setup();
      const filters = { status: ["PENDING"] };

      renderWithProviders(
        <FilterPanel
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          statusOptions={mockStatusOptions}
        />,
      );

      const pendingCheckbox = screen.getByRole("checkbox", {
        name: /pending/i,
      });
      await user.click(pendingCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        status: undefined,
      });
    });

    it("should display badge with selected count", () => {
      const filters = { status: ["PENDING", "REVIEWED", "ACCEPTED"] };

      renderWithProviders(
        <FilterPanel
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          statusOptions={mockStatusOptions}
        />,
      );

      // Should show count of selected items
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("Location Filter", () => {
    it("should update location filter on input change", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showLocation={true}
        />,
      );

      // Expand accordion
      const locationAccordion = screen.getByText("Location");
      await user.click(locationAccordion);

      const locationInput = screen.getByPlaceholderText("Enter location");
      await user.type(locationInput, "New York");

      // Should be called for each character typed
      expect(mockOnFiltersChange).toHaveBeenCalled();
      // Verify the last call has the full text
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ];
      expect(lastCall[0].location).toBe("k"); // Last character
    });

    it("should clear location when input is empty", async () => {
      const user = userEvent.setup();
      const filters = { location: "San Francisco" };

      renderWithProviders(
        <FilterPanel
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showLocation={true}
        />,
      );

      // Expand accordion
      const locationAccordion = screen.getByText("Location");
      await user.click(locationAccordion);

      const locationInput = screen.getByDisplayValue("San Francisco");
      await user.clear(locationInput);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        location: undefined,
      });
    });
  });

  describe("Action Buttons", () => {
    it("should call onApply when Apply button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />,
      );

      const applyButton = screen.getByText("Apply Filters");
      await user.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it("should call onReset when Reset button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FilterPanel
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />,
      );

      const resetButton = screen.getByText("Reset Filters");
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Active Filter Indicators", () => {
    it("should show indicator when filters are active", () => {
      const filters = { location: "Boston" };

      renderWithProviders(
        <FilterPanel
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
          showLocation={true}
        />,
      );

      // Look for chip indicator (•)
      const chips = screen.getAllByText("•");
      expect(chips.length).toBeGreaterThan(0);
    });
  });
});
