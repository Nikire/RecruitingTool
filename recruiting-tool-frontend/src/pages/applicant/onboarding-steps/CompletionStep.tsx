import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { authKeys } from "../../../api/queryKeys";
import { usersApi } from "../../../api/users";
import { OnboardingData } from "../ApplicantOnboarding";
import { useUpdateProfile } from "../../../hooks/api/useAuth";
import { useUserAtom } from "../../../store";

interface CompletionStepProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  onComplete,
  onBack,
}) => {
  const { t } = useTranslation();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { user, setUser } = useUserAtom();
  const queryClient = useQueryClient();

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      // The name is required by the profile step but /users/profile does not
      // accept it, so persist it through the user endpoint when it changed.
      const fullName = data.fullName?.trim();
      if (user && fullName && fullName !== user.name) {
        await usersApi.update(user.uid, { name: fullName });
      }

      // Save profile data to backend
      await updateProfile({
        phoneNumber: data.phoneNumber,
        location: data.location,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
      });

      // Call backend to mark onboarding as complete
      await axios.post("/auth/complete-onboarding");

      // The cached /auth/me still says onboardingCompleted=false (5 min
      // staleTime) and useUpdateProfile just re-seeded it, so refresh both the
      // cache and the atom - otherwise ProtectedRoute sends the applicant back
      // into this wizard on the next protected route they open.
      if (user) {
        setUser({
          ...user,
          name: fullName || user.name,
          onboardingCompleted: true,
        });
      }
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });

      // Navigate to careers page
      onComplete();
    } catch (err: unknown) {
      console.error("Error completing onboarding:", err);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ||
          t("applicant_onboarding.completion.error"),
      );
      setIsCompleting(false);
    }
  };

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
      <CheckCircleIcon sx={{ fontSize: 80, color: "success.main" }} />

      <Typography variant="h4" component="h1" gutterBottom>
        {t("applicant_onboarding.completion.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
        {t("applicant_onboarding.completion.subtitle")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: 600 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2, textAlign: "left", maxWidth: 500 }}>
        <Typography variant="h6" gutterBottom>
          {t("applicant_onboarding.completion.summary")}
        </Typography>

        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>{t("applicant_onboarding.completion.profile")}:</strong>{" "}
            {data.fullName || t("common.n_a")}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>{t("applicant_onboarding.completion.location")}:</strong>{" "}
            {data.location || t("common.n_a")}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>{t("applicant_onboarding.completion.resume")}:</strong>{" "}
            {data.resumeFile
              ? data.resumeFile.name
              : data.resumeSkipped
                ? t("applicant_onboarding.completion.skipped")
                : t("common.n_a")}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          mt: 4,
        }}
      >
        <Button onClick={onBack} disabled={isCompleting}>
          {t("common.back")}
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleComplete}
          disabled={isCompleting}
          startIcon={
            isCompleting ? <CircularProgress size={20} /> : <CheckCircleIcon />
          }
        >
          {isCompleting
            ? t("applicant_onboarding.completion.completing")
            : t("applicant_onboarding.completion.finish")}
        </Button>
      </Box>
    </Box>
  );
};

export default CompletionStep;
