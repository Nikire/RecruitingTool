import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "../../test/test-utils";
import Pagination from "./Pagination";
import { createMockPaginationMeta } from "../../test/test-data";

describe("Pagination", () => {
  const mockOnPageChange = vi.fn();
  const mockOnLimitChange = vi.fn();

  afterEach(() => {
    mockOnPageChange.mockClear();
    mockOnLimitChange.mockClear();
  });

  describe("Rendering", () => {
    it("should render pagination controls", () => {
      const meta = createMockPaginationMeta();

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      // There are two navigation elements - just verify at least one exists
      const navigations = screen.getAllByRole("navigation");
      expect(navigations.length).toBeGreaterThan(0);
    });

    it("should display current page range", () => {
      const meta = createMockPaginationMeta({
        page: 1,
        limit: 10,
        total: 100,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(screen.getByText(/showing 1 to 10 of 100/i)).toBeInTheDocument();
    });

    it("should calculate correct range for middle pages", () => {
      const meta = createMockPaginationMeta({
        page: 5,
        limit: 10,
        total: 100,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(screen.getByText(/showing 41 to 50 of 100/i)).toBeInTheDocument();
    });

    it("should calculate correct range for last page", () => {
      const meta = createMockPaginationMeta({
        page: 10,
        limit: 10,
        total: 95,
        totalPages: 10,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(screen.getByText(/showing 91 to 95 of 95/i)).toBeInTheDocument();
    });

    it("should render items per page selector", () => {
      const meta = createMockPaginationMeta();

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    });

    it("should display current limit value", () => {
      const meta = createMockPaginationMeta({ limit: 25 });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      // MUI Select uses a hidden input for value, verify text content instead
      expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("should render all limit options", async () => {
      const user = userEvent.setup();
      const meta = createMockPaginationMeta();

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const select = screen.getByLabelText(/items per page/i);
      await user.click(select);

      expect(screen.getByRole("option", { name: "10" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "25" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "50" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "100" })).toBeInTheDocument();
    });
  });

  describe("Page Navigation", () => {
    it("should call onPageChange when page button clicked", async () => {
      const user = userEvent.setup();
      const meta = createMockPaginationMeta({
        page: 1,
        totalPages: 5,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const page2Button = screen.getByRole("button", { name: "Go to page 2" });
      await user.click(page2Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("should highlight current page", () => {
      const meta = createMockPaginationMeta({
        page: 3,
        totalPages: 5,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const currentPageButton = screen.getByRole("button", { name: "page 3" });
      // MUI uses 'page' instead of 'true' for aria-current
      expect(currentPageButton).toHaveAttribute("aria-current", "page");
    });

    it("should disable next button on last page", () => {
      const meta = createMockPaginationMeta({
        page: 10,
        totalPages: 10,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const nextButton = screen.getByRole("button", { name: /next page/i });
      expect(nextButton).toBeDisabled();
    });

    it("should disable previous button on first page", () => {
      const meta = createMockPaginationMeta({
        page: 1,
        totalPages: 10,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const prevButton = screen.getByRole("button", { name: /previous page/i });
      expect(prevButton).toBeDisabled();
    });
  });

  describe("Limit Change", () => {
    it("should call onLimitChange when limit is changed", async () => {
      const user = userEvent.setup();
      const meta = createMockPaginationMeta({ limit: 10 });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const select = screen.getByLabelText(/items per page/i);
      await user.click(select);

      const option25 = screen.getByRole("option", { name: "25" });
      await user.click(option25);

      expect(mockOnLimitChange).toHaveBeenCalledWith(25);
    });

    it("should convert limit to number", async () => {
      const user = userEvent.setup();
      const meta = createMockPaginationMeta({ limit: 10 });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const select = screen.getByLabelText(/items per page/i);
      await user.click(select);

      const option50 = screen.getByRole("option", { name: "50" });
      await user.click(option50);

      expect(mockOnLimitChange).toHaveBeenCalledWith(50);
      expect(typeof mockOnLimitChange.mock.calls[0][0]).toBe("number");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single page correctly", () => {
      const meta = createMockPaginationMeta({
        page: 1,
        limit: 100,
        total: 50,
        totalPages: 1,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(screen.getByText(/showing 1 to 50 of 50/i)).toBeInTheDocument();
    });

    it("should handle empty results", () => {
      const meta = createMockPaginationMeta({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(screen.getByText(/showing 1 to 0 of 0/i)).toBeInTheDocument();
    });

    it("should handle large page numbers", () => {
      const meta = createMockPaginationMeta({
        page: 99,
        limit: 10,
        total: 1000,
        totalPages: 100,
      });

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(
        screen.getByText(/showing 981 to 990 of 1000/i),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have navigation role", () => {
      const meta = createMockPaginationMeta();

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      // There are multiple navigation elements, just verify at least one exists
      const navigations = screen.getAllByRole("navigation");
      expect(navigations.length).toBeGreaterThan(0);
    });

    it("should have aria-label for pagination navigation", () => {
      const meta = createMockPaginationMeta();

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(
        screen.getByLabelText(/pagination navigation/i),
      ).toBeInTheDocument();
    });

    it("should have aria-label for pagination controls", () => {
      const meta = createMockPaginationMeta();

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      expect(screen.getByLabelText(/pagination controls/i)).toBeInTheDocument();
    });

    it("should have live region for showing text", () => {
      const meta = createMockPaginationMeta();

      const { container } = renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it("should label items per page select", () => {
      const meta = createMockPaginationMeta();

      renderWithProviders(
        <Pagination
          meta={meta}
          onPageChange={mockOnPageChange}
          onLimitChange={mockOnLimitChange}
        />,
      );

      const select = screen.getByLabelText(/items per page/i);
      expect(select).toHaveAccessibleName();
    });
  });
});
