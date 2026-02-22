import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stepper, Step, StepLabel, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AuthPageWrapper } from "./Auth.styles";
import RoleSelectionStep from "./wizard-steps/RoleSelectionStep";
import AccountCreationStep from "./wizard-steps/AccountCreationStep";
import RoleInfoStep from "./wizard-steps/RoleInfoStep";
import ConfirmationStep from "./wizard-steps/ConfirmationStep";

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

  const steps = [
    t("registration_wizard.steps.role_selection"),
    t("registration_wizard.steps.account_creation"),
    t("registration_wizard.steps.role_information"),
    t("registration_wizard.steps.confirmation"),
  ];

  const handleNext = () => {
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
              handleNext();
            }}
          />
        );
      case 1:
        return (
          <AccountCreationStep
            formData={formData}
            onNext={(data) => {
              handleUpdateFormData(data);
              handleNext();
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
              handleNext();
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
      </Paper>
    </AuthPageWrapper>
  );
};

export default RegistrationWizard;
