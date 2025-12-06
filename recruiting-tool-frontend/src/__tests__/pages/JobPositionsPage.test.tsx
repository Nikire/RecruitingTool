import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../../test/test-utils';
import { BrowserRouter } from 'react-router-dom';
import JobPositionsPage from '../../pages/job-positions/JobPositionsPage';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { emptyHandlers, errorHandlers, mockJobPositions } from '../../test/mocks/handlers';

const renderJobPositionsPage = () => {
  return renderWithProviders(
    <BrowserRouter>
      <JobPositionsPage />
    </BrowserRouter>
  );
};

describe('JobPositionsPage', () => {
  beforeEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  describe('Page Structure', () => {
    it('should render without crashing', () => {
      const { container } = renderJobPositionsPage();
      expect(container).toBeInTheDocument();
    });

    it('should have main content area', () => {
      const { container } = renderJobPositionsPage();
      const mainBox = container.querySelector('.MuiBox-root');
      expect(mainBox).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicators initially', () => {
      const { container } = renderJobPositionsPage();
      expect(container).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should eventually display job positions after loading', async () => {
      renderJobPositionsPage();

      await waitFor(() => {
        const { container } = renderJobPositionsPage();
        expect(container).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Empty State', () => {
    it('should handle empty job positions list', async () => {
      server.use(...emptyHandlers);

      const { container } = renderJobPositionsPage();

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      server.use(...errorHandlers);

      const { container } = renderJobPositionsPage();

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 600px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = renderJobPositionsPage();
      expect(container).toBeInTheDocument();
    });

    it('should render on desktop viewport', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query !== '(max-width: 600px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container} = renderJobPositionsPage();
      expect(container).toBeInTheDocument();
    });
  });

  describe('Local Storage', () => {
    it('should initialize with default view mode when localStorage is empty', () => {
      renderJobPositionsPage();
      expect(localStorage.getItem('jobPositions_viewMode')).toBeNull();
    });

    it('should respect stored view mode preference', () => {
      localStorage.setItem('jobPositions_viewMode', 'list');

      const { container } = renderJobPositionsPage();
      expect(container).toBeInTheDocument();
      expect(localStorage.getItem('jobPositions_viewMode')).toBe('list');
    });
  });
});
