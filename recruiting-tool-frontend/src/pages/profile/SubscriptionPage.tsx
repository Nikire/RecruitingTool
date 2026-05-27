import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Divider,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import toast from "react-hot-toast";
import PricingCard, {
  BillingInterval,
} from "../../components/subscription/PricingCard";
import BillingToggle from "../../components/subscription/BillingToggle";
import QuotaDisplay from "../../components/subscription/QuotaDisplay";
import {
  useSubscription,
  useQuota,
  useCheckout,
  useBillingPortal,
  useCancelSubscription,
} from "../../api/subscription";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  Subscription,
} from "../../types/subscription.types";
import { usePlanLimits } from "../../hooks/api/usePlanLimits";
import { buildPlanFeatures } from "../../utils/buildPlanFeatures";

// Helper functions for data validation
const formatDate = (dateString: string | null): string | null => {
  if (!dateString) return null;

  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "PPP") : null;
  } catch {
    return null;
  }
};

const isValidSubscription = (
  subscription: Subscription | undefined,
): subscription is Subscription => {
  return !!(
    subscription &&
    subscription.uid &&
    subscription.plan &&
    subscription.status
  );
};

const canManageBilling = (subscription: Subscription | undefined): boolean => {
  return !!(
    subscription &&
    subscription.plan !== SubscriptionPlan.FREE &&
    subscription.status === SubscriptionStatus.ACTIVE
  );
};

const canCancelSubscription = (
  subscription: Subscription | undefined,
): boolean => {
  return !!(
    subscription &&
    subscription.plan !== SubscriptionPlan.FREE &&
    subscription.status === SubscriptionStatus.ACTIVE &&
    !subscription.cancelAtPeriodEnd
  );
};

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("monthly");

  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    isError: isErrorSubscription,
    error: subscriptionError,
  } = useSubscription();
  const {
    data: quota,
    isLoading: isLoadingQuota,
    isError: isErrorQuota,
  } = useQuota();
  const { mutate: createCheckout, isPending: isCreatingCheckout } =
    useCheckout();
  const { mutate: openBillingPortal, isPending: isOpeningPortal } =
    useBillingPortal();
  const { mutate: cancelSubscription, isPending: isCanceling } =
    useCancelSubscription();
  const { data: planLimits, isLoading: limitsLoading } = usePlanLimits();

  // Memoized validation checks
  const validSubscription = useMemo(
    () => isValidSubscription(subscription),
    [subscription],
  );

  const showManageBilling = useMemo(
    () => canManageBilling(subscription),
    [subscription],
  );

  const showCancelButton = useMemo(
    () => canCancelSubscription(subscription),
    [subscription],
  );

  // Handle Stripe checkout redirect with ?success=true or ?canceled=true
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (!success && !canceled) return;

    if (success === "true") {
      toast.success(t("subscription.messages.checkout_success"));
      // Force-refetch subscription and quota data
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["quota"] });
      // Refetch again after a short delay in case the Stripe webhook hasn't
      // been processed yet (webhooks are async and may arrive slightly later)
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        queryClient.invalidateQueries({ queryKey: ["quota"] });
      }, 3000);
      setSearchParams({}, { replace: true });
      return () => clearTimeout(timer);
    } else if (canceled === "true") {
      toast(t("subscription.messages.checkout_canceled"), {
        icon: "ℹ️",
      });
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan === SubscriptionPlan.FREE) return;
    const successUrl = `${window.location.origin}/profile/subscription?success=true`;
    const cancelUrl = `${window.location.origin}/profile/subscription?canceled=true`;
    createCheckout(
      { plan, interval: billingInterval, successUrl, cancelUrl },
      {
        onError: (error: Error) => {
          toast.error(
            error?.message || t("subscription.errors.checkout_failed"),
          );
        },
      },
    );
  };

  const handleManageBilling = () => {
    openBillingPortal(undefined, {
      onError: (error: Error) => {
        toast.error(
          error?.message || t("subscription.errors.billing_portal_failed"),
        );
      },
    });
  };

  const handleCancelSubscription = () => {
    cancelSubscription(undefined, {
      onSuccess: (data) => {
        const formattedDate = formatDate(data.cancelAt);
        toast.success(
          t("subscription.messages.cancel_success", {
            date: formattedDate || t("common.unknown"),
          }),
        );
        setCancelDialogOpen(false);
      },
      onError: (error: Error) => {
        toast.error(error?.message || t("subscription.errors.cancel_failed"));
      },
    });
  };

  const planRank: Record<SubscriptionPlan, number> = {
    [SubscriptionPlan.FREE]: 0,
    [SubscriptionPlan.PROFESSIONAL]: 1,
    [SubscriptionPlan.ENTERPRISE]: 2,
  };
  const currentRank = subscription ? planRank[subscription.plan] : 0;
  const canUpgradeTo = (plan: SubscriptionPlan) => currentRank < planRank[plan];

  const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
    if (!planLimits) return [];
    return buildPlanFeatures(planLimits[plan], t);
  };

  const getStatusColor = (
    status: SubscriptionStatus,
  ): "success" | "warning" | "error" | "default" | "info" => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return "success";
      case SubscriptionStatus.TRIALING:
        return "info";
      case SubscriptionStatus.PAST_DUE:
        return "warning";
      case SubscriptionStatus.CANCELED:
      case SubscriptionStatus.UNPAID:
        return "error";
      default:
        return "default";
    }
  };

  if (isErrorSubscription) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("subscription.errors.load_failed")}
          </Typography>
          <Typography variant="body2">
            {subscriptionError instanceof Error
              ? subscriptionError.message
              : t("errors.try_again")}
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          {t("common.refresh")}
        </Button>
      </Box>
    );
  }

  if (isLoadingSubscription) {
    return (
      <Box sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {t("subscription.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("subscription.description")}
        </Typography>
      </Box>

      {/* Current Subscription Info */}
      {validSubscription && subscription && (
        <Card
          sx={{
            mb: 4,
            border: 1,
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={3}>
              {/* Header with status */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {t("subscription.current_subscription")}
                </Typography>
                <Chip
                  label={t(
                    `subscription.status.${subscription.status.toLowerCase()}`,
                  )}
                  color={getStatusColor(subscription.status)}
                  size="medium"
                />
              </Box>

              <Divider />

              {/* Subscription Details */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    {t("subscription.plan_label")}
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {t(
                      `subscription.plans.${subscription.plan.toLowerCase()}.name`,
                    )}
                  </Typography>
                </Grid>

                {subscription.trialEnd && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {t("subscription.trial_ends")}
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {formatDate(subscription.trialEnd) || t("common.n_a")}
                    </Typography>
                  </Grid>
                )}

                {subscription.currentPeriodEnd && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {t("subscription.billing_period_ends")}
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {formatDate(subscription.currentPeriodEnd) ||
                        t("common.n_a")}
                    </Typography>
                  </Grid>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {t("subscription.messages.will_cancel")}
                    </Alert>
                  </Grid>
                )}
              </Grid>

              {/* Action Buttons */}
              {showManageBilling && (
                <>
                  <Divider />
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ width: "100%" }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleManageBilling}
                      disabled={isOpeningPortal}
                      startIcon={
                        isOpeningPortal && <CircularProgress size={20} />
                      }
                      sx={{ flex: 1 }}
                    >
                      {t("subscription.manage_billing")}
                    </Button>

                    {showCancelButton && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setCancelDialogOpen(true)}
                        disabled={isCanceling}
                        sx={{ flex: 1 }}
                      >
                        {t("subscription.cancel_subscription")}
                      </Button>
                    )}
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Quota and Usage */}
      {isLoadingQuota ? (
        <Skeleton variant="rectangular" height={200} sx={{ mb: 4 }} />
      ) : isErrorQuota ? (
        <Alert severity="warning" sx={{ mb: 4 }}>
          {t("subscription.errors.quota_load_failed")}
        </Alert>
      ) : (
        quota && (
          <Box sx={{ mb: 4 }}>
            <QuotaDisplay
              quotaStatus={quota}
              onUpgrade={
                subscription?.plan !== SubscriptionPlan.ENTERPRISE
                  ? () => {
                      setSelectedPlan(SubscriptionPlan.PROFESSIONAL);
                      setUpgradeDialogOpen(true);
                    }
                  : undefined
              }
            />
          </Box>
        )
      )}

      {/* Pricing Cards Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {t("subscription.available_plans")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("subscription.choose_plan_description")}
        </Typography>

        {/* Billing Toggle */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          <BillingToggle
            value={billingInterval}
            onChange={setBillingInterval}
            discount={20}
          />
        </Box>
      </Box>

      {limitsLoading ? (
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
          {[0, 1, 2].map((i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ overflow: "visible" }}>
            <PricingCard
              plan={SubscriptionPlan.FREE}
              monthlyPrice={0}
              annualPrice={0}
              interval={billingInterval}
              features={getPlanFeatures(SubscriptionPlan.FREE)}
              isCurrentPlan={subscription?.plan === SubscriptionPlan.FREE}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ overflow: "visible" }}>
            <PricingCard
              plan={SubscriptionPlan.PROFESSIONAL}
              monthlyPrice={79}
              annualPrice={799}
              interval={billingInterval}
              features={getPlanFeatures(SubscriptionPlan.PROFESSIONAL)}
              isCurrentPlan={
                subscription?.plan === SubscriptionPlan.PROFESSIONAL
              }
              onUpgrade={
                canUpgradeTo(SubscriptionPlan.PROFESSIONAL)
                  ? () => handleUpgrade(SubscriptionPlan.PROFESSIONAL)
                  : undefined
              }
              upgradeDisabled={isCreatingCheckout}
              highlighted
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ overflow: "visible" }}>
            <PricingCard
              plan={SubscriptionPlan.ENTERPRISE}
              monthlyPrice={249}
              annualPrice={2499}
              interval={billingInterval}
              features={getPlanFeatures(SubscriptionPlan.ENTERPRISE)}
              isCurrentPlan={subscription?.plan === SubscriptionPlan.ENTERPRISE}
              onUpgrade={
                canUpgradeTo(SubscriptionPlan.ENTERPRISE)
                  ? () => handleUpgrade(SubscriptionPlan.ENTERPRISE)
                  : undefined
              }
              upgradeDisabled={isCreatingCheckout}
            />
          </Grid>
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("subscription.dialogs.cancel.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("subscription.dialogs.cancel.message")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={isCanceling}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCancelSubscription}
            color="error"
            variant="contained"
            disabled={isCanceling}
            startIcon={isCanceling && <CircularProgress size={20} />}
          >
            {isCanceling
              ? t("common.deleting")
              : t("subscription.dialogs.cancel.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={() => {
          setUpgradeDialogOpen(false);
          setSelectedPlan(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPlan
            ? t("subscription.upgrade_to_plan")
            : t("subscription.available_plans")}
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                {t(
                  `subscription.plans.${selectedPlan.toLowerCase()}.description`,
                )}
              </DialogContentText>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                >
                  {t(`subscription.plans.${selectedPlan.toLowerCase()}.price`)}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.secondary"
                  >
                    /{t("subscription.per_month")}
                  </Typography>
                </Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("subscription.quota.features")}:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {getPlanFeatures(selectedPlan).map((feature, index) => (
                  <Typography
                    component="li"
                    variant="body2"
                    key={index}
                    sx={{ mb: 0.5 }}
                  >
                    {feature}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUpgradeDialogOpen(false);
              setSelectedPlan(null);
            }}
            disabled={isCreatingCheckout}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => {
              if (selectedPlan) {
                handleUpgrade(selectedPlan);
                setUpgradeDialogOpen(false);
                setSelectedPlan(null);
              }
            }}
            color="primary"
            variant="contained"
            disabled={isCreatingCheckout || !selectedPlan}
            startIcon={isCreatingCheckout && <CircularProgress size={20} />}
          >
            {isCreatingCheckout
              ? t("common.loading")
              : t("subscription.upgrade_to_plan")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPage;
