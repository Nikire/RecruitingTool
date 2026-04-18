import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";

const BookingDemoConfirmedPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: 100, color: "success.main", mb: 3 }} />

        <Typography variant="h3" component="h1" gutterBottom>
          {t("contact.book_demo_confirmed_title")}
        </Typography>

        <Typography variant="h6" color="text.secondary" paragraph>
          {t("contact.book_demo_confirmed_subtitle")}
        </Typography>

        <Box
          sx={{ mt: 4, p: 3, bgcolor: "background.default", borderRadius: 2 }}
        >
          <EmailIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {t("contact.book_demo_confirmed_message")}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingDemoConfirmedPage;
