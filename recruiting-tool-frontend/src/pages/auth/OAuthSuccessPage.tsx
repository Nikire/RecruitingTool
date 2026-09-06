import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * This page is loaded inside the OAuth popup window after a successful
 * authorization. It closes the popup so the parent window can detect
 * the closure and refresh the connection status.
 */
const OAuthSuccessPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.close();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {t("calendar_settings.oauth_connected_closing")}
      </Typography>
    </Box>
  );
};

export default OAuthSuccessPage;
