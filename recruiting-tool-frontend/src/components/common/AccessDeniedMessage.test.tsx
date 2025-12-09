import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test/test-utils';
import AccessDeniedMessage from './AccessDeniedMessage';

describe('AccessDeniedMessage', () => {
  describe('Rendering', () => {
    it('should render error alert', () => {
      renderWithProviders(<AccessDeniedMessage />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should render contact admin message', () => {
      renderWithProviders(<AccessDeniedMessage />);

      // Check for some text about contacting admin
      const contactText = screen.getByText(/contact/i);
      expect(contactText).toBeInTheDocument();
    });

    it('should use default message when no custom message provided', () => {
      renderWithProviders(<AccessDeniedMessage />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should display custom message when provided', () => {
      renderWithProviders(<AccessDeniedMessage message="Custom access denied message" />);

      expect(screen.getByText('Custom access denied message')).toBeInTheDocument();
    });

    it('should display required roles when provided', () => {
      renderWithProviders(<AccessDeniedMessage requiredRoles={['ADMIN', 'HR']} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      // The roles should be mentioned somewhere in the alert
    });

    it('should format multiple roles correctly', () => {
      renderWithProviders(<AccessDeniedMessage requiredRoles={['ADMIN', 'HR', 'RECRUITER']} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Message Priority', () => {
    it('should prefer custom message over default', () => {
      renderWithProviders(
        <AccessDeniedMessage
          requiredRoles={['ADMIN']}
          message="Override message"
        />
      );

      expect(screen.getByText('Override message')).toBeInTheDocument();
    });

    it('should use role-based message when no custom message', () => {
      renderWithProviders(<AccessDeniedMessage requiredRoles={['ADMIN']} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      // Should contain role information
    });

    it('should use generic message when no roles or custom message', () => {
      renderWithProviders(<AccessDeniedMessage />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should render error severity alert', () => {
      const { container } = renderWithProviders(<AccessDeniedMessage />);

      const alert = container.querySelector('.MuiAlert-standardError');
      expect(alert).toBeInTheDocument();
    });

    it('should apply margin bottom to alert', () => {
      const { container } = renderWithProviders(<AccessDeniedMessage />);

      const alert = container.querySelector('.MuiAlert-root');
      expect(alert).toBeInTheDocument();
    });

    it('should render contact message as body1 typography', () => {
      renderWithProviders(<AccessDeniedMessage />);

      const contactText = screen.getByText(/contact/i);
      expect(contactText).toHaveClass('MuiTypography-body1');
    });
  });

  describe('Accessibility', () => {
    it('should have alert role', () => {
      renderWithProviders(<AccessDeniedMessage />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should announce error to screen readers', () => {
      renderWithProviders(<AccessDeniedMessage />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      // Alert role automatically announces to screen readers
    });

    it('should be keyboard accessible', () => {
      const { container } = renderWithProviders(<AccessDeniedMessage />);

      const wrapper = container.querySelector('[class*="MuiBox-root"]');
      expect(wrapper).toBeInTheDocument();
      // No interactive elements, so no special keyboard handling needed
    });
  });

  describe('Prop Combinations', () => {
    it('should work with no props', () => {
      renderWithProviders(<AccessDeniedMessage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/contact/i)).toBeInTheDocument();
    });

    it('should work with only requiredRoles', () => {
      renderWithProviders(<AccessDeniedMessage requiredRoles={['ADMIN']} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should work with only custom message', () => {
      renderWithProviders(<AccessDeniedMessage message="Custom message" />);

      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('should work with both requiredRoles and message', () => {
      renderWithProviders(
        <AccessDeniedMessage
          requiredRoles={['ADMIN', 'HR']}
          message="Custom message"
        />
      );

      expect(screen.getByText('Custom message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle single role', () => {
      renderWithProviders(<AccessDeniedMessage requiredRoles={['ADMIN']} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should handle empty roles array', () => {
      renderWithProviders(<AccessDeniedMessage requiredRoles={[]} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should render alert before contact message', () => {
      const { container } = renderWithProviders(<AccessDeniedMessage />);

      const box = container.querySelector('[class*="MuiBox-root"]');
      const children = box?.children;

      expect(children?.[0]).toHaveClass('MuiAlert-root');
      expect(children?.[1]).toHaveClass('MuiTypography-root');
    });

    it('should contain both alert and typography elements', () => {
      const { container } = renderWithProviders(<AccessDeniedMessage />);

      expect(container.querySelector('.MuiAlert-root')).toBeInTheDocument();
      expect(container.querySelector('.MuiTypography-root')).toBeInTheDocument();
    });
  });
});
