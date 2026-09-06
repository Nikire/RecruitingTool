import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormErrorSummary from "../../../components/common/FormErrorSummary";
import { OnboardingData } from "../ApplicantOnboarding";

interface PreferencesStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

interface PreferencesFormData {
  desiredJobTypes: string[];
  preferredLocations: string[];
  salaryExpectation?: string;
}

const jobTypeOptions = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMPORARY",
];
const locationOptions = ["REMOTE", "HYBRID", "ON_SITE"];

const PreferencesStep: React.FC<PreferencesStepProps> = ({
  data,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PreferencesFormData>({
    defaultValues: {
      desiredJobTypes: data.desiredJobTypes || [],
      preferredLocations: data.preferredLocations || [],
      salaryExpectation: data.salaryExpectation || "",
    },
  });

  const selectedJobTypes = watch("desiredJobTypes");
  const selectedLocations = watch("preferredLocations");

  const onSubmit = (formData: PreferencesFormData) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" gutterBottom>
        {t("applicant_onboarding.preferences.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("applicant_onboarding.preferences.subtitle")}
      </Typography>

      <FormErrorSummary errors={errors} />

      {/* Desired Job Types */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom fontWeight="medium">
          {t("applicant_onboarding.preferences.desired_job_types")}
        </Typography>
        <Controller
          name="desiredJobTypes"
          control={control}
          render={({ field }) => (
            <TextField
              select
              SelectProps={{ multiple: true }}
              fullWidth
              value={field.value}
              onChange={field.onChange}
              helperText={t("applicant_onboarding.preferences.select_multiple")}
            >
              {jobTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`job_type.${type.toLowerCase()}`)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {selectedJobTypes.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {selectedJobTypes.map((type) => (
              <Chip
                key={type}
                label={t(`job_type.${type.toLowerCase()}`)}
                size="small"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Preferred Locations */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom fontWeight="medium">
          {t("applicant_onboarding.preferences.preferred_locations")}
        </Typography>
        <Controller
          name="preferredLocations"
          control={control}
          render={({ field }) => (
            <TextField
              select
              SelectProps={{ multiple: true }}
              fullWidth
              value={field.value}
              onChange={field.onChange}
              helperText={t("applicant_onboarding.preferences.select_multiple")}
            >
              {locationOptions.map((location) => (
                <MenuItem key={location} value={location}>
                  {t(`work_location.${location.toLowerCase()}`)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {selectedLocations.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {selectedLocations.map((location) => (
              <Chip
                key={location}
                label={t(`work_location.${location.toLowerCase()}`)}
                size="small"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Salary Expectation */}
      <TextField
        label={t("applicant_onboarding.preferences.salary_expectation")}
        fullWidth
        margin="normal"
        {...register("salaryExpectation")}
        error={!!errors.salaryExpectation}
        helperText={
          errors.salaryExpectation?.message ||
          t("applicant_onboarding.preferences.salary_optional")
        }
        placeholder={t("applicant_onboarding.preferences.salary_placeholder")}
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

export default PreferencesStep;
