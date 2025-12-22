import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useListAllSubscriptions } from "../../api/subscription";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  ListSubscriptionsQuery,
} from "../../types/subscription.types";
import { UnifiedStatCard } from "../../components/common";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningIcon from "@mui/icons-material/Warning";

const SubscriptionsManagementPage: React.FC = () => {
  const { t } = useTranslation();

  // State for filters
  const [filters, setFilters] = useState<ListSubscriptionsQuery>({
    page: 1,
    limit: 20,
    status: undefined,
    plan: undefined,
    search: "",
  });

  // Fetch subscriptions
  const { data, isLoading, isError } = useListAllSubscriptions(filters);

  // Handle filter changes
  const handleStatusChange = (status: SubscriptionStatus | "") => {
    setFilters((prev) => ({
      ...prev,
      status: status === "" ? undefined : status,
      page: 1,
    }));
  };

  const handlePlanChange = (plan: SubscriptionPlan | "") => {
    setFilters((prev) => ({
      ...prev,
      plan: plan === "" ? undefined : plan,
      page: 1,
    }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
  };

  // Status chip color mapping
  const getStatusColor = (
    status: SubscriptionStatus,
  ): "success" | "warning" | "error" | "default" | "primary" => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return "success";
      case SubscriptionStatus.TRIALING:
        return "primary";
      case SubscriptionStatus.PAST_DUE:
        return "warning";
      case SubscriptionStatus.CANCELED:
      case SubscriptionStatus.EXPIRED:
      case SubscriptionStatus.UNPAID:
        return "error";
      default:
        return "default";
    }
  };

  // Plan chip color mapping
  const getPlanColor = (
    plan: SubscriptionPlan,
  ): "default" | "primary" | "secondary" => {
    switch (plan) {
      case SubscriptionPlan.PROFESSIONAL:
        return "primary";
      case SubscriptionPlan.ENTERPRISE:
        return "secondary";
      default:
        return "default";
    }
  };

  // Format currency (cents to dollars)
  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  // Define columns
  const columns: GridColDef[] = [
    {
      field: "companyName",
      headerName: t("subscriptions.company_name"),
      flex: 1,
      minWidth: 180,
    },
    {
      field: "plan",
      headerName: t("subscriptions.plan"),
      width: 140,
      renderCell: (params) => (
        <Chip
          label={t(`subscriptions.plan_${params.value.toLowerCase()}`)}
          color={getPlanColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "status",
      headerName: t("subscriptions.status"),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={t(`subscriptions.status_${params.value.toLowerCase()}`)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "userCount",
      headerName: t("subscriptions.users"),
      width: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "billingInterval",
      headerName: t("subscriptions.billing"),
      width: 120,
      renderCell: (params) =>
        params.value
          ? t(`subscriptions.${params.value}`)
          : t("subscriptions.not_applicable"),
    },
    {
      field: "monthlyRevenue",
      headerName: t("subscriptions.monthly_revenue"),
      width: 140,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "currentPeriodEnd",
      headerName: t("subscriptions.period_end"),
      width: 130,
      renderCell: (params) => formatDate(params.value),
    },
  ];

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {t("subscriptions.page_title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("subscriptions.page_description")}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {data?.stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <UnifiedStatCard
              title={t("subscriptions.active_subscriptions")}
              value={data.stats.totalActive}
              icon={<CheckCircleIcon />}
              color="success.main"
              translate={false}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <UnifiedStatCard
              title={t("subscriptions.trialing_subscriptions")}
              value={data.stats.totalTrialing}
              icon={<HourglassEmptyIcon />}
              color="primary.main"
              translate={false}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <UnifiedStatCard
              title={t("subscriptions.past_due_subscriptions")}
              value={data.stats.totalPastDue}
              icon={<WarningIcon />}
              color="warning.main"
              translate={false}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <UnifiedStatCard
              title={t("subscriptions.monthly_revenue")}
              value={formatCurrency(data.stats.totalMonthlyRevenue)}
              icon={<AttachMoneyIcon />}
              color="success.main"
              translate={false}
            />
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t("subscriptions.search_company")}
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label={t("subscriptions.filter_status")}
                value={filters.status || ""}
                onChange={(e) =>
                  handleStatusChange(e.target.value as SubscriptionStatus | "")
                }
                size="small"
              >
                <MenuItem value="">{t("common.all")}</MenuItem>
                <MenuItem value={SubscriptionStatus.ACTIVE}>
                  {t("subscriptions.status_active")}
                </MenuItem>
                <MenuItem value={SubscriptionStatus.TRIALING}>
                  {t("subscriptions.status_trialing")}
                </MenuItem>
                <MenuItem value={SubscriptionStatus.PAST_DUE}>
                  {t("subscriptions.status_past_due")}
                </MenuItem>
                <MenuItem value={SubscriptionStatus.CANCELED}>
                  {t("subscriptions.status_canceled")}
                </MenuItem>
                <MenuItem value={SubscriptionStatus.EXPIRED}>
                  {t("subscriptions.status_expired")}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label={t("subscriptions.filter_plan")}
                value={filters.plan || ""}
                onChange={(e) =>
                  handlePlanChange(e.target.value as SubscriptionPlan | "")
                }
                size="small"
              >
                <MenuItem value="">{t("common.all")}</MenuItem>
                <MenuItem value={SubscriptionPlan.FREE}>
                  {t("subscriptions.plan_free")}
                </MenuItem>
                <MenuItem value={SubscriptionPlan.PROFESSIONAL}>
                  {t("subscriptions.plan_professional")}
                </MenuItem>
                <MenuItem value={SubscriptionPlan.ENTERPRISE}>
                  {t("subscriptions.plan_enterprise")}
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("subscriptions.error_loading")}
        </Alert>
      )}

      <Card>
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={data?.subscriptions || []}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[10, 20, 50, 100]}
            paginationModel={{
              page: (filters.page || 1) - 1,
              pageSize: filters.limit || 20,
            }}
            onPaginationModelChange={(model) => {
              handlePageChange(model.page);
              handlePageSizeChange(model.pageSize);
            }}
            paginationMode="server"
            rowCount={data?.total || 0}
            getRowId={(row) => row.uid}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell": {
                fontSize: "0.875rem",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "background.default",
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default SubscriptionsManagementPage;
