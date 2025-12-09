import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test/test-utils';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('should render circular progress indicator', () => {
      const { container } = renderWithProviders(<LoadingSpinner />);

      const spinner = container.querySelector('.MuiCircularProgress-root');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with default size', () => {
      const { container } = renderWithProviders(<LoadingSpinner />);

      const spinner = container.querySelector('.MuiCircularProgress-root');
      expect(spinner).toBeInTheDocument();
      // Default size (40px) is applied via inline styles
      expect(spinner).toHaveStyle({ width: '40px', height: '40px' });
    });

    it('should render with custom size', () => {
      const { container } = renderWithProviders(<LoadingSpinner size={60} />);

      const spinner = container.querySelector('.MuiCircularProgress-root');
      expect(spinner).toBeInTheDocument();
      // Size is applied via inline styles
      expect(spinner).toHaveStyle({ width: '60px', height: '60px' });
    });

    it('should not render message by default', () => {
      renderWithProviders(<LoadingSpinner />);

      // Should only have the loading spinner, no text
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('should render message when provided', () => {
      renderWithProviders(<LoadingSpinner message="common.loading" />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render message below spinner', () => {
      const { container } = renderWithProviders(<LoadingSpinner message="common.loading" />);

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toHaveStyle({ flexDirection: 'column' });
    });
  });

  describe('Styling', () => {
    it('should apply default padding', () => {
      const { container } = renderWithProviders(<LoadingSpinner />);

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      // Default padding is 4 (theme spacing units)
      expect(wrapper).toBeInTheDocument();
    });

    it('should apply custom padding', () => {
      const { container } = renderWithProviders(<LoadingSpinner padding={8} />);

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should center spinner and message', () => {
      const { container } = renderWithProviders(<LoadingSpinner message="common.loading" />);

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      });
    });

    it('should render message as secondary text', () => {
      renderWithProviders(<LoadingSpinner message="common.loading" />);

      const message = screen.getByText(/loading/i);
      expect(message).toHaveClass('MuiTypography-body2');
    });
  });

  describe('Accessibility', () => {
    it('should have progressbar role on spinner', () => {
      renderWithProviders(<LoadingSpinner />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('should be properly announced to screen readers', () => {
      renderWithProviders(<LoadingSpinner />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      // CircularProgress has indeterminate state, no aria-valuenow
    });
  });

  describe('Prop Combinations', () => {
    it('should work with all props provided', () => {
      const { container } = renderWithProviders(
        <LoadingSpinner size={80} padding={10} message="common.loading" />
      );

      const spinner = container.querySelector('.MuiCircularProgress-root');
      expect(spinner).toHaveStyle({ width: '80px', height: '80px' });
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should work with no props', () => {
      const { container } = renderWithProviders(<LoadingSpinner />);

      const spinner = container.querySelector('.MuiCircularProgress-root');
      expect(spinner).toBeInTheDocument();
    });

    it('should work with only size prop', () => {
      const { container } = renderWithProviders(<LoadingSpinner size={100} />);

      const spinner = container.querySelector('.MuiCircularProgress-root');
      expect(spinner).toHaveStyle({ width: '100px', height: '100px' });
    });

    it('should work with only padding prop', () => {
      const { container } = renderWithProviders(<LoadingSpinner padding={2} />);

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should work with only message prop', () => {
      renderWithProviders(<LoadingSpinner message="common.loading" />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
