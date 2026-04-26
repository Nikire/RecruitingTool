import { Button, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

/**
 * TestConnectionButton - Button for testing service connections
 *
 * @description Reusable button component for testing integrations and services
 * Shows loading state during testing and supports custom labels
 */

export interface TestConnectionButtonProps {
  /** Function to execute when button is clicked */
  onTest: () => void | Promise<void>;
  /** Whether the test is currently running */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom button label (i18n key), defaults to 'settings.test_connection' */
  label?: string;
  /** Button size */
  size?: "small" | "medium" | "large";
  /** Button variant */
  variant?: "text" | "outlined" | "contained";
}

const TestConnectionButton: React.FC<TestConnectionButtonProps> = ({
  onTest,
  isLoading = false,
  disabled = false,
  label = "settings.test_connection",
  size = "small",
  variant = "contained",
}) => {
  const { t } = useTranslation();

  const handleClick = async () => {
    await onTest();
  };

  return (
    <Button
      variant={variant}
      color="secondary"
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
      startIcon={
        isLoading ? (
          <CircularProgress size={16} />
        ) : (
          <PlayArrowIcon fontSize="small" />
        )
      }
      sx={{ minWidth: 120 }}
    >
      {isLoading ? t("settings.testing") : t(label)}
    </Button>
  );
};

export default TestConnectionButton;
