import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useTranslation } from "react-i18next";

interface ComingSoonPageProps {
  titleKey?: string;
  messageKey?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  titleKey = "coming_soon.title",
  messageKey = "coming_soon.message",
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: { xs: 4, sm: 6 },
          textAlign: "center",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <HourglassEmptyIcon sx={{ fontSize: 72, color: "text.disabled" }} />
        </Box>

        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t(titleKey)}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          {t(messageKey)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ComingSoonPage;
