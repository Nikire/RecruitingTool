import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stepper, Step, StepLabel, Paper, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WelcomeStep from './onboarding-steps/WelcomeStep';
import ProfileStep from './onboarding-steps/ProfileStep';
import ResumeStep from './onboarding-steps/ResumeStep';
import PreferencesStep from './onboarding-steps/PreferencesStep';
import CompletionStep from './onboarding-steps/CompletionStep';

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

  // Preferences
  desiredJobTypes?: string[];
  preferredLocations?: string[];
  salaryExpectation?: string;
}

const ApplicantOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const steps = [
    t('onboarding.steps.welcome'),
    t('onboarding.steps.profile'),
    t('onboarding.steps.resume'),
    t('onboarding.steps.preferences'),
    t('onboarding.steps.completion'),
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
    // Navigate to careers page after onboarding completion
    navigate('/careers');
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
          <PreferencesStep
            data={onboardingData}
            onNext={(data) => {
              handleUpdateData(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 4:
        return <CompletionStep data={onboardingData} onComplete={handleComplete} onBack={handleBack} />;
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
