import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useConsumeUnsubscribeToken } from "../../api/unsubscribe";

const UnsubscribePage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError } = useConsumeUnsubscribeToken(token ?? "");

  const isSuccess = !isLoading && !isError && data?.success === true;

  return (
    <Box
      sx={{
        // Not 100vh: this page renders inside MainLayout, below the navbar and
        // its toolbar spacer, so a full-viewport box would push the document
        // past the viewport and mis-centre the card.
        minHeight: { xs: "auto", sm: "60vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
        mt: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: { xs: 4, sm: 6 },
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        {isLoading && (
          <>
            <CircularProgress size={56} sx={{ mb: 3 }} />
            <Typography variant="body1" color="text.secondary">
              {t("unsubscribe.loading")}
            </Typography>
          </>
        )}

        {isSuccess && (
          <>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 72, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {t("unsubscribe.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("unsubscribe.message")}
            </Typography>
          </>
        )}

        {(isError || (!isLoading && !isSuccess)) && (
          <>
            <ErrorOutlineIcon
              sx={{ fontSize: 72, color: "warning.main", mb: 2 }}
            />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {t("unsubscribe.error_title")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("unsubscribe.error_message")}
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default UnsubscribePage;
