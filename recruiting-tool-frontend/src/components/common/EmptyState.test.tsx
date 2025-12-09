import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../test/test-utils';
import EmptyState from './EmptyState';
import SearchIcon from '@mui/icons-material/Search';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render message', () => {
      renderWithProviders(<EmptyState message="common.loading" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render default inbox icon when no icon provided', () => {
      const { container } = renderWithProviders(<EmptyState message="common.loading" />);

      const icon = container.querySelector('[data-testid="InboxIcon"]');
      expect(icon).toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      renderWithProviders(
        <EmptyState
          message="common.loading"
          icon={<SearchIcon data-testid="custom-search-icon" />}
        />
      );

      expect(screen.getByTestId('custom-search-icon')).toBeInTheDocument();
    });

    it('should not render action button when no action provided', () => {
      renderWithProviders(<EmptyState message="common.loading" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render action button when action provided', () => {
      const mockAction = vi.fn();
      renderWithProviders(
        <EmptyState
          message="common.loading"
          action={{ label: 'common.create', onClick: mockAction }}
        />
      );

      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call action onClick when button clicked', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      renderWithProviders(
        <EmptyState
          message="common.loading"
          action={{ label: 'common.create', onClick: mockAction }}
        />
      );

      const button = screen.getByRole('button', { name: /create/i });
      await user.click(button);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should call action multiple times when clicked multiple times', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      renderWithProviders(
        <EmptyState
          message="common.loading"
          action={{ label: 'common.create', onClick: mockAction }}
        />
      );

      const button = screen.getByRole('button', { name: /create/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockAction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Internationalization', () => {
    it('should translate message using i18n', () => {
      renderWithProviders(<EmptyState message="common.cancel" />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should translate action label using i18n', () => {
      const mockAction = vi.fn();

      renderWithProviders(
        <EmptyState
          message="common.loading"
          action={{ label: 'common.submit', onClick: mockAction }}
        />
      );

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render inside Paper component', () => {
      const { container } = renderWithProviders(<EmptyState message="common.loading" />);

      const paper = container.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
    });

    it('should center content', () => {
      const { container } = renderWithProviders(<EmptyState message="common.loading" />);

      const paper = container.querySelector('.MuiPaper-root');
      const styles = window.getComputedStyle(paper!);
      expect(styles.textAlign).toBe('center');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message gracefully', () => {
      renderWithProviders(<EmptyState message="" />);

      // Should render without crashing
      const paper = screen.getByRole('heading').closest('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
    });

    it('should handle action with empty label', () => {
      const mockAction = vi.fn();

      renderWithProviders(
        <EmptyState message="common.loading" action={{ label: '', onClick: mockAction }} />
      );

      // Button should still render but with empty text
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});
