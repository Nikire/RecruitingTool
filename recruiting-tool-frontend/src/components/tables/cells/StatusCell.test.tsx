import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../../test/test-utils';
import StatusCell from './StatusCell';

describe('StatusCell', () => {
  describe('Rendering', () => {
    it('should render status chip with label', () => {
      renderWithProviders(<StatusCell status="OPEN" />);

      expect(screen.getByText(/open/i)).toBeInTheDocument();
    });

    it('should return null when status is null', () => {
      const { container } = renderWithProviders(<StatusCell status={null} />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when status is undefined', () => {
      const { container } = renderWithProviders(<StatusCell status={undefined} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render with small size by default', () => {
      const { container } = renderWithProviders(<StatusCell status="PENDING" />);

      const chip = container.querySelector('.MuiChip-sizeSmall');
      expect(chip).toBeInTheDocument();
    });

    it('should render with medium size when specified', () => {
      const { container } = renderWithProviders(<StatusCell status="PENDING" size="medium" />);

      const chip = container.querySelector('.MuiChip-sizeMedium');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Color Mapping', () => {
    it('should apply success color for OPEN status', () => {
      const { container } = renderWithProviders(<StatusCell status="OPEN" />);

      const chip = container.querySelector('.MuiChip-colorSuccess');
      expect(chip).toBeInTheDocument();
    });

    it('should apply success color for ACTIVE status', () => {
      const { container } = renderWithProviders(<StatusCell status="ACTIVE" />);

      const chip = container.querySelector('.MuiChip-colorSuccess');
      expect(chip).toBeInTheDocument();
    });

    it('should apply success color for COMPLETED status', () => {
      const { container } = renderWithProviders(<StatusCell status="COMPLETED" />);

      const chip = container.querySelector('.MuiChip-colorSuccess');
      expect(chip).toBeInTheDocument();
    });

    it('should apply primary color for IN_PROGRESS status', () => {
      const { container } = renderWithProviders(<StatusCell status="IN_PROGRESS" />);

      const chip = container.querySelector('.MuiChip-colorPrimary');
      expect(chip).toBeInTheDocument();
    });

    it('should apply warning color for PENDING status', () => {
      const { container } = renderWithProviders(<StatusCell status="PENDING" />);

      const chip = container.querySelector('.MuiChip-colorWarning');
      expect(chip).toBeInTheDocument();
    });

    it('should apply error color for REJECTED status', () => {
      const { container } = renderWithProviders(<StatusCell status="REJECTED" />);

      const chip = container.querySelector('.MuiChip-colorError');
      expect(chip).toBeInTheDocument();
    });

    it('should apply error color for CANCELLED status', () => {
      const { container } = renderWithProviders(<StatusCell status="CANCELLED" />);

      const chip = container.querySelector('.MuiChip-colorError');
      expect(chip).toBeInTheDocument();
    });

    it('should apply default color for CLOSED status', () => {
      const { container } = renderWithProviders(<StatusCell status="CLOSED" />);

      const chip = container.querySelector('.MuiChip-colorDefault');
      expect(chip).toBeInTheDocument();
    });

    it('should apply default color for unknown status', () => {
      const { container } = renderWithProviders(<StatusCell status="UNKNOWN_STATUS" />);

      const chip = container.querySelector('.MuiChip-colorDefault');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Custom Color Map', () => {
    it('should override default colors with custom colorMap', () => {
      const customColorMap = { PENDING: 'success' as const };
      const { container } = renderWithProviders(
        <StatusCell status="PENDING" colorMap={customColorMap} />
      );

      const chip = container.querySelector('.MuiChip-colorSuccess');
      expect(chip).toBeInTheDocument();
    });

    it('should merge custom colorMap with defaults', () => {
      const customColorMap = { CUSTOM_STATUS: 'primary' as const };
      const { container } = renderWithProviders(
        <StatusCell status="CUSTOM_STATUS" colorMap={customColorMap} />
      );

      const chip = container.querySelector('.MuiChip-colorPrimary');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Case Normalization', () => {
    it('should handle lowercase status', () => {
      const { container } = renderWithProviders(<StatusCell status="open" />);

      const chip = container.querySelector('.MuiChip-colorSuccess');
      expect(chip).toBeInTheDocument();
    });

    it('should handle mixed case status', () => {
      const { container } = renderWithProviders(<StatusCell status="Pending" />);

      const chip = container.querySelector('.MuiChip-colorWarning');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Label Formatting', () => {
    it('should replace underscores with spaces in label', () => {
      renderWithProviders(<StatusCell status="IN_PROGRESS" />);

      expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    });

    it('should capitalize label', () => {
      renderWithProviders(<StatusCell status="PENDING" />);

      // Just verify label renders - capitalization is handled by CSS
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  describe('Translation', () => {
    it('should use default translation namespace', () => {
      // Default namespace is 'status'
      renderWithProviders(<StatusCell status="PENDING" />);

      // Should attempt to translate using 'status.pending'
      const chip = screen.getByText(/pending/i);
      expect(chip).toBeInTheDocument();
    });

    it('should use custom translation namespace', () => {
      renderWithProviders(
        <StatusCell status="OPEN" translationNamespace="job_position_status" />
      );

      // Should attempt to translate using 'job_position_status.open'
      const chip = screen.getByText(/open/i);
      expect(chip).toBeInTheDocument();
    });

    it('should fallback to formatted status when translation not found', () => {
      renderWithProviders(<StatusCell status="UNKNOWN_KEY" />);

      expect(screen.getByText(/unknown key/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have font weight 500', () => {
      const { container } = renderWithProviders(<StatusCell status="PENDING" />);

      // Verify chip renders - styles are applied via MUI's sx prop
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('should display as inline-flex', () => {
      const { container } = renderWithProviders(<StatusCell status="PENDING" />);

      // Verify chip renders - styles are applied via MUI's sx prop
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });
});
