import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Link,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AuthPageWrapper } from "./Auth.styles";
import RoleSelectionStep from "./wizard-steps/RoleSelectionStep";
import AccountCreationStep from "./wizard-steps/AccountCreationStep";
import RoleInfoStep from "./wizard-steps/RoleInfoStep";
import ConfirmationStep from "./wizard-steps/ConfirmationStep";
import { ANALYTICS_EVENTS, track } from "../../analytics";
import {
  buildAttributionEventProps,
  SIGNUP_STEP_NAMES,
  trackSignupStepCompleted,
} from "./signupFunnel";

export type UserRole = "HR" | "USER" | "COMPANY_OWNER";

export interface RegistrationFormData {
  // Step 1: Role selection
  selectedRole: UserRole | null;

  // Step 2: Account creation
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;

  // Step 3: Role-specific information
  // For HR/Recruiter
  companyUid?: string;
  jobTitle?: string;

  // For Job Applicant
  resumeFile?: File;
  skillsSummary?: string;

  // For Company Owner
  companyName?: string;
}

const RegistrationWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>({
    selectedRole: null,
    name: "",
    email: "",
    password: "",
    termsAccepted: false,
  });

  // Visible labels. Their ANALYTICS identifiers live in SIGNUP_STEP_NAMES and
  // are deliberately not translated (see signupFunnel.ts).
  const steps = [
    t("registration_wizard.steps.role_selection"),
    t("registration_wizard.steps.account_creation"),
    t("registration_wizard.steps.role_information"),
    t("registration_wizard.steps.confirmation"),
  ];

  // Fire `signup_started` exactly once per mount. A ref guard, not an empty
  // dependency array alone, because React StrictMode re-runs mount effects in
  // development and would otherwise double-count the top of the funnel.
  const hasTrackedStart = useRef(false);
  useEffect(() => {
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;
    track(ANALYTICS_EVENTS.SIGNUP_STARTED, {
      step: 0,
      stepName: SIGNUP_STEP_NAMES[0],
      ...buildAttributionEventProps(),
    });
  }, []);

  /**
   * Advances the wizard and records the step that was just completed.
   *
   * Every forward transition funnels through here, which is the whole point:
   * the drop-off between two consecutive `signup_step_completed` events is what
   * identifies the leaking step. The final (confirmation) step is instrumented
   * inside ConfirmationStep, since it advances by submitting, not by onNext.
   */
  const handleNext = (extraProps?: Record<string, unknown>) => {
    // Tracked outside the state updater on purpose: React may invoke an updater
    // twice (StrictMode / concurrent re-render) and would double-count the event.
    trackSignupStepCompleted(activeStep, extraProps);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleUpdateFormData = (data: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = () => {
    // Navigate to appropriate dashboard based on role
    // This will be handled in ConfirmationStep after successful registration
    navigate("/");
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <RoleSelectionStep
            selectedRole={formData.selectedRole}
            onNext={(role) => {
              handleUpdateFormData({ selectedRole: role });
              handleNext({ role });
            }}
          />
        );
      case 1:
        return (
          <AccountCreationStep
            formData={formData}
            onNext={(data) => {
              handleUpdateFormData(data);
              handleNext({ role: formData.selectedRole });
            }}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <RoleInfoStep
            formData={formData}
            onNext={(data) => {
              handleUpdateFormData(data);
              handleNext({ role: formData.selectedRole });
            }}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            formData={formData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthPageWrapper>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 5, md: 6 },
          maxWidth: 900,
          width: "100%",
          mx: "auto",
          my: { xs: 2, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 5,
            "& .MuiStepLabel-label": {
              fontSize: { xs: "0.7rem", sm: "0.875rem" },
              fontWeight: 500,
            },
            "& .MuiStepLabel-label.Mui-active": {
              fontWeight: 700,
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>{renderStep()}</Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2">
            {t("auth.already_have_account")}{" "}
            <Link component={RouterLink} to="/login" underline="hover">
              {t("auth.sign_in_link")}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </AuthPageWrapper>
  );
};

export default RegistrationWizard;
