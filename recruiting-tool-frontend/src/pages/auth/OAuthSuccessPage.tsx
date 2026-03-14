import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * This page is loaded inside the OAuth popup window after a successful
 * authorization. It closes the popup so the parent window can detect
 * the closure and refresh the connection status.
 */
const OAuthSuccessPage = () => {
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
        Connected. Closing...
      </Typography>
    </Box>
  );
};

export default OAuthSuccessPage;
