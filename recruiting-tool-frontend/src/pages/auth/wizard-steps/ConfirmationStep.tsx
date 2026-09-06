import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { RegistrationFormData } from "../RegistrationWizard";
import { useRegister, useAuthMe } from "../../../hooks/api/useAuth";
import { getDefaultDashboard } from "../../../utils/permissions";
import { wrapLongText } from "../../../utils/textOverflow";
import { ANALYTICS_EVENTS, track } from "../../../analytics";
import type { RegisterPayload } from "../../../api/auth";
import {
  buildAttributionEventProps,
  buildRegistrationAttribution,
  SIGNUP_CONFIRMATION_STEP,
  trackSignupStepCompleted,
} from "../signupFunnel";

interface ConfirmationStepProps {
  formData: RegistrationFormData;
  onBack: () => void;
  onComplete?: () => void;
}

/**
 * Pulls the human-readable reason out of a failed /auth/register call.
 * The axios error's own `.message` is just "Request failed with status code
 * 400"; the backend reason (e.g. "User already exists" or class-validator
 * messages) lives in `response.data.message`, as a string or a string array.
 */
const getServerErrorMessage = (err: unknown): string | undefined => {
  if (!err || typeof err !== "object") return undefined;
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  ).response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" && message.trim() ? message : undefined;
};

/** Backend wording for a duplicate email (auth.service `BadRequestException`). */
const isEmailTakenMessage = (message?: string): boolean =>
  !!message && /already exists/i.test(message);

interface ReviewRowProps {
  label: string;
  value: string;
}

/**
 * One label/value line of the review card. Stacks vertically on phones and
 * lets long unbroken values (emails, company names) wrap instead of being
 * clipped by the card's `overflow: hidden`.
 */
const ReviewRow: React.FC<ReviewRowProps> = ({ label, value }) => (
  <Box
    sx={{
      px: 3,
      py: 2.5,
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      gap: { xs: 0.5, sm: 2 },
      alignItems: { xs: "stretch", sm: "baseline" },
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        fontWeight: 600,
        minWidth: 140,
        flexShrink: 0,
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, ...wrapLongText }}>
      {value}
    </Typography>
  </Box>
);

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

  const serverMessage = isError ? getServerErrorMessage(error) : undefined;
  const isEmailTaken = isEmailTakenMessage(serverMessage);

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
    // Snapshot the first-touch attribution BEFORE firing the mutation: a
    // successful register clears the stash (in useRegister), so reading it in
    // onSuccess would come back empty.
    //
    // Both helpers are internally defensive and return `{}` when nothing was
    // captured or sessionStorage is blocked — signup must never fail because
    // attribution is missing or malformed.
    const attribution = buildRegistrationAttribution();
    const attributionEventProps = buildAttributionEventProps();

    // Prepare registration data based on role
    const registrationData: RegisterPayload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roles: formData.selectedRole ? [formData.selectedRole] : undefined,
      // Optional, write-only campaign fields. Absent keys are simply omitted.
      ...attribution,
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
        // Final step of the funnel, then the conversion itself.
        trackSignupStepCompleted(SIGNUP_CONFIRMATION_STEP, {
          role: formData.selectedRole,
        });
        track(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
          role: formData.selectedRole,
          // The plan is chosen later, during onboarding — an account has no
          // plan at creation time. Sent explicitly so the property exists on
          // every event and the funnel can be broken down by it once the
          // onboarding step starts populating it.
          plan: null,
          ...attributionEventProps,
        });

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
          <ReviewRow
            label={t("registration_wizard.confirmation.role_label")}
            value={getRoleTitle()}
          />
          <ReviewRow
            label={t("registration_wizard.confirmation.name_label")}
            value={formData.name}
          />
          <ReviewRow
            label={t("registration_wizard.confirmation.email_label")}
            value={formData.email}
          />
          {formData.selectedRole === "HR" && formData.jobTitle && (
            <ReviewRow
              label={t("registration_wizard.confirmation.job_title_label")}
              value={formData.jobTitle}
            />
          )}
          {formData.selectedRole === "COMPANY_OWNER" &&
            formData.companyName && (
              <ReviewRow
                label={t("registration_wizard.confirmation.company_name_label")}
                value={formData.companyName}
              />
            )}
        </Stack>
      </Paper>

      {isError &&
        (isEmailTaken ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t("registration_wizard.confirmation.email_taken")}{" "}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- RouterLink renders <a href> from `to` */}
            <Link component={RouterLink} to="/login" underline="hover">
              {t("auth.sign_in_link")}
            </Link>
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t("registration_wizard.confirmation.error_message")}
            {serverMessage && `: ${serverMessage}`}
          </Alert>
        ))}

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
