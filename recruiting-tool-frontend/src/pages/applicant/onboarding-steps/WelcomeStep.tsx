import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 3,
        py: 4,
      }}
    >
      <WavingHandIcon sx={{ fontSize: 80, color: "primary.main" }} />

      <Typography variant="h4" component="h1" gutterBottom>
        {t("applicant_onboarding.welcome.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
        {t("applicant_onboarding.welcome.subtitle")}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("applicant_onboarding.welcome.what_to_expect")}
        </Typography>
        <Box component="ul" sx={{ textAlign: "left", maxWidth: 500 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {t("applicant_onboarding.welcome.step1_desc")}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {t("applicant_onboarding.welcome.step2_desc")}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            {t("applicant_onboarding.welcome.step3_desc")}
          </Typography>
          <Typography component="li" variant="body2">
            {t("applicant_onboarding.welcome.step4_desc")}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={onNext}
        startIcon={<RocketLaunchIcon />}
        sx={{ mt: 3 }}
      >
        {t("applicant_onboarding.welcome.get_started")}
      </Button>
    </Box>
  );
};

export default WelcomeStep;
