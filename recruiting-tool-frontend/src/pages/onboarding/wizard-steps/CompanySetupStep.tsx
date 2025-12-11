import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { OnboardingFormData } from "../OnboardingWizard";
import FormErrorSummary from "../../../components/common/FormErrorSummary";

interface CompanySetupStepProps {
  formData: OnboardingFormData;
  onNext: (data: Partial<OnboardingFormData>) => void;
  onBack: () => void;
}

interface CompanySetupFormData {
  industry: string;
  timezone: string;
  teamSize: string;
}

const CompanySetupStep: React.FC<CompanySetupStepProps> = ({
  formData,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySetupFormData>({
    defaultValues: {
      industry: formData.industry || "",
      timezone: formData.timezone || "",
      teamSize: formData.teamSize || "",
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("onboarding.company_setup.logo_size_limit"));
        return;
      }

      // Validate file type
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        alert(t("onboarding.company_setup.logo_helper"));
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const industries = [
    "technology",
    "healthcare",
    "finance",
    "retail",
    "manufacturing",
    "education",
    "consulting",
    "real_estate",
    "hospitality",
    "other",
  ];

  const teamSizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Dubai",
    "Australia/Sydney",
  ];

  const onSubmit = (data: CompanySetupFormData) => {
    // Pass the logo file along with other data
    onNext({ ...data, logoFile });
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
        {t("onboarding.company_setup.title")}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {t("onboarding.company_setup.subtitle")}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t("onboarding.company_setup.optional_notice")}
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormErrorSummary errors={errors} />

        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* Logo Upload Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("onboarding.company_setup.logo_label")}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {t("onboarding.company_setup.logo_helper")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {logoPreview ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={logoPreview}
                      alt="Company Logo"
                      sx={{ width: 80, height: 80 }}
                      variant="rounded"
                    />
                    <Box>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        size="small"
                        sx={{ mb: 1 }}
                      >
                        {t("onboarding.company_setup.change_logo")}
                        <input
                          type="file"
                          hidden
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleLogoChange}
                        />
                      </Button>
                      <br />
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemoveLogo}
                        size="small"
                      >
                        {t("onboarding.company_setup.remove_logo")}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    {t("onboarding.company_setup.upload_logo")}
                    <input
                      type="file"
                      hidden
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleLogoChange}
                    />
                  </Button>
                )}
              </Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, display: "block" }}
              >
                {t("onboarding.company_setup.logo_size_limit")}
              </Typography>
            </Box>

            <TextField
              select
              label={t("onboarding.company_setup.industry_label")}
              fullWidth
              margin="normal"
              {...register("industry")}
              error={!!errors.industry}
              helperText={
                errors.industry?.message ||
                t("onboarding.company_setup.industry_helper")
              }
            >
              <MenuItem value="">
                <em>{t("onboarding.company_setup.select_industry")}</em>
              </MenuItem>
              {industries.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {t(`onboarding.company_setup.industries.${industry}`)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t("onboarding.company_setup.timezone_label")}
              fullWidth
              margin="normal"
              {...register("timezone")}
              error={!!errors.timezone}
              helperText={
                errors.timezone?.message ||
                t("onboarding.company_setup.timezone_helper")
              }
            >
              <MenuItem value="">
                <em>{t("onboarding.company_setup.select_timezone")}</em>
              </MenuItem>
              {timezones.map((timezone) => (
                <MenuItem key={timezone} value={timezone}>
                  {timezone}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t("onboarding.company_setup.team_size_label")}
              fullWidth
              margin="normal"
              {...register("teamSize")}
              error={!!errors.teamSize}
              helperText={
                errors.teamSize?.message ||
                t("onboarding.company_setup.team_size_helper")
              }
            >
              <MenuItem value="">
                <em>{t("onboarding.company_setup.select_team_size")}</em>
              </MenuItem>
              {teamSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size} {t("onboarding.company_setup.employees")}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button onClick={onBack}>{t("common.back")}</Button>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={handleSkip}>
              {t("onboarding.company_setup.skip")}
            </Button>
            <Button type="submit" variant="contained">
              {t("common.next")}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default CompanySetupStep;
