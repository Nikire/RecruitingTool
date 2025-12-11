import { Button, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Props for the QuickActionButton component
 */
export interface QuickActionButtonProps {
  /** Icon element to display at the start of the button */
  icon: React.ReactNode;
  /** Button label (can be i18n key or plain text) */
  label: string;
  /** Click handler for the button */
  onClick: () => void;
  /** Whether to translate the label using i18n (default: false) */
  translate?: boolean;
  /** Grid size for xs breakpoint (default: 12) */
  xs?: number;
  /** Grid size for sm breakpoint (default: 6) */
  sm?: number;
  /** Grid size for md breakpoint (default: 4) */
  md?: number;
}

/**
 * QuickActionButton - Reusable quick action button component for dashboards
 *
 * Renders a full-width outlined button with an icon inside a Material-UI Grid item.
 * Commonly used for dashboard quick actions that navigate to different pages.
 *
 * Automatically wraps itself in a Grid item for consistent layout.
 *
 * @example
 * ```tsx
 * <QuickActionButton
 *   icon={<WorkIcon />}
 *   label="dashboard.manage_positions"
 *   onClick={() => navigate('/hr/job-positions')}
 *   translate
 * />
 * ```
 *
 * @example Without Grid wrapper (custom layout)
 * ```tsx
 * <Button {...} /> // Use Material-UI Button directly
 * ```
 *
 * @component
 * @category Dashboard
 */
const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  translate = false,
  xs = 12,
  sm = 6,
  md = 4,
}) => {
  const { t } = useTranslation();

  const displayLabel = translate ? t(label) : label;

  return (
    <Grid item xs={xs} sm={sm} md={md}>
      <Button
        variant="outlined"
        fullWidth
        startIcon={icon}
        onClick={onClick}
        sx={{ py: 2 }}
      >
        {displayLabel}
      </Button>
    </Grid>
  );
};

export default QuickActionButton;
