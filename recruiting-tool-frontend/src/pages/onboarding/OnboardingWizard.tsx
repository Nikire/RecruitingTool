import React, { useState, useEffect, useMemo } from "react";
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
import { useSubscription } from "../../api/subscription";
import {
  useUpdateMyCompanyProfile,
  useUploadCompanyLogo,
} from "../../hooks/api/useCompanies";
import { UpdateCompanyProfileDto } from "../../types/company.types";
import { track, ANALYTICS_EVENTS } from "../../analytics";

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

/**
 * Wizard steps are addressed by id, never by index. The payment step is
 * conditional (FREE plans never pay), so a hard-coded index would either show a
 * step the user legitimately skipped or send them to the wrong screen.
 */
type StepId = "plan_selection" | "payment" | "company_setup" | "welcome";

const DEFAULT_DESTINATION = "/hr/dashboard";

const OnboardingWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStepId, setActiveStepId] = useState<StepId>("plan_selection");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentCancelled, setShowPaymentCancelled] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    selectedPlan: null,
    paymentCompleted: false,
  });

  // The plan already persisted for this company (set by the backend after
  // registration or after a checkout redirect). Used as the source of truth
  // when the user has not yet picked a plan inside this wizard session.
  const { data: subscription } = useSubscription();
  const { mutateAsync: updateCompanyProfile } = useUpdateMyCompanyProfile();
  const { mutateAsync: uploadCompanyLogo } = useUploadCompanyLogo();

  const effectivePlan: SubscriptionPlan | null =
    formData.selectedPlan ?? subscription?.plan ?? null;

  // Unknown plan => keep the payment step visible so the stepper does not
  // shrink under the user mid-flow. A known FREE plan => drop it entirely.
  const requiresPayment =
    effectivePlan === null || effectivePlan !== SubscriptionPlan.FREE;

  const stepIds: StepId[] = useMemo(
    () =>
      [
        "plan_selection" as const,
        ...(requiresPayment ? (["payment"] as const) : []),
        "company_setup" as const,
        "welcome" as const,
      ] as StepId[],
    [requiresPayment],
  );

  const stepLabels: Record<StepId, string> = {
    plan_selection: t("onboarding.steps.plan_selection"),
    payment: t("onboarding.steps.payment"),
    company_setup: t("onboarding.steps.company_setup"),
    welcome: t("onboarding.steps.welcome"),
  };

  // Guard against the active step disappearing from the list (e.g. the user
  // backs up and switches from a paid plan to FREE while on "payment").
  useEffect(() => {
    if (!stepIds.includes(activeStepId)) {
      setActiveStepId("company_setup");
    }
  }, [stepIds, activeStepId]);

  // The payment step needs a concrete paid plan. `effectivePlan` is null only
  // when a full page load wiped the in-session choice, so send the user back
  // to plan selection rather than quoting the Free plan on a payment screen.
  useEffect(() => {
    if (activeStepId === "payment" && effectivePlan === null) {
      setActiveStepId("plan_selection");
    }
  }, [activeStepId, effectivePlan]);

  const activeStepIndex = Math.max(0, stepIds.indexOf(activeStepId));

  // Handle Stripe redirect - check for payment success/cancelled in URL
  useEffect(() => {
    const payment = searchParams.get("payment");

    if (payment === "success") {
      // Payment was successful - advance to company setup step
      setFormData((prev) => ({ ...prev, paymentCompleted: true }));
      setActiveStepId("company_setup");
      setShowPaymentSuccess(true);
      // Clean up URL params
      setSearchParams({});
    } else if (payment === "cancelled") {
      // The provider redirect is a full page load, so the in-session plan
      // choice is gone. Send the user back to pick one again instead of
      // showing a payment summary with no plan (or silently continuing on
      // FREE once the subscription query resolves).
      setActiveStepId("plan_selection");
      setShowPaymentCancelled(true);
      // Clean up URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const goToStep = (offset: number) => {
    const next = stepIds[activeStepIndex + offset];
    if (next) {
      setActiveStepId(next);
    }
  };

  const handleNext = () => goToStep(1);
  const handleBack = () => goToStep(-1);

  const handleUpdateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  /**
   * Persists the (optional) company setup step. Without this the logo,
   * industry, timezone and team size the user just entered would be dropped
   * on the floor when the wizard unmounts.
   *
   * Failures are surfaced by the hooks themselves (showErrorToast) and never
   * block the wizard: the step is optional, so the user still moves on.
   */
  const persistCompanySetup = async (data: Partial<OnboardingFormData>) => {
    const profile: UpdateCompanyProfileDto = {};
    if (data.industry) profile.industry = data.industry;
    if (data.timezone) profile.timezone = data.timezone;
    // The wizard calls it "team size"; the company profile field is companySize.
    if (data.teamSize) profile.companySize = data.teamSize;

    if (Object.keys(profile).length === 0 && !data.companyLogo) {
      return;
    }

    setIsSavingCompany(true);
    try {
      if (Object.keys(profile).length > 0) {
        await updateCompanyProfile(profile);
      }
      if (data.companyLogo) {
        await uploadCompanyLogo(data.companyLogo);
      }
    } catch {
      // Already reported to the user by the mutation's onError handler.
    } finally {
      setIsSavingCompany(false);
    }
  };

  /**
   * The single exit point of the wizard. Fires `onboarding_completed` through
   * the analytics seam (never posthog-js directly) before navigating, whether
   * the user leaves via "Go to Dashboard" or via a quick-start deep link.
   */
  const handleComplete = (destination: string = DEFAULT_DESTINATION) => {
    track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
      flow: "new_company",
      plan: effectivePlan,
      destination,
      paymentRequired: requiresPayment,
    });
    navigate(destination, { replace: true });
  };

  const renderStep = () => {
    switch (activeStepId) {
      case "plan_selection":
        return (
          <PlanSelectionStep
            selectedPlan={formData.selectedPlan}
            onNext={(plan) => {
              handleUpdateFormData({ selectedPlan: plan });
              // If FREE plan, skip payment step entirely
              if (plan === SubscriptionPlan.FREE) {
                handleUpdateFormData({ paymentCompleted: true });
                setActiveStepId("company_setup");
              } else {
                setActiveStepId("payment");
              }
            }}
          />
        );
      case "payment":
        // Guarded by the effect above; renders nothing for the single frame
        // between a wiped plan choice and the redirect to plan selection.
        return effectivePlan && effectivePlan !== SubscriptionPlan.FREE ? (
          <PaymentStep
            selectedPlan={effectivePlan}
            onNext={() => {
              handleUpdateFormData({ paymentCompleted: true });
              handleNext();
            }}
            onBack={handleBack}
          />
        ) : null;
      case "company_setup":
        return (
          <CompanySetupStep
            formData={formData}
            isSaving={isSavingCompany}
            onNext={async (data) => {
              handleUpdateFormData(data);
              await persistCompanySetup(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case "welcome":
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
        <Stepper activeStep={activeStepIndex} sx={{ mb: 4 }}>
          {stepIds.map((stepId) => (
            <Step key={stepId}>
              <StepLabel>{stepLabels[stepId]}</StepLabel>
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

      {/* Payment cancelled notification */}
      <Snackbar
        open={showPaymentCancelled}
        autoHideDuration={6000}
        onClose={() => setShowPaymentCancelled(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowPaymentCancelled(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("onboarding.payment.cancelled_message")}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OnboardingWizard;
