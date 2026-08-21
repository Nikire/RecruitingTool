import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Typography,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import toast from "react-hot-toast";
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
  History as HistoryIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { UnifiedStatCard } from "../../components/common";
import {
  useChangePlan,
  useSubscriptionAuditLog,
  SubscriptionAuditLogItem,
} from "../../api/adminSubscriptionManager";

// ─── Change Plan Dialog ───────────────────────────────────────────────────────

interface ChangePlanDialogProps {
  open: boolean;
  companyUid: string;
  companyName: string;
  currentPlan: SubscriptionPlan;
  onClose: () => void;
}

const ChangePlanDialog: React.FC<ChangePlanDialogProps> = ({
  open,
  companyUid,
  companyName,
  currentPlan,
  onClose,
}) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlan>(currentPlan);
  const [note, setNote] = useState("");
  const mutation = useChangePlan(companyUid);

  const handleSave = () => {
    mutation.mutate(
      { plan: selectedPlan, note: note || undefined },
      {
        onSuccess: () => {
          toast.success(t("subscription_manager.plan_changed"));
          onClose();
          setNote("");
        },
        onError: () => {
          toast.error(t("common.error_occurred"));
        },
      },
    );
  };

  const handleClose = () => {
    setNote("");
    setSelectedPlan(currentPlan);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("subscription_manager.change_plan_title")}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {companyName}
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t("subscription_manager.change_plan")}</InputLabel>
          <Select
            value={selectedPlan}
            label={t("subscription_manager.change_plan")}
            onChange={(e: SelectChangeEvent<SubscriptionPlan>) =>
              setSelectedPlan(e.target.value as SubscriptionPlan)
            }
          >
            {Object.values(SubscriptionPlan).map((plan) => (
              <MenuItem key={plan} value={plan}>
                {t(`subscription.plans.${plan.toLowerCase()}.name`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label={t("subscription_manager.note")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          rows={2}
          placeholder={t("subscription_manager.note_placeholder")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>
          {t("subscription_manager.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={mutation.isPending || selectedPlan === currentPlan}
        >
          {mutation.isPending
            ? t("common.saving")
            : t("subscription_manager.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Audit Log Drawer ─────────────────────────────────────────────────────────

interface AuditLogDrawerProps {
  open: boolean;
  companyUid: string | null;
  companyName: string;
  onClose: () => void;
}

const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  open,
  companyUid,
  companyName,
  onClose,
}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useSubscriptionAuditLog(companyUid, open);

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString();
  };

  const getActionBadgeColor = (
    action: string,
  ): "primary" | "warning" | "info" | "default" => {
    switch (action) {
      case "PLAN_CHANGE":
        return "primary";
      case "STATUS_CHANGE":
        return "warning";
      case "TRIAL_EXTENDED":
        return "info";
      default:
        return "default";
    }
  };

  const renderMetadata = (entry: SubscriptionAuditLogItem) => {
    if (!entry.metadata) return null;
    const meta = entry.metadata;
    const parts: string[] = [];

    if (meta.previousPlan && meta.newPlan) {
      parts.push(
        `${t("subscription_manager.previous")}: ${meta.previousPlan} → ${t("subscription_manager.new_value")}: ${meta.newPlan}`,
      );
    }
    if (meta.previousStatus && meta.newStatus) {
      parts.push(
        `${t("subscription_manager.previous")}: ${meta.previousStatus} → ${t("subscription_manager.new_value")}: ${meta.newStatus}`,
      );
    }
    if (meta.daysAdded) {
      parts.push(`+${meta.daysAdded} ${t("subscription_manager.days")}`);
    }
    if (meta.newTrialEnd) {
      parts.push(
        `${t("subscription_manager.new_value")}: ${new Date(meta.newTrialEnd as string).toLocaleDateString()}`,
      );
    }
    if (meta.note) {
      parts.push(`${t("subscription_manager.note")}: ${meta.note}`);
    }

    return parts.length > 0 ? (
      <Typography variant="caption" color="text.secondary" component="div">
        {parts.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </Typography>
    ) : null;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6">
            {t("subscription_manager.audit_log_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {companyName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ overflow: "auto", flex: 1 }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
              </Box>
            ))}
          </Box>
        ) : !data || data.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              {t("subscription_manager.no_audit_entries")}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {data.map((entry, idx) => (
              <Box key={entry.uid}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Chip
                          label={entry.action.replace("_", " ")}
                          color={getActionBadgeColor(entry.action)}
                          size="small"
                          variant="filled"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {entry.adminName}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.disabled">
                          {formatTimestamp(entry.timestamp)}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>{renderMetadata(entry)}</Box>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < data.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

/**
 * AdminSubscriptionsPage - Admin page for viewing and managing all subscriptions
 * Displays all subscriptions with status, plan, company, and revenue info.
 * Supports plan changes and subscription audit log via drawer.
 */
const AdminSubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useAdminSubscriptions();

  // Dialog state
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AdminSubscriptionItem | null>(
    null,
  );

  // Audit log drawer state
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [auditRow, setAuditRow] = useState<AdminSubscriptionItem | null>(null);

  const handleOpenChangePlan = (row: AdminSubscriptionItem) => {
    setSelectedRow(row);
    setChangePlanOpen(true);
  };

  const handleOpenAuditLog = (row: AdminSubscriptionItem) => {
    setAuditRow(row);
    setAuditDrawerOpen(true);
  };

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

  const hasNoSubscriptions =
    !isLoading && !isError && (data?.subscriptions.length ?? 0) === 0;

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
          variant="filled"
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
          variant="filled"
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
    {
      field: "actions",
      headerName: t("admin.subscriptions.columns.actions"),
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            alignItems: "center",
            height: "100%",
          }}
        >
          <Button
            variant="contained"
            size="small"
            color="secondary"
            onClick={() => handleOpenChangePlan(params.row)}
          >
            {t("subscription_manager.change_plan")}
          </Button>
          <IconButton
            size="small"
            onClick={() => handleOpenAuditLog(params.row)}
            title={t("subscription_manager.audit_log")}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
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
          <Typography variant="h6" gutterBottom>
            {t("admin.subscriptions.table_title")}
          </Typography>
          {/*
            MRR is derived from the plan's list price, not from an amount the
            payment provider reports per subscription. Say so rather than let
            the number read as billed revenue.
          */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("admin.subscriptions.mrr_estimate_note")}
          </Typography>

          {hasNoSubscriptions && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t("admin.subscriptions.empty")}
            </Alert>
          )}

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
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "background.default",
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      {selectedRow && (
        <ChangePlanDialog
          open={changePlanOpen}
          companyUid={selectedRow.companyUid}
          companyName={selectedRow.companyName}
          currentPlan={selectedRow.plan}
          onClose={() => {
            setChangePlanOpen(false);
            setSelectedRow(null);
          }}
        />
      )}

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        open={auditDrawerOpen}
        companyUid={auditRow?.companyUid ?? null}
        companyName={auditRow?.companyName ?? ""}
        onClose={() => {
          setAuditDrawerOpen(false);
          setAuditRow(null);
        }}
      />
    </Box>
  );
};

export default AdminSubscriptionsPage;
