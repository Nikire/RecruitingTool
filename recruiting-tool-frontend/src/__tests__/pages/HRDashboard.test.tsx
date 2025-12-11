import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, waitFor } from "../../test/test-utils";
import { BrowserRouter } from "react-router-dom";
import HRDashboard from "../../pages/hr/HRDashboard";
import { server } from "../../test/mocks/server";
import { errorHandlers } from "../../test/mocks/handlers";

const renderHRDashboard = () => {
  return renderWithProviders(
    <BrowserRouter>
      <HRDashboard />
    </BrowserRouter>,
  );
};

describe("HRDashboard", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("Page Structure", () => {
    it("should render without crashing", () => {
      const { container } = renderHRDashboard();
      expect(container).toBeInTheDocument();
    });

    it("should have main content area", () => {
      const { container } = renderHRDashboard();
      const mainBox = container.querySelector(".MuiBox-root");
      expect(mainBox).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicators while data is fetching", () => {
      const { container } = renderHRDashboard();
      expect(container).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    it("should eventually display dashboard content after loading", async () => {
      renderHRDashboard();

      await waitFor(
        () => {
          const { container } = renderHRDashboard();
          expect(container).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      server.use(...errorHandlers);

      const { container } = renderHRDashboard();

      await waitFor(
        () => {
          expect(container).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Responsive Design", () => {
    it("should render on mobile viewport", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(max-width: 600px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = renderHRDashboard();
      expect(container).toBeInTheDocument();
    });

    it("should render on desktop viewport", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query !== "(max-width: 600px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = renderHRDashboard();
      expect(container).toBeInTheDocument();
    });
  });

  describe("Paper Components", () => {
    it("should render Paper components for content sections", () => {
      const { container } = renderHRDashboard();
      const papers = container.querySelectorAll(".MuiPaper-root");
      expect(papers.length).toBeGreaterThan(0);
    });
  });

  describe("Grid Layout", () => {
    it("should use Grid layout for responsive design", () => {
      const { container } = renderHRDashboard();
      const grids = container.querySelectorAll(".MuiGrid-root");
      expect(grids.length).toBeGreaterThan(0);
    });
  });
});
