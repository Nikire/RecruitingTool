import React, { useEffect } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useValidationRules } from "../../../utils/validation";
import FormErrorSummary from "../../../components/common/FormErrorSummary";
import { OnboardingData } from "../ApplicantOnboarding";

interface ProfileStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  location: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ data, onNext, onBack }) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: data.fullName || "",
      phoneNumber: data.phoneNumber || "",
      location: data.location || "",
      linkedinUrl: data.linkedinUrl || "",
      portfolioUrl: data.portfolioUrl || "",
    },
  });

  // When parent pre-populates onboarding data (e.g. from async user fetch),
  // reset the form so the fields reflect the latest values. We only do this
  // when at least one of the pre-fill fields is non-empty to avoid clearing
  // values the user has already typed.
  useEffect(() => {
    if (data.fullName || data.phoneNumber || data.location) {
      reset({
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        location: data.location || "",
        linkedinUrl: data.linkedinUrl || "",
        portfolioUrl: data.portfolioUrl || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.fullName,
    data.phoneNumber,
    data.location,
    data.linkedinUrl,
    data.portfolioUrl,
  ]);

  const onSubmit = (formData: ProfileFormData) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" gutterBottom>
        {t("applicant_onboarding.profile.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("applicant_onboarding.profile.subtitle")}
      </Typography>

      <FormErrorSummary errors={errors} />

      <TextField
        label={t("applicant_onboarding.profile.full_name")}
        fullWidth
        margin="normal"
        {...register(
          "fullName",
          validationRules.required(t("applicant_onboarding.profile.full_name")),
        )}
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
      />

      <TextField
        label={t("applicant_onboarding.profile.phone_number")}
        fullWidth
        margin="normal"
        {...register("phoneNumber", validationRules.phone())}
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber?.message}
      />

      <TextField
        label={t("applicant_onboarding.profile.location")}
        fullWidth
        margin="normal"
        {...register(
          "location",
          validationRules.required(t("applicant_onboarding.profile.location")),
        )}
        error={!!errors.location}
        helperText={errors.location?.message}
        placeholder={t("applicant_onboarding.profile.location_placeholder")}
      />

      <TextField
        label={t("applicant_onboarding.profile.linkedin_url")}
        fullWidth
        margin="normal"
        {...register("linkedinUrl", validationRules.url())}
        error={!!errors.linkedinUrl}
        helperText={errors.linkedinUrl?.message}
        placeholder="https://linkedin.com/in/yourprofile"
      />

      <TextField
        label={t("applicant_onboarding.profile.portfolio_url")}
        fullWidth
        margin="normal"
        {...register("portfolioUrl", validationRules.url())}
        error={!!errors.portfolioUrl}
        helperText={errors.portfolioUrl?.message}
        placeholder="https://yourportfolio.com"
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button onClick={onBack}>{t("common.back")}</Button>
        <Button type="submit" variant="contained">
          {t("common.next")}
        </Button>
      </Box>
    </form>
  );
};

export default ProfileStep;
