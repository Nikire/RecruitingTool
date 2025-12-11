import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PlanSelectionStep from "./wizard-steps/PlanSelectionStep";
import PaymentStep from "./wizard-steps/PaymentStep";
import CompanySetupStep from "./wizard-steps/CompanySetupStep";
import WelcomeStep from "./wizard-steps/WelcomeStep";
import { SubscriptionPlan } from "../../types/subscription.types";

export interface OnboardingFormData {
  // Step 1: Plan selection
  selectedPlan: SubscriptionPlan | null;

  // Step 2: Payment (handled by Stripe, redirect back to onboarding after success)
  paymentCompleted: boolean;

  // Step 3: Company setup
  companyLogo?: File;
  industry?: string;
  timezone?: string;
  teamSize?: string;
}

const OnboardingWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    selectedPlan: null,
    paymentCompleted: false,
  });

  // Handle Stripe redirect - check for payment success/cancelled in URL
  useEffect(() => {
    const payment = searchParams.get("payment");
    const step = searchParams.get("step");

    if (payment === "success") {
      // Payment was successful - advance to company setup step
      setFormData((prev) => ({ ...prev, paymentCompleted: true }));
      setActiveStep(2); // Go to company setup
      setShowPaymentSuccess(true);
      // Clean up URL params
      setSearchParams({});
    } else if (payment === "cancelled") {
      // Payment was cancelled - stay on payment step
      setActiveStep(1);
      // Clean up URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const steps = [
    t("onboarding.steps.plan_selection"),
    t("onboarding.steps.payment"),
    t("onboarding.steps.company_setup"),
    t("onboarding.steps.welcome"),
  ];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleUpdateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = () => {
    // Navigate to HR dashboard after completing onboarding
    navigate("/hr/dashboard", { replace: true });
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <PlanSelectionStep
            selectedPlan={formData.selectedPlan}
            onNext={(plan) => {
              handleUpdateFormData({ selectedPlan: plan });
              // If FREE plan, skip payment step
              if (plan === SubscriptionPlan.FREE) {
                handleUpdateFormData({ paymentCompleted: true });
                setActiveStep(2); // Skip to company setup
              } else {
                handleNext();
              }
            }}
          />
        );
      case 1:
        return (
          <PaymentStep
            selectedPlan={formData.selectedPlan!}
            onNext={() => {
              handleUpdateFormData({ paymentCompleted: true });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <CompanySetupStep
            formData={formData}
            onNext={(data) => {
              handleUpdateFormData(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 3:
        return <WelcomeStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: "100%",
        }}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 3 }}>{renderStep()}</Box>
      </Paper>

      {/* Payment success notification */}
      <Snackbar
        open={showPaymentSuccess}
        autoHideDuration={6000}
        onClose={() => setShowPaymentSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowPaymentSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("onboarding.payment.success_message")}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OnboardingWizard;
