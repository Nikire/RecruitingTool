import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
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
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          {t("registration_wizard.confirmation.success_title")}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          {t("registration_wizard.confirmation.success_message")}
        </Typography>
        {isAuthenticated ? (
          <Typography variant="body2" color="textSecondary">
            {t("registration_wizard.confirmation.redirecting")}
          </Typography>
        ) : (
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
              {t("registration_wizard.confirmation.setting_up")}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {t("registration_wizard.confirmation.title")}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t("registration_wizard.confirmation.review_message")}
        </Typography>
      </Box>

      <Box
        sx={{
          p: 3,
          bgcolor: "background.default",
          borderRadius: 1,
          mb: 3,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {t("registration_wizard.confirmation.role_label")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {getRoleTitle()}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          {t("registration_wizard.confirmation.name_label")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {formData.name}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          {t("registration_wizard.confirmation.email_label")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {formData.email}
        </Typography>

        {formData.selectedRole === "HR" && formData.jobTitle && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              {t("registration_wizard.confirmation.job_title_label")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formData.jobTitle}
            </Typography>
          </>
        )}

        {formData.selectedRole === "COMPANY_OWNER" && formData.companyName && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              {t("registration_wizard.confirmation.company_name_label")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formData.companyName}
            </Typography>
          </>
        )}
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("registration_wizard.confirmation.error_message")}
          {error && `: ${error.message}`}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        {t("registration_wizard.confirmation.next_steps")}
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button onClick={onBack} disabled={isPending}>
          {t("common.back")}
        </Button>
        <Button
          variant="contained"
          onClick={handleRegister}
          disabled={isPending}
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
