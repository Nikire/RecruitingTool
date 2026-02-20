import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Skeleton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useAdminSubscriptions } from "../../hooks/api/useAdminSubscriptions";
import {
  AdminSubscriptionItem,
  SubscriptionStatus,
  SubscriptionPlan,
} from "../../types/subscription.types";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { UnifiedStatCard } from "../../components/common";

/**
 * AdminSubscriptionsPage - Admin page for viewing all subscriptions
 * Displays all Stripe subscriptions with status, plan, company, and revenue info
 */
const AdminSubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useAdminSubscriptions();

  // Helper to get status chip color
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
      case SubscriptionStatus.EXPIRED:
        return "error";
      default:
        return "default";
    }
  };

  // Helper to get plan chip color
  const getPlanColor = (
    plan: SubscriptionPlan,
  ): "primary" | "secondary" | "default" => {
    switch (plan) {
      case SubscriptionPlan.PROFESSIONAL:
        return "primary";
      case SubscriptionPlan.ENTERPRISE:
        return "secondary";
      case SubscriptionPlan.FREE:
      default:
        return "default";
    }
  };

  // Helper to format MRR
  const formatMRR = (mrr: number | undefined): string => {
    if (!mrr) return "$0.00";
    return `$${(mrr / 100).toFixed(2)}`;
  };

  // Helper to format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return t("common.not_applicable");
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Table columns
  const columns: GridColDef<AdminSubscriptionItem>[] = [
    {
      field: "companyName",
      headerName: t("admin.subscriptions.columns.company"),
      flex: 1,
      minWidth: 180,
    },
    {
      field: "ownerName",
      headerName: t("admin.subscriptions.columns.owner"),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.value || t("common.not_available"),
    },
    {
      field: "ownerEmail",
      headerName: t("admin.subscriptions.columns.email"),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => params.value || t("common.not_available"),
    },
    {
      field: "plan",
      headerName: t("admin.subscriptions.columns.plan"),
      width: 150,
      renderCell: (params) => (
        <Chip
          label={t(`subscription.plans.${params.value.toLowerCase()}.name`)}
          color={getPlanColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "status",
      headerName: t("admin.subscriptions.columns.status"),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={t(`subscription.status.${params.value.toLowerCase()}`)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "mrr",
      headerName: t("admin.subscriptions.columns.mrr"),
      width: 100,
      renderCell: (params) => formatMRR(params.value),
    },
    {
      field: "currentPeriodEnd",
      headerName: t("admin.subscriptions.columns.period_end"),
      width: 130,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "createdAt",
      headerName: t("admin.subscriptions.columns.created"),
      width: 130,
      renderCell: (params) => formatDate(params.value),
    },
  ];

  // Statistics cards data
  const statsData = data
    ? [
        {
          title: t("admin.subscriptions.stats.total_subscriptions"),
          value: data.total,
          icon: <PeopleIcon />,
          iconColor: "#1976d2",
          variant: "statistic" as const,
        },
        {
          title: t("admin.subscriptions.stats.active_subscriptions"),
          value: data.totalActive,
          icon: <TrendingUpIcon />,
          iconColor: "#2e7d32",
          variant: "statistic" as const,
        },
        {
          title: t("admin.subscriptions.stats.trialing_subscriptions"),
          value: data.totalTrialing,
          icon: <AccessTimeIcon />,
          iconColor: "#0288d1",
          variant: "statistic" as const,
        },
        {
          title: t("admin.subscriptions.stats.past_due_subscriptions"),
          value: data.totalPastDue,
          icon: <WarningIcon />,
          iconColor: "#ed6c02",
          variant: "statistic" as const,
        },
        {
          title: t("admin.subscriptions.stats.total_mrr"),
          value: formatMRR(data.totalMrr),
          icon: <TrendingUpIcon />,
          iconColor: "#2e7d32",
          variant: "statistic" as const,
        },
      ]
    : [];

  return (
    <Box sx={{ py: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        {t("admin.subscriptions.title")}
      </Typography>

      {/* Error State */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("admin.subscriptions.error")}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {isLoading ? (
          <>
            {[...Array(5)].map((_, index) => (
              <Box
                key={index}
                sx={{ flex: "1 1 calc(20% - 24px)", minWidth: 200 }}
              >
                <Skeleton variant="rectangular" height={120} />
              </Box>
            ))}
          </>
        ) : (
          statsData.map((stat, index) => (
            <Box
              key={index}
              sx={{ flex: "1 1 calc(20% - 24px)", minWidth: 200 }}
            >
              <UnifiedStatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.iconColor}
                variant={stat.variant}
              />
            </Box>
          ))
        )}
      </Box>

      {/* Subscriptions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t("admin.subscriptions.table_title")}
          </Typography>

          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={data?.subscriptions || []}
              columns={columns}
              loading={isLoading}
              getRowId={(row) => row.subscriptionUid}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-cell": {
                  padding: "8px",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "background.default",
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSubscriptionsPage;
