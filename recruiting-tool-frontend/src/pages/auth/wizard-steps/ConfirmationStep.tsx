import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { RegistrationFormData } from "../RegistrationWizard";
import { useRegister, useAuthMe } from "../../../hooks/api/useAuth";
import { getDefaultDashboard } from "../../../utils/permissions";

interface ConfirmationStepProps {
  formData: RegistrationFormData;
  onBack: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  formData,
  onBack,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: registerUser, isPending, isError, error } = useRegister();
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Use auth state to detect when authentication is confirmed
  const { isAuthenticated, user } = useAuthMe();

  // When authentication is confirmed after registration, navigate to onboarding or dashboard
  useEffect(() => {
    if (isRegistered && isAuthenticated && user) {
      // Small delay to show success message before navigating
      const timer = setTimeout(() => {
        // COMPANY_OWNER users go through company owner onboarding (plan selection, payment, etc.)
        if (formData.selectedRole === "COMPANY_OWNER") {
          navigate("/onboarding", { replace: true });
        }
        // HR users go through HR onboarding (profile completion)
        else if (formData.selectedRole === "HR") {
          navigate("/onboarding/hr", { replace: true });
        }
        // USER (applicants) go through applicant onboarding
        else if (formData.selectedRole === "USER") {
          navigate("/applicant/onboarding", { replace: true });
        }
        // All other users go directly to their dashboard
        else {
          navigate(getDefaultDashboard(user), { replace: true });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isRegistered, isAuthenticated, user, formData.selectedRole, navigate]);

  const handleRegister = () => {
    // Prepare registration data based on role
    const registrationData: Record<string, unknown> = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roles: formData.selectedRole ? [formData.selectedRole] : undefined,
    };

    // For COMPANY_OWNER, include company name if provided
    // Backend will auto-create company with this name
    if (formData.selectedRole === "COMPANY_OWNER" && formData.companyName) {
      // We'll send companyName in metadata for now
      // Backend will create company automatically for COMPANY_OWNER role
      registrationData.companyName = formData.companyName;
    }

    // For HR users, store jobTitle in localStorage to pre-populate onboarding
    // This prevents duplicate data entry during onboarding
    if (formData.selectedRole === "HR" && formData.jobTitle) {
      localStorage.setItem("hr_onboarding_position", formData.jobTitle);
    }

    registerUser(registrationData, {
      onSuccess: () => {
        setIsRegistered(true);
        setShowSuccess(true);
      },
    });
  };

  const getRoleTitle = () => {
    switch (formData.selectedRole) {
      case "HR":
        return t("registration_wizard.roles.hr.title");
      case "USER":
        return t("registration_wizard.roles.applicant.title");
      case "COMPANY_OWNER":
        return t("registration_wizard.roles.company_owner.title");
      default:
        return "";
    }
  };

  if (showSuccess) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CheckCircleIcon sx={{ fontSize: 96, color: "success.main", mb: 3 }} />
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          {t("registration_wizard.confirmation.success_title")}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
        >
          {t("registration_wizard.confirmation.success_message")}
        </Typography>
        {isAuthenticated ? (
          <Typography variant="body2" color="text.secondary">
            {t("registration_wizard.confirmation.redirecting")}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              {t("registration_wizard.confirmation.setting_up")}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 700 }}>
        {t("registration_wizard.confirmation.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("registration_wizard.confirmation.review_message")}
      </Typography>

      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, mb: 3, overflow: "hidden" }}
      >
        <Stack divider={<Divider />}>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              gap: 2,
              alignItems: "baseline",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                minWidth: 140,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: 0.5,
              }}
            >
              {t("registration_wizard.confirmation.role_label")}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getRoleTitle()}
            </Typography>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              gap: 2,
              alignItems: "baseline",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                minWidth: 140,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: 0.5,
              }}
            >
              {t("registration_wizard.confirmation.name_label")}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formData.name}
            </Typography>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              gap: 2,
              alignItems: "baseline",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                minWidth: 140,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: 0.5,
              }}
            >
              {t("registration_wizard.confirmation.email_label")}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formData.email}
            </Typography>
          </Box>

          {formData.selectedRole === "HR" && formData.jobTitle && (
            <Box
              sx={{
                px: 3,
                py: 2.5,
                display: "flex",
                gap: 2,
                alignItems: "baseline",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  minWidth: 140,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: 0.5,
                }}
              >
                {t("registration_wizard.confirmation.job_title_label")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.jobTitle}
              </Typography>
            </Box>
          )}

          {formData.selectedRole === "COMPANY_OWNER" &&
            formData.companyName && (
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  display: "flex",
                  gap: 2,
                  alignItems: "baseline",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    minWidth: 140,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: 0.5,
                  }}
                >
                  {t("registration_wizard.confirmation.company_name_label")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formData.companyName}
                </Typography>
              </Box>
            )}
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("registration_wizard.confirmation.error_message")}
          {error && `: ${error.message}`}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 4 }}>
        {t("registration_wizard.confirmation.next_steps")}
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button onClick={onBack} disabled={isPending} size="large">
          {t("common.back")}
        </Button>
        <Button
          variant="contained"
          onClick={handleRegister}
          disabled={isPending}
          size="large"
          startIcon={isPending ? <CircularProgress size={20} /> : null}
        >
          {isPending
            ? t("registration_wizard.confirmation.creating_account")
            : t("common.finish")}
        </Button>
      </Box>
    </Box>
  );
};

export default ConfirmationStep;
