import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface LoadingSpinnerProps {
  size?: number;
  padding?: number;
  message?: string; // i18n key
}

/**
 * LoadingSpinner - Consistent loading spinner component
 * Used for data fetching loading states across the application
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  padding = 4,
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
        p: padding,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t(message)}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
