import React from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { RegistrationFormData } from "../RegistrationWizard";

interface RoleInfoStepProps {
  formData: RegistrationFormData;
  onNext: (data: Partial<RegistrationFormData>) => void;
  onBack: () => void;
}

const RoleInfoStep: React.FC<RoleInfoStepProps> = ({
  formData,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<RegistrationFormData>>({
    defaultValues: formData,
  });

  const onSubmit = (data: Partial<RegistrationFormData>) => {
    onNext(data);
  };

  const renderHRForm = () => (
    <>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("registration_wizard.role_info.hr_subtitle")}
      </Typography>

      <TextField
        label={t("registration_wizard.role_info.job_title")}
        fullWidth
        margin="normal"
        {...register("jobTitle")}
        helperText={t("registration_wizard.role_info.job_title_helper")}
      />
    </>
  );

  // The skills summary and resume inputs that used to live here were never
  // sent to the backend (RegisterPayload has no such fields). The applicant
  // onboarding flow collects the resume right after registration, so this step
  // only explains what comes next instead of silently discarding input.
  const renderApplicantForm = () => (
    <>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("registration_wizard.role_info.applicant_subtitle")}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          mt: 1,
          p: 3,
          borderRadius: 2,
          bgcolor: "action.hover",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("registration_wizard.role_info.applicant_onboarding_note")}
        </Typography>
      </Paper>
    </>
  );

  const renderCompanyOwnerForm = () => (
    <>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("registration_wizard.role_info.company_owner_subtitle")}
      </Typography>

      <TextField
        label={t("registration_wizard.role_info.company_name")}
        fullWidth
        margin="normal"
        {...register("companyName", {
          required: t("registration_wizard.role_info.company_name_required"),
        })}
        error={!!errors.companyName}
        helperText={
          errors.companyName?.message ||
          t("registration_wizard.role_info.company_name_helper")
        }
      />
    </>
  );

  const getRoleSpecificForm = () => {
    switch (formData.selectedRole) {
      case "HR":
        return renderHRForm();
      case "USER":
        return renderApplicantForm();
      case "COMPANY_OWNER":
        return renderCompanyOwnerForm();
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 700 }}>
        {t("registration_wizard.role_info.title")}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mt: 2 }}>{getRoleSpecificForm()}</Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Button onClick={onBack} size="large">
            {t("common.back")}
          </Button>
          <Button type="submit" variant="contained" size="large">
            {t("common.next")}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RoleInfoStep;
