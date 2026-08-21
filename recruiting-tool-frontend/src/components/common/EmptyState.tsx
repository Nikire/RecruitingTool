import { Paper, Typography, Button, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import InboxIcon from "@mui/icons-material/Inbox";

/**
 * A call-to-action rendered inside an empty state.
 * `label` is an i18n key, never a literal string.
 */
export interface EmptyStateAction {
  /** i18n key */
  label: string;
  onClick: () => void;
  /** Optional leading icon for the button */
  startIcon?: React.ReactNode;
}

export interface EmptyStateProps {
  /** i18n key for the headline */
  message: string;
  /** Interpolation values for `message` */
  messageValues?: Record<string, unknown>;
  /** i18n key for the supporting sentence under the headline */
  description?: string;
  /** Interpolation values for `description` */
  descriptionValues?: Record<string, unknown>;
  icon?: React.ReactNode;
  /** Primary call-to-action that resolves the emptiness */
  action?: EmptyStateAction;
  /** Optional secondary call-to-action (rendered as a text button) */
  secondaryAction?: EmptyStateAction;
  /**
   * "paper" (default) renders on its own surface.
   * "plain" renders with no surface/padding of its own — use it when the
   * component is already inside a surface (e.g. a DataGrid overlay).
   */
  variant?: "paper" | "plain";
  /** Tighter vertical rhythm, for constrained containers */
  dense?: boolean;
}

/**
 * EmptyState - Consistent empty state component.
 *
 * Used when there's no data to display. Always prefer giving the user an
 * `action` that resolves the emptiness ("Post your first job", "Invite your
 * team") over a bare "no items" sentence.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  messageValues,
  description,
  descriptionValues,
  icon,
  action,
  secondaryAction,
  variant = "paper",
  dense = false,
}) => {
  const { t } = useTranslation();

  const content = (
    <>
      <Box sx={{ mb: dense ? 1 : 2, lineHeight: 0 }}>
        {icon || (
          <InboxIcon
            sx={{ fontSize: dense ? 40 : 48, color: "text.secondary" }}
          />
        )}
      </Box>
      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom={!description}
      >
        {t(message, messageValues)}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 480, mx: "auto", mb: dense ? 1 : 2 }}
        >
          {t(description, descriptionValues)}
        </Typography>
      )}
      {(action || secondaryAction) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: dense ? 1 : 2 }}
        >
          {action && (
            <Button
              variant="contained"
              onClick={action.onClick}
              startIcon={action.startIcon}
            >
              {t(action.label)}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="text"
              onClick={secondaryAction.onClick}
              startIcon={secondaryAction.startIcon}
            >
              {t(secondaryAction.label)}
            </Button>
          )}
        </Stack>
      )}
    </>
  );

  if (variant === "plain") {
    return (
      <Box sx={{ p: dense ? 2 : 4, textAlign: "center", width: "100%" }}>
        {content}
      </Box>
    );
  }

  return (
    <Paper sx={{ p: dense ? 2 : 4, textAlign: "center" }}>{content}</Paper>
  );
};

export default EmptyState;
