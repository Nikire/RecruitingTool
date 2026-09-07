import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  useInvoices,
  useSubscription,
  useBillingPortal,
} from "../../api/subscription";
import { CenteredLoadingSpinner, PageHeader } from "../../components/common";
import { Invoice, SubscriptionStatus } from "../../types/subscription.types";
import { Button } from "@mui/material";
import { wrapLongText } from "../../utils/textOverflow";
import { showErrorToast } from "../../utils/toast";

/**
 * BillingPage - Billing and invoice management page for Company Owners
 * Displays invoice history with download links
 */
const BillingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError } = useInvoices();
  const { data: subscription } = useSubscription();
  const billingPortal = useBillingPortal();

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title={t("billing.title")} />
        <Alert severity="error" sx={{ mt: 3 }}>
          {t("billing.error_loading")}
        </Alert>
      </Box>
    );
  }

  const invoices = data?.invoices || [];
  const hasInvoices = invoices.length > 0;

  const handleManageBilling = () => {
    billingPortal.mutate(undefined as never, {
      onError: (error: unknown) => {
        showErrorToast(error, t("subscription.errors.billing_portal_failed"));
      },
    });
  };

  const getSubscriptionStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return "success";
      case SubscriptionStatus.TRIALING:
        return "info";
      case SubscriptionStatus.PAST_DUE:
        return "warning";
      case SubscriptionStatus.EXPIRED:
      case SubscriptionStatus.CANCELED:
      case SubscriptionStatus.UNPAID:
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title={t("billing.title")} subtitle={t("billing.subtitle")} />

      {/* Subscription Status Card */}
      {subscription && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("subscription.current_subscription")}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}
              >
                <Typography variant="body1">
                  {t("subscription.plan_label")}:{" "}
                  <strong>
                    {t(
                      `subscription.plans.${subscription.plan.toLowerCase()}.name`,
                      { defaultValue: subscription.plan },
                    )}
                  </strong>
                </Typography>
                <Chip
                  label={t(
                    `subscription.status.${subscription.status.toLowerCase()}`,
                  )}
                  color={getSubscriptionStatusColor(subscription.status)}
                  size="small"
                />
              </Box>
              {subscription.gracePeriodEndsAt &&
                subscription.status === SubscriptionStatus.PAST_DUE && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {t("billing.grace_period_expires")}:{" "}
                      {new Date(
                        subscription.gracePeriodEndsAt,
                      ).toLocaleDateString()}
                    </Typography>
                  </Alert>
                )}
              {subscription.status === SubscriptionStatus.EXPIRED && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    {t("billing.subscription_expired")}
                  </Typography>
                </Alert>
              )}
              {subscription.currentPeriodEnd && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  {t("subscription.billing_period_ends")}:{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={handleManageBilling}
                disabled={billingPortal.isPending}
              >
                {t("subscription.manage_billing")}
              </Button>
              {billingPortal.isError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {t("subscription.errors.billing_portal_failed")}
                </Alert>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {!hasInvoices ? (
        <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}>
          <ReceiptIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {t("billing.no_invoices")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t("billing.no_invoices_description")}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("billing.payment_reference")}</TableCell>
                <TableCell>{t("billing.date")}</TableCell>
                <TableCell>{t("billing.amount")}</TableCell>
                <TableCell>{t("billing.status")}</TableCell>
                <TableCell align="right">{t("billing.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice: Invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={wrapLongText}
                    >
                      {invoice.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatAmount(
                        invoice.amount,
                        invoice.currency,
                        i18n.language,
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(
                        `billing.status_${invoice.status.toLowerCase()}`,
                        { defaultValue: invoice.status },
                      )}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("billing.view_invoice")}>
                      <span>
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={!invoice.invoiceUrl}
                          component="a"
                          href={invoice.invoiceUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {hasInvoices && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2, textAlign: "center" }}
        >
          {t("billing.total_invoices", { count: invoices.length })}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Format an amount already expressed in major units to a currency string.
 * The API divides the provider total by 100 before returning it, so dividing
 * again here would render a hundredth of the real charge.
 */
const formatAmount = (
  amount: number,
  currency: string,
  locale: string,
): string => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: (currency || "USD").toUpperCase(),
  }).format(amount);
};

/**
 * Get status color for chip
 */
const getStatusColor = (
  status: string,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (status.toLowerCase()) {
    case "paid":
    case "succeeded":
      return "success";
    case "open":
    case "draft":
    case "processing":
      return "warning";
    case "void":
    case "uncollectible":
    case "failed":
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

export default BillingPage;
