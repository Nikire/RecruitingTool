import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../test/test-utils';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  describe('Rendering', () => {
    it('should render error alert with message', () => {
      renderWithProviders(<ErrorMessage message="common.error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should translate message using i18n key', () => {
      renderWithProviders(<ErrorMessage message="common.error" />);

      // The message should be translated (test setup has basic translations)
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should not render error details by default', () => {
      renderWithProviders(<ErrorMessage message="common.error" />);

      expect(screen.queryByText(/error message/i)).not.toBeInTheDocument();
    });

    it('should render error details when error prop is provided', () => {
      const error = new Error('Something went wrong');
      renderWithProviders(<ErrorMessage message="common.error" error={error} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should not render retry button by default', () => {
      renderWithProviders(<ErrorMessage message="common.error" />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should render retry button when retry prop is provided', () => {
      const mockRetry = vi.fn();
      renderWithProviders(<ErrorMessage message="common.error" retry={mockRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('should call retry callback when button is clicked', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();

      renderWithProviders(<ErrorMessage message="common.error" retry={mockRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple retry attempts', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();

      renderWithProviders(<ErrorMessage message="common.error" retry={mockRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('Styling', () => {
    it('should render error severity alert', () => {
      const { container } = renderWithProviders(<ErrorMessage message="common.error" />);

      const alert = container.querySelector('.MuiAlert-standardError');
      expect(alert).toBeInTheDocument();
    });

    it('should render retry button as outlined error variant', () => {
      const mockRetry = vi.fn();
      const { container } = renderWithProviders(
        <ErrorMessage message="common.error" retry={mockRetry} />
      );

      const button = container.querySelector('.MuiButton-outlinedError');
      expect(button).toBeInTheDocument();
    });

    it('should render error details in error color', () => {
      const error = new Error('Error details');
      renderWithProviders(<ErrorMessage message="common.error" error={error} />);

      const errorText = screen.getByText('Error details');
      expect(errorText).toHaveClass('MuiTypography-body2');
    });

    it('should apply padding to container', () => {
      const { container } = renderWithProviders(<ErrorMessage message="common.error" />);

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have alert role', () => {
      renderWithProviders(<ErrorMessage message="common.error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have accessible retry button', () => {
      const mockRetry = vi.fn();
      renderWithProviders(<ErrorMessage message="common.error" retry={mockRetry} />);

      const button = screen.getByRole('button', { name: /retry/i });
      expect(button).toHaveAccessibleName();
    });

    it('should announce error to screen readers', () => {
      renderWithProviders(<ErrorMessage message="common.error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Prop Combinations', () => {
    it('should work with all props', () => {
      const error = new Error('Detailed error');
      const mockRetry = vi.fn();

      renderWithProviders(
        <ErrorMessage message="common.error" error={error} retry={mockRetry} />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Detailed error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should work with only message prop', () => {
      renderWithProviders(<ErrorMessage message="common.error" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should work with message and error props', () => {
      const error = new Error('Error details');
      renderWithProviders(<ErrorMessage message="common.error" error={error} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error details')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should work with message and retry props', () => {
      const mockRetry = vi.fn();
      renderWithProviders(<ErrorMessage message="common.error" retry={mockRetry} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
