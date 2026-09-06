import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stepper, Step, StepLabel, Paper, Container } from "@mui/material";
import { useTranslation } from "react-i18next";
import WelcomeStep from "./onboarding-steps/WelcomeStep";
import ProfileStep from "./onboarding-steps/ProfileStep";
import ResumeStep from "./onboarding-steps/ResumeStep";
import CompletionStep from "./onboarding-steps/CompletionStep";
import { useAuthMe } from "../../hooks/api/useAuth";

export interface OnboardingData {
  // Profile data
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;

  // Resume data
  resumeFile?: File;
  resumeSkipped?: boolean;

  // Job preferences (desired job types, preferred locations, salary) are not
  // stored by the API or the data model, so the wizard no longer asks for
  // them; the step component is kept but is not part of the flow.
  desiredJobTypes?: string[];
  preferredLocations?: string[];
  salaryExpectation?: string;
}

const ApplicantOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthMe();
  const [activeStep, setActiveStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const profilePrefilled = useRef(false);

  // Pre-populate onboarding data from existing profile fields on the user.
  // We do this in an effect so it also works when user data loads asynchronously
  // from the React Query cache. The ref guard ensures we only pre-fill once —
  // any data the user edits during the wizard should not be overwritten.
  useEffect(() => {
    if (user && !profilePrefilled.current) {
      profilePrefilled.current = true;
      setOnboardingData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || undefined,
        phoneNumber: prev.phoneNumber || user.phoneNumber || undefined,
        location: prev.location || user.location || undefined,
        linkedinUrl: prev.linkedinUrl || user.linkedinUrl || undefined,
        portfolioUrl: prev.portfolioUrl || user.portfolioUrl || undefined,
      }));
    }
  }, [user]);

  const steps = [
    t("applicant_onboarding.steps.welcome"),
    t("applicant_onboarding.steps.profile"),
    t("applicant_onboarding.steps.resume"),
    t("applicant_onboarding.steps.completion"),
  ];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleUpdateData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = () => {
    // Navigate to careers page after onboarding completion. `replace` keeps the
    // finished wizard out of the history stack.
    navigate("/careers", { replace: true });
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <ProfileStep
            data={onboardingData}
            onNext={(data) => {
              handleUpdateData(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <ResumeStep
            data={onboardingData}
            onNext={(data) => {
              handleUpdateData(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <CompletionStep
            data={onboardingData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 3 }}>{renderStep()}</Box>
      </Paper>
    </Container>
  );
};

export default ApplicantOnboarding;
