import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface PageHeaderProps {
  title: string; // i18n key or plain text (based on translate prop)
  subtitle?: string; // Optional subtitle/description (i18n key or plain text)
  action?: {
    label: string; // i18n key or plain text (based on translate prop)
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "contained" | "outlined";
    disabled?: boolean;
    ariaLabel?: string; // Optional aria-label for accessibility
  };
  secondaryActions?: React.ReactNode; // Optional additional actions/buttons
  translate?: boolean; // Whether to translate title/action.label (default: true)
}

/**
 * PageHeader - Consistent page header with optional action button
 * Used across pages for unified header styling and structure
 *
 * Features:
 * - Responsive layout (column on mobile, row on desktop)
 * - Optional subtitle for additional context
 * - Primary action button with icon support
 * - Secondary actions slot for custom content
 * - Full i18n support with optional translation toggle
 * - Touch-friendly minimum button height (44px)
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  secondaryActions,
  translate = true,
}) => {
  const { t } = useTranslation();

  // Display text (translate if enabled, otherwise use as-is)
  const displayTitle = translate ? t(title) : title;
  const displaySubtitle = subtitle
    ? translate
      ? t(subtitle)
      : subtitle
    : undefined;
  const displayActionLabel = action
    ? translate
      ? t(action.label)
      : action.label
    : "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        mb: { xs: 2, sm: 3 },
        gap: 2,
      }}
    >
      {/* Title and Subtitle */}
      <Box>
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" }, fontWeight: 700 }}
        >
          {displayTitle}
        </Typography>
        {displaySubtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {displaySubtitle}
          </Typography>
        )}
      </Box>

      {/* Actions Container */}
      {(action || secondaryActions) && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {/* Secondary Actions Slot */}
          {secondaryActions}

          {/* Primary Action Button */}
          {action && (
            <Button
              variant={action.variant || "contained"}
              startIcon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minHeight: "44px",
              }}
            >
              {displayActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
