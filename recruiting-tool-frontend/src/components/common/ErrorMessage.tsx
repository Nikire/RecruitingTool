import { Box, Alert, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  message: string; // i18n key
  error?: Error;
  retry?: () => void;
}

/**
 * ErrorMessage - Consistent error message component
 * Used for displaying error states with optional retry functionality
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  error,
  retry,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {t(message)}
      </Alert>
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error.message}
        </Typography>
      )}
      {retry && (
        <Button variant="contained" color="error" onClick={retry}>
          {t("common.retry")}
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;
