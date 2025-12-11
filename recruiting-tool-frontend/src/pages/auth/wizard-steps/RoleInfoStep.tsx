import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
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
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
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

  const renderApplicantForm = () => (
    <>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        {t("registration_wizard.role_info.applicant_subtitle")}
      </Typography>

      <TextField
        label={t("registration_wizard.role_info.skills_summary")}
        fullWidth
        multiline
        rows={4}
        margin="normal"
        {...register("skillsSummary")}
        helperText={t("registration_wizard.role_info.skills_helper")}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          {t("registration_wizard.role_info.resume_upload")}
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          display="block"
          sx={{ mb: 1 }}
        >
          {t("registration_wizard.role_info.resume_helper")}
        </Typography>
        <Button variant="outlined" component="label">
          {t("registration_wizard.role_info.choose_file")}
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx"
            {...register("resumeFile")}
          />
        </Button>
      </Box>
    </>
  );

  const renderCompanyOwnerForm = () => (
    <>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
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
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {t("registration_wizard.role_info.title")}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        {getRoleSpecificForm()}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button onClick={onBack}>{t("common.back")}</Button>
          <Button type="submit" variant="contained">
            {t("common.next")}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RoleInfoStep;
