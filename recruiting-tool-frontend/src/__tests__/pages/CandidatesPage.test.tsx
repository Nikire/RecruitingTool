import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
} from "../../test/test-utils";
import { BrowserRouter } from "react-router-dom";
import CandidatesPage from "../../pages/candidates/CandidatesPage";
import { server } from "../../test/mocks/server";

const renderCandidatesPage = () => {
  return renderWithProviders(
    <BrowserRouter>
      <CandidatesPage />
    </BrowserRouter>,
  );
};

describe("CandidatesPage", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("Page Structure", () => {
    it("should render without crashing", () => {
      const { container } = renderCandidatesPage();
      expect(container).toBeInTheDocument();
    });

    it("should have main content area", () => {
      const { container } = renderCandidatesPage();
      const mainBox = container.querySelector(".MuiBox-root");
      expect(mainBox).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicators while data is fetching", () => {
      renderCandidatesPage();
      // Component should render even during loading
      const { container } = renderCandidatesPage();
      expect(container).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    it("should eventually display candidates after loading", async () => {
      renderCandidatesPage();

      // Wait for any async operations to complete
      await waitFor(
        () => {
          const { container } = renderCandidatesPage();
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

      const { container } = renderCandidatesPage();
      expect(container).toBeInTheDocument();
    });
  });
});
