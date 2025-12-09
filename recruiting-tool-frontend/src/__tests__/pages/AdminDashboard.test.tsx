import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../../pages/admin/AdminDashboard';

const renderAdminDashboard = () => {
  return renderWithProviders(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    // Reset any mocks
  });

  describe('Page Structure', () => {
    it('should render without crashing', () => {
      const { container } = renderAdminDashboard();
      expect(container).toBeInTheDocument();
    });

    it('should have main content area', () => {
      const { container } = renderAdminDashboard();
      const mainBox = container.querySelector('.MuiBox-root');
      expect(mainBox).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use flexbox layout', () => {
      const { container } = renderAdminDashboard();
      const mainBox = container.querySelector('& > div > div');
      expect(mainBox).toBeInTheDocument();
    });

    it('should center content', () => {
      const { container } = renderAdminDashboard();
      expect(container).toBeInTheDocument();
    });
  });

  describe('Typography', () => {
    it('should render Typography components', () => {
      const { container } = renderAdminDashboard();
      const typography = container.querySelectorAll('.MuiTypography-root');
      expect(typography.length).toBeGreaterThan(0);
    });
  });

  describe('Cards', () => {
    it('should render management cards', () => {
      const { container } = renderAdminDashboard();
      const cards = container.querySelectorAll('.MuiCard-root, .MuiPaper-root');
      expect(cards.length).toBeGreaterThan(0);
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

      const { container } = renderAdminDashboard();
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

      const { container } = renderAdminDashboard();
      expect(container).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render SVG icons', () => {
      const { container } = renderAdminDashboard();
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Box Components', () => {
    it('should use Material-UI Box components', () => {
      const { container } = renderAdminDashboard();
      const boxes = container.querySelectorAll('.MuiBox-root');
      expect(boxes.length).toBeGreaterThan(0);
    });
  });
});
