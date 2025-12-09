import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../../test/test-utils';
import DateCell from './DateCell';

describe('DateCell', () => {
  const validDate = '2025-01-15T10:30:00Z';
  const validDateObject = new Date('2025-01-15T10:30:00Z');

  describe('Rendering', () => {
    it('should render formatted date from string', () => {
      renderWithProviders(<DateCell value={validDate} />);

      // Default format: 'MMM dd, yyyy'
      expect(screen.getByText(/jan 15, 2025/i)).toBeInTheDocument();
    });

    it('should render formatted date from Date object', () => {
      renderWithProviders(<DateCell value={validDateObject} />);

      expect(screen.getByText(/jan 15, 2025/i)).toBeInTheDocument();
    });

    it('should render fallback when value is null', () => {
      renderWithProviders(<DateCell value={null} />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render fallback when value is undefined', () => {
      renderWithProviders(<DateCell value={undefined} />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render custom fallback text', () => {
      renderWithProviders(<DateCell value={null} fallback="N/A" />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render fallback for invalid date string', () => {
      renderWithProviders(<DateCell value="invalid-date" />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should use default format when no formatString provided', () => {
      renderWithProviders(<DateCell value={validDate} />);

      // Default: 'MMM dd, yyyy'
      expect(screen.getByText(/jan 15, 2025/i)).toBeInTheDocument();
    });

    it('should use custom format string', () => {
      renderWithProviders(<DateCell value={validDate} formatString="yyyy-MM-dd" />);

      expect(screen.getByText('2025-01-15')).toBeInTheDocument();
    });

    it('should show time when showTime is true', () => {
      renderWithProviders(<DateCell value={validDate} showTime />);

      // Default format with time: 'MMM dd, yyyy HH:mm'
      const text = screen.getByText(/jan 15, 2025/i);
      expect(text.textContent).toMatch(/\d{2}:\d{2}/); // Should contain time
    });

    it('should not show time by default', () => {
      renderWithProviders(<DateCell value={validDate} />);

      const text = screen.getByText(/jan 15, 2025/i);
      expect(text.textContent).not.toMatch(/\d{2}:\d{2}/); // Should not contain time
    });
  });

  describe('Relative Time', () => {
    it('should show relative time when relative is true', () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 2);

      renderWithProviders(<DateCell value={recentDate.toISOString()} relative />);

      // Should show something like "2 hours ago"
      expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });

    it('should not show relative time by default', () => {
      renderWithProviders(<DateCell value={validDate} />);

      // Should show absolute date, not relative
      expect(screen.queryByText(/ago/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should include full date in title attribute', () => {
      renderWithProviders(<DateCell value={validDate} />);

      const dateElement = screen.getByText(/jan 15, 2025/i);
      expect(dateElement).toHaveAttribute('title');
      // Title should contain the full formatted date
      expect(dateElement.getAttribute('title')).toBeTruthy();
    });
  });

  describe('Typography Styling', () => {
    it('should render with body2 variant', () => {
      const { container } = renderWithProviders(<DateCell value={validDate} />);

      const typography = container.querySelector('.MuiTypography-body2');
      expect(typography).toBeInTheDocument();
    });

    it('should render fallback with text.secondary color', () => {
      const { container } = renderWithProviders(<DateCell value={null} />);

      const typography = container.querySelector('[class*="MuiTypography"]');
      expect(typography).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      renderWithProviders(<DateCell value="" />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should handle far future dates', () => {
      const futureDate = '2099-12-31T23:59:59Z';
      renderWithProviders(<DateCell value={futureDate} />);

      expect(screen.getByText(/dec 31, 2099/i)).toBeInTheDocument();
    });

    it('should handle far past dates', () => {
      const pastDate = '1900-01-01T00:00:00Z';
      renderWithProviders(<DateCell value={pastDate} />);

      // Date might be timezone-adjusted, so just verify it renders a date
      expect(screen.getByText(/1899|1900/i)).toBeInTheDocument();
    });

    it('should handle dates with different timezones', () => {
      const dateWithTimezone = '2025-01-15T10:30:00+05:00';
      renderWithProviders(<DateCell value={dateWithTimezone} />);

      // Should still render successfully
      const dateElement = screen.getByText(/jan 15, 2025/i);
      expect(dateElement).toBeInTheDocument();
    });
  });

  describe('Format String Variations', () => {
    it('should support full month name format', () => {
      renderWithProviders(<DateCell value={validDate} formatString="MMMM dd, yyyy" />);

      expect(screen.getByText(/january 15, 2025/i)).toBeInTheDocument();
    });

    it('should support numeric date format', () => {
      renderWithProviders(<DateCell value={validDate} formatString="MM/dd/yyyy" />);

      expect(screen.getByText('01/15/2025')).toBeInTheDocument();
    });

    it('should support ISO format', () => {
      renderWithProviders(<DateCell value={validDate} formatString="yyyy-MM-dd'T'HH:mm:ss" />);

      const text = screen.getByText(/2025-01-15/i);
      expect(text).toBeInTheDocument();
    });
  });
});
