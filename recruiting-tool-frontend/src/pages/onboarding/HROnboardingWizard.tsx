import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import {
  useHROnboardingStatus,
  useCompleteHROnboarding,
  CompleteHROnboardingData,
} from "../../hooks/api/useOnboarding";
import { useAuthMe } from "../../hooks/api/useAuth";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../../components/common/FormErrorSummary";

const HROnboardingWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthMe();
  const { data: onboardingStatus, isLoading: isLoadingStatus } =
    useHROnboardingStatus();
  const { mutate: completeOnboarding, isPending } = useCompleteHROnboarding();
  const validationRules = useValidationRules();

  const [activeStep, setActiveStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteHROnboardingData>({
    defaultValues: {
      position:
        user?.position ||
        localStorage.getItem("hr_onboarding_position") ||
        "",
      department: user?.department || "",
      phoneNumber: user?.phoneNumber || "",
      timezone:
        user?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "",
      bio: user?.bio || "",
    },
  });

  const steps = [
    t("hr_onboarding.steps.welcome"),
    t("hr_onboarding.steps.profile_setup"),
    t("hr_onboarding.steps.complete"),
  ];

  // Redirect if onboarding already complete
  useEffect(() => {
    if (onboardingStatus?.isOnboardingComplete) {
      navigate("/hr/dashboard", { replace: true });
    }
  }, [onboardingStatus, navigate]);

  const onSubmit = (data: CompleteHROnboardingData) => {
    completeOnboarding(data, {
      onSuccess: (response) => {
        // Clean up localStorage after successful onboarding
        localStorage.removeItem("hr_onboarding_position");
        setIsCompleted(true);
        // Redirect after showing success message
        setTimeout(() => {
          navigate(response.redirectTo, { replace: true });
        }, 2000);
      },
    });
  };

  if (isLoadingStatus) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isCompleted) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, maxWidth: 600, width: "100%", textAlign: "center" }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" gutterBottom>
            {t("hr_onboarding.completion.title")}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {t("hr_onboarding.completion.message")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <CircularProgress size={16} />
            <Typography variant="body2" color="textSecondary">
              {t("hr_onboarding.completion.redirecting")}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "60vh", py: 4, px: 2 }}>
      <Paper
        elevation={3}
        sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 800, mx: "auto" }}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              {t("hr_onboarding.welcome.title")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("hr_onboarding.welcome.subtitle")}
            </Typography>

            {/* Company Info Card */}
            {user?.company && (
              <Card sx={{ mb: 3, bgcolor: "background.default" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6">{user?.company?.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t("hr_onboarding.welcome.your_company")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* User Info Card */}
            <Card sx={{ mb: 3, bgcolor: "background.default" }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6">{user?.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {onboardingStatus?.wasInvited && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {t("hr_onboarding.welcome.invited_message", {
                  inviterName: onboardingStatus.invitedByName || t("common.someone"),
                })}
              </Alert>
            )}

            {!onboardingStatus?.wasInvited && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {t("hr_onboarding.welcome.welcome_message")}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" onClick={() => setActiveStep(1)}>
                {t("common.next")}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              {t("hr_onboarding.profile_setup.title")}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {t("hr_onboarding.profile_setup.subtitle")}
            </Typography>

            <FormErrorSummary errors={errors} />

            <TextField
              label={t("hr_onboarding.profile_setup.position_label")}
              fullWidth
              margin="normal"
              {...register("position", validationRules.maxLength(100))}
              error={!!errors.position}
              helperText={
                errors.position?.message ||
                t("hr_onboarding.profile_setup.position_helper")
              }
            />

            <TextField
              label={t("hr_onboarding.profile_setup.department_label")}
              fullWidth
              margin="normal"
              {...register("department", validationRules.maxLength(100))}
              error={!!errors.department}
              helperText={
                errors.department?.message ||
                t("hr_onboarding.profile_setup.department_helper")
              }
            />

            <TextField
              label={t("hr_onboarding.profile_setup.phone_label")}
              fullWidth
              margin="normal"
              {...register("phoneNumber", validationRules.phone())}
              error={!!errors.phoneNumber}
              helperText={
                errors.phoneNumber?.message ||
                t("hr_onboarding.profile_setup.phone_helper")
              }
            />

            <TextField
              label={t("hr_onboarding.profile_setup.timezone_label")}
              fullWidth
              margin="normal"
              {...register("timezone", validationRules.maxLength(50))}
              error={!!errors.timezone}
              helperText={
                errors.timezone?.message ||
                t("hr_onboarding.profile_setup.timezone_helper")
              }
            />

            <TextField
              label={t("hr_onboarding.profile_setup.bio_label")}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              {...register("bio", validationRules.maxLength(500))}
              error={!!errors.bio}
              helperText={
                errors.bio?.message ||
                t("hr_onboarding.profile_setup.bio_helper")
              }
            />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button onClick={() => setActiveStep(0)} disabled={isPending}>
                {t("common.back")}
              </Button>
              <Button type="submit" variant="contained" disabled={isPending}>
                {isPending ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t("hr_onboarding.profile_setup.saving")}
                  </>
                ) : (
                  t("common.finish")
                )}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default HROnboardingWizard;
