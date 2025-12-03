import React, { useState } from 'react';
import {
  Box,
  Container,
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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PricingCard from '../../components/subscription/PricingCard';
import QuotaDisplay from '../../components/subscription/QuotaDisplay';
import {
  useSubscription,
  useQuota,
  useCheckout,
  useBillingPortal,
  useCancelSubscription,
} from '../../api/subscription';
import { SubscriptionPlan, SubscriptionStatus } from '../../types/subscription.types';

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const { data: subscription, isLoading: isLoadingSubscription, isError: isErrorSubscription } = useSubscription();
  const { data: quota, isLoading: isLoadingQuota } = useQuota();
  const { mutate: createCheckout, isPending: isCreatingCheckout } = useCheckout();
  const { mutate: openBillingPortal, isPending: isOpeningPortal } = useBillingPortal();
  const { mutate: cancelSubscription, isPending: isCanceling } = useCancelSubscription();

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan === SubscriptionPlan.FREE) return;

    const successUrl = `${window.location.origin}/profile/subscription?success=true`;
    const cancelUrl = `${window.location.origin}/profile/subscription?canceled=true`;

    createCheckout(
      {
        plan,
        successUrl,
        cancelUrl,
      },
      {
        onError: (error: any) => {
          toast.error(error?.message || t('subscription.errors.checkout_failed'));
        },
      }
    );
  };

  const handleManageBilling = () => {
    openBillingPortal(undefined, {
      onError: (error: any) => {
        toast.error(error?.message || t('subscription.errors.billing_portal_failed'));
      },
    });
  };

  const handleCancelSubscription = () => {
    cancelSubscription(undefined, {
      onSuccess: (data) => {
        toast.success(
          t('subscription.messages.cancel_success', {
            date: format(new Date(data.cancelAt), 'PPP'),
          })
        );
        setCancelDialogOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.message || t('subscription.errors.cancel_failed'));
      },
    });
  };

  const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
    const baseFeatures = [
      t('subscription.plans.free.features.basic_recruiting'),
      t('subscription.plans.free.features.unlimited_candidates'),
    ];

    const proFeatures = [
      ...baseFeatures,
      t('subscription.plans.professional.features.ai_parsing'),
      t('subscription.plans.professional.features.advanced_analytics'),
      t('subscription.plans.professional.features.custom_branding'),
      t('subscription.plans.professional.features.priority_support'),
    ];

    const enterpriseFeatures = [
      ...proFeatures,
      t('subscription.plans.enterprise.features.api_access'),
      t('subscription.plans.enterprise.features.custom_integrations'),
      t('subscription.plans.enterprise.features.unlimited_everything'),
      t('subscription.plans.enterprise.features.dedicated_support'),
    ];

    switch (plan) {
      case SubscriptionPlan.FREE:
        return baseFeatures;
      case SubscriptionPlan.PROFESSIONAL:
        return proFeatures;
      case SubscriptionPlan.ENTERPRISE:
        return enterpriseFeatures;
      default:
        return baseFeatures;
    }
  };

  const getStatusColor = (
    status: SubscriptionStatus
  ): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'success';
      case SubscriptionStatus.TRIALING:
        return 'info';
      case SubscriptionStatus.PAST_DUE:
        return 'warning';
      case SubscriptionStatus.CANCELED:
      case SubscriptionStatus.UNPAID:
        return 'error';
      default:
        return 'default';
    }
  };

  if (isErrorSubscription) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{t('subscription.errors.load_failed')}</Alert>
      </Container>
    );
  }

  if (isLoadingSubscription) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {t('subscription.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('subscription.description')}
      </Typography>

      {/* Current Subscription Info */}
      {subscription && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{t('subscription.current_subscription')}</Typography>
              <Chip
                label={t(`subscription.status.${subscription.status.toLowerCase()}`)}
                color={getStatusColor(subscription.status)}
                size="small"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('subscription.plan_label')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {t(`subscription.plans.${subscription.plan.toLowerCase()}.name`)}
                </Typography>
              </Grid>

              {subscription.trialEnd && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('subscription.trial_ends')}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(subscription.trialEnd), 'PPP')}
                  </Typography>
                </Grid>
              )}

              {subscription.currentPeriodEnd && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('subscription.billing_period_ends')}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(subscription.currentPeriodEnd), 'PPP')}
                  </Typography>
                </Grid>
              )}

              {subscription.cancelAtPeriodEnd && (
                <Grid item xs={12}>
                  <Alert severity="warning">{t('subscription.messages.will_cancel')}</Alert>
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {subscription.plan !== SubscriptionPlan.FREE &&
                subscription.status === SubscriptionStatus.ACTIVE && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleManageBilling}
                      disabled={isOpeningPortal}
                      startIcon={isOpeningPortal && <CircularProgress size={20} />}
                    >
                      {t('subscription.manage_billing')}
                    </Button>

                    {!subscription.cancelAtPeriodEnd && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setCancelDialogOpen(true)}
                        disabled={isCanceling}
                      >
                        {t('subscription.cancel_subscription')}
                      </Button>
                    )}
                  </>
                )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quota and Usage */}
      {quota && !isLoadingQuota && (
        <Box sx={{ mb: 4 }}>
          <QuotaDisplay
            quotaStatus={quota}
            onUpgrade={
              subscription?.plan !== SubscriptionPlan.ENTERPRISE
                ? () => setSelectedPlan(SubscriptionPlan.PROFESSIONAL)
                : undefined
            }
          />
        </Box>
      )}

      {/* Pricing Cards */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        {t('subscription.available_plans')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PricingCard
            plan={SubscriptionPlan.FREE}
            price={t('subscription.plans.free.price')}
            features={getPlanFeatures(SubscriptionPlan.FREE)}
            isCurrentPlan={subscription?.plan === SubscriptionPlan.FREE}
            upgradeDisabled
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <PricingCard
            plan={SubscriptionPlan.PROFESSIONAL}
            price={t('subscription.plans.professional.price')}
            features={getPlanFeatures(SubscriptionPlan.PROFESSIONAL)}
            isCurrentPlan={subscription?.plan === SubscriptionPlan.PROFESSIONAL}
            onUpgrade={() => handleUpgrade(SubscriptionPlan.PROFESSIONAL)}
            upgradeDisabled={
              isCreatingCheckout ||
              subscription?.plan === SubscriptionPlan.PROFESSIONAL ||
              subscription?.plan === SubscriptionPlan.ENTERPRISE
            }
            highlighted
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <PricingCard
            plan={SubscriptionPlan.ENTERPRISE}
            price={t('subscription.plans.enterprise.price')}
            features={getPlanFeatures(SubscriptionPlan.ENTERPRISE)}
            isCurrentPlan={subscription?.plan === SubscriptionPlan.ENTERPRISE}
            onUpgrade={() => handleUpgrade(SubscriptionPlan.ENTERPRISE)}
            upgradeDisabled={isCreatingCheckout || subscription?.plan === SubscriptionPlan.ENTERPRISE}
          />
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('subscription.dialogs.cancel.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('subscription.dialogs.cancel.message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={isCanceling}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCancelSubscription}
            color="error"
            variant="contained"
            disabled={isCanceling}
            startIcon={isCanceling && <CircularProgress size={20} />}
          >
            {isCanceling ? t('common.deleting') : t('subscription.dialogs.cancel.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionPage;
