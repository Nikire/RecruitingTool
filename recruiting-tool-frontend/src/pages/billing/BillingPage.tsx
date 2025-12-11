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
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  useInvoices,
  useSubscription,
  useBillingPortal,
} from "../../api/subscription";
import { CenteredLoadingSpinner, PageHeader } from "../../components/common";
import { Invoice, SubscriptionStatus } from "../../types/subscription.types";
import { Button } from "@mui/material";

/**
 * BillingPage - Billing and invoice management page for Company Owners
 * Displays invoice history with download links
 */
const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useInvoices();
  const { data: subscription } = useSubscription();
  const billingPortal = useBillingPortal();

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title={t("billing.title")} icon={<ReceiptIcon />} />
        <Alert severity="error" sx={{ mt: 3 }}>
          {t("billing.error_loading")}
        </Alert>
      </Box>
    );
  }

  const invoices = data?.invoices || [];
  const hasInvoices = invoices.length > 0;

  const handleManageBilling = () => {
    billingPortal.mutate({ returnUrl: window.location.origin + "/hr/billing" });
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
      <PageHeader
        title={t("billing.title")}
        subtitle={t("billing.subtitle")}
        icon={<ReceiptIcon />}
      />

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
                  <strong>{subscription.plan}</strong>
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
            <Button
              variant="contained"
              onClick={handleManageBilling}
              disabled={
                billingPortal.isPending || !subscription.stripeCustomerId
              }
            >
              {t("subscription.manage_billing")}
            </Button>
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
                <TableCell>{t("billing.invoice_number")}</TableCell>
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
                    <Typography variant="body2" fontWeight="medium">
                      {invoice.invoiceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatAmount(invoice.amountPaid, invoice.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`billing.status_${invoice.status}`)}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("billing.download_pdf")}>
                      <IconButton
                        component="a"
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        color="primary"
                        disabled={!invoice.pdfUrl}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("billing.view_invoice")}>
                      <IconButton
                        component="a"
                        href={invoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        color="primary"
                        disabled={!invoice.hostedInvoiceUrl}
                        sx={{ ml: 1 }}
                      >
                        <ReceiptIcon />
                      </IconButton>
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
 * Format amount in cents to currency string
 */
const formatAmount = (amountInCents: number, currency: string): string => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
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
      return "success";
    case "open":
    case "draft":
      return "warning";
    case "void":
    case "uncollectible":
      return "error";
    default:
      return "default";
  }
};

export default BillingPage;
