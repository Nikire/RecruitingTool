import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";

const BookingConfirmedPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: 100, color: "success.main", mb: 3 }} />

        <Typography variant="h3" component="h1" gutterBottom>
          {t("booking.confirmed_title")}
        </Typography>

        <Typography variant="h6" color="text.secondary" paragraph>
          {t("booking.confirmed_message")}
        </Typography>

        <Box
          sx={{ mt: 4, p: 3, bgcolor: "background.default", borderRadius: 2 }}
        >
          <EmailIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {t("booking.email_confirmation")}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          {t("booking.calendar_instructions")}
        </Typography>
      </Paper>
    </Container>
  );
};

export default BookingConfirmedPage;
