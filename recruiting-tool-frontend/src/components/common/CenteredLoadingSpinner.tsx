import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * CenteredLoadingSpinner - Reusable centered loading spinner with optional message
 *
 * @component
 * @example
 * // Basic usage
 * <CenteredLoadingSpinner />
 *
 * @example
 * // With custom height
 * <CenteredLoadingSpinner minHeight="100vh" />
 *
 * @example
 * // With loading message (i18n key)
 * <CenteredLoadingSpinner message="common.loading" />
 *
 * @example
 * // With custom size
 * <CenteredLoadingSpinner size={80} />
 */

export interface CenteredLoadingSpinnerProps {
  /** Minimum height of the loading container (default: '50vh') */
  minHeight?: string | number;
  /** Size of the CircularProgress spinner (default: 40) */
  size?: number;
  /** Optional loading message (i18n key) - will be translated if provided */
  message?: string;
}

const CenteredLoadingSpinner: React.FC<CenteredLoadingSpinnerProps> = ({
  minHeight = "50vh",
  size = 40,
  message,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight,
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {t(message)}
        </Typography>
      )}
    </Box>
  );
};

export default CenteredLoadingSpinner;
