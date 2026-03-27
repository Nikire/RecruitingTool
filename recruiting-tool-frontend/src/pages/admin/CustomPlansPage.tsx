import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BusinessCenter as AssignIcon,
  CloudSync as SyncIcon,
  CheckCircleOutline as SyncedIcon,
  RadioButtonUnchecked as NotSyncedIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  OpenInBrowser as DashboardIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";
import {
  useCustomPlans,
  useCreateCustomPlan,
  useUpdateCustomPlan,
  useDeleteCustomPlan,
  useAssignCustomPlan,
  useSyncCustomPlanToStripe,
} from "../../hooks/api/useCustomPlans";
import { useCompanies } from "../../hooks/api/useCompanies";
import type {
  CustomPlanRecord,
  CreateCustomPlanDto,
  UpdateCustomPlanDto,
} from "../../types/customPlans.types";
import PageHeader from "../../components/common/PageHeader";
import AccessDeniedMessage from "../../components/common/AccessDeniedMessage";

// ---------------------------------------------------------------------------
// Plan Form Dialog (shared for Create and Edit)
// ---------------------------------------------------------------------------

interface PlanFormValues {
  name: string;
  companyUid: string;
  maxUsers: number;
  maxJobPositions: number;
  maxCandidatesPerPosition: number;
  maxStorageMB: number;
  aiScoringCreditsPerMonth: number;
  emailTemplatesEnabled: boolean;
  analyticsEnabled: boolean;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
}

const DEFAULT_FORM: PlanFormValues = {
  name: "",
  companyUid: "",
  maxUsers: 10,
  maxJobPositions: 10,
  maxCandidatesPerPosition: 100,
  maxStorageMB: 5000,
  aiScoringCreditsPerMonth: 100,
  emailTemplatesEnabled: true,
  analyticsEnabled: true,
  monthlyPrice: 0,
  annualPrice: 0,
  currency: "USD",
};

interface PlanFormDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: CustomPlanRecord | null;
  onSubmit: (values: PlanFormValues) => void;
  isSubmitting: boolean;
}

const PlanFormDialog: React.FC<PlanFormDialogProps> = ({
  open,
  onClose,
  initial,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const { data: companies = [] } = useCompanies();

  const [form, setForm] = useState<PlanFormValues>(() =>
    initial
      ? {
          name: initial.name,
          companyUid: initial.companyUid ?? "",
          maxUsers: initial.maxUsers,
          maxJobPositions: initial.maxJobPositions,
          maxCandidatesPerPosition: initial.maxCandidatesPerPosition,
          maxStorageMB: initial.maxStorageMB,
          aiScoringCreditsPerMonth: initial.aiScoringCreditsPerMonth,
          emailTemplatesEnabled: initial.emailTemplatesEnabled,
          analyticsEnabled: initial.analyticsEnabled,
          monthlyPrice: initial.monthlyPrice,
          annualPrice: initial.annualPrice,
          currency: initial.currency,
        }
      : DEFAULT_FORM,
  );

  React.useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              companyUid: initial.companyUid ?? "",
              maxUsers: initial.maxUsers,
              maxJobPositions: initial.maxJobPositions,
              maxCandidatesPerPosition: initial.maxCandidatesPerPosition,
              maxStorageMB: initial.maxStorageMB,
              aiScoringCreditsPerMonth: initial.aiScoringCreditsPerMonth,
              emailTemplatesEnabled: initial.emailTemplatesEnabled,
              analyticsEnabled: initial.analyticsEnabled,
              monthlyPrice: initial.monthlyPrice,
              annualPrice: initial.annualPrice,
              currency: initial.currency,
            }
          : DEFAULT_FORM,
      );
    }
  }, [open, initial]);

  const handleChange = useCallback(
    (field: keyof PlanFormValues) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value =
          e.target.type === "checkbox"
            ? (e as React.ChangeEvent<HTMLInputElement>).target.checked
            : e.target.type === "number"
              ? Number(e.target.value)
              : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const handleToggle = useCallback(
    (field: "emailTemplatesEnabled" | "analyticsEnabled") =>
      (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setForm((prev) => ({ ...prev, [field]: checked }));
      },
    [],
  );

  const handleSubmit = useCallback(() => {
    onSubmit(form);
  }, [form, onSubmit]);

  const isEditing = Boolean(initial);
  const title = isEditing
    ? t("custom_plans.edit_plan")
    : t("custom_plans.create_plan");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          {/* Plan name */}
          <TextField
            label={t("custom_plans.field_name")}
            value={form.name}
            onChange={handleChange("name")}
            fullWidth
            required
            autoFocus
          />

          {/* Company selector (only on create) */}
          {!isEditing && (
            <TextField
              select
              label={t("custom_plans.field_company")}
              value={form.companyUid}
              onChange={handleChange("companyUid")}
              fullWidth
              helperText={t("custom_plans.field_company_helper")}
            >
              <MenuItem value="">{t("custom_plans.no_company")}</MenuItem>
              {companies.map((c) => (
                <MenuItem key={c.uid} value={c.uid}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Divider>
            <Typography variant="caption" color="text.secondary">
              {t("custom_plans.section_quotas")}
            </Typography>
          </Divider>

          {/* Quota fields — 2-column grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label={t("custom_plans.field_max_users")}
              type="number"
              value={form.maxUsers}
              onChange={handleChange("maxUsers")}
              fullWidth
              inputProps={{ min: -1, step: 1 }}
              helperText={t("custom_plans.unlimited_hint")}
            />
            <TextField
              label={t("custom_plans.field_max_job_positions")}
              type="number"
              value={form.maxJobPositions}
              onChange={handleChange("maxJobPositions")}
              fullWidth
              inputProps={{ min: -1, step: 1 }}
              helperText={t("custom_plans.unlimited_hint")}
            />
            <TextField
              label={t("custom_plans.field_max_candidates")}
              type="number"
              value={form.maxCandidatesPerPosition}
              onChange={handleChange("maxCandidatesPerPosition")}
              fullWidth
              inputProps={{ min: -1, step: 1 }}
              helperText={t("custom_plans.unlimited_hint")}
            />
            <TextField
              label={t("custom_plans.field_max_storage")}
              type="number"
              value={form.maxStorageMB}
              onChange={handleChange("maxStorageMB")}
              fullWidth
              inputProps={{ min: -1, step: 1 }}
              helperText={t("custom_plans.unlimited_hint")}
            />
            <TextField
              label={t("custom_plans.field_ai_credits")}
              type="number"
              value={form.aiScoringCreditsPerMonth}
              onChange={handleChange("aiScoringCreditsPerMonth")}
              fullWidth
              inputProps={{ min: -1, step: 1 }}
              helperText={t("custom_plans.unlimited_hint")}
            />
          </Box>

          {/* Boolean toggles */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.emailTemplatesEnabled}
                  onChange={handleToggle("emailTemplatesEnabled")}
                  color="primary"
                />
              }
              label={t("custom_plans.field_email_templates")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.analyticsEnabled}
                  onChange={handleToggle("analyticsEnabled")}
                  color="primary"
                />
              }
              label={t("custom_plans.field_analytics")}
            />
          </Box>

          <Divider>
            <Typography variant="caption" color="text.secondary">
              {t("custom_plans.section_pricing")}
            </Typography>
          </Divider>

          {/* Pricing fields */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label={t("custom_plans.field_monthly_price")}
              type="number"
              value={form.monthlyPrice}
              onChange={handleChange("monthlyPrice")}
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              helperText={t("custom_plans.price_cents_hint")}
            />
            <TextField
              label={t("custom_plans.field_annual_price")}
              type="number"
              value={form.annualPrice}
              onChange={handleChange("annualPrice")}
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              helperText={t("custom_plans.price_cents_hint")}
            />
            <TextField
              label={t("custom_plans.field_currency")}
              value={form.currency}
              onChange={handleChange("currency")}
              fullWidth
              inputProps={{ maxLength: 3 }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || !form.name.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {isSubmitting
            ? t("common.saving")
            : isEditing
              ? t("common.save")
              : t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Assign Company Dialog
// ---------------------------------------------------------------------------

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  plan: CustomPlanRecord | null;
  onAssign: (companyUid: string) => void;
  isAssigning: boolean;
}

const AssignDialog: React.FC<AssignDialogProps> = ({
  open,
  onClose,
  plan,
  onAssign,
  isAssigning,
}) => {
  const { t } = useTranslation();
  const { data: companies = [] } = useCompanies();
  const [selectedCompanyUid, setSelectedCompanyUid] = useState("");

  React.useEffect(() => {
    if (open) {
      setSelectedCompanyUid(plan?.companyUid ?? "");
    }
  }, [open, plan]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("custom_plans.assign_dialog_title")}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("custom_plans.assign_dialog_subtitle", { name: plan?.name })}
        </Typography>
        <TextField
          select
          label={t("custom_plans.field_company")}
          value={selectedCompanyUid}
          onChange={(e) => setSelectedCompanyUid(e.target.value)}
          fullWidth
        >
          {companies.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isAssigning}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={() => onAssign(selectedCompanyUid)}
          disabled={isAssigning || !selectedCompanyUid}
          startIcon={isAssigning ? <CircularProgress size={16} /> : undefined}
        >
          {isAssigning ? t("common.saving") : t("custom_plans.assign_action")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Confirm Delete Dialog
// ---------------------------------------------------------------------------

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  plan: CustomPlanRecord | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  plan,
  onConfirm,
  isDeleting,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("custom_plans.delete_dialog_title")}</DialogTitle>
      <DialogContent>
        <Typography>
          {t("custom_plans.delete_dialog_body", { name: plan?.name })}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isDeleting}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
        >
          {isDeleting ? t("common.deleting") : t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Stripe sync status + links
// ---------------------------------------------------------------------------

interface StripeLinksProps {
  plan: CustomPlanRecord;
}

const StripeLinks: React.FC<StripeLinksProps> = ({ plan }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState<string | null>(null);

  const isSynced = Boolean(
    plan.stripeProductId &&
    plan.stripePriceId &&
    plan.stripeAnnualPriceId &&
    plan.monthlyPaymentLink &&
    plan.annualPaymentLink,
  );

  // Use per-plan flag — each plan knows which environment it was synced in
  const dashboardBase =
    plan.stripeIsTestMode !== false
      ? "https://dashboard.stripe.com/test"
      : "https://dashboard.stripe.com";

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <Stack spacing={0.75} alignItems="flex-start">
      {/* Sync status + environment badge */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Chip
          icon={
            isSynced ? (
              <SyncedIcon fontSize="small" />
            ) : (
              <NotSyncedIcon fontSize="small" />
            )
          }
          label={
            isSynced ? t("custom_plans.synced") : t("custom_plans.not_synced")
          }
          color={isSynced ? "success" : "default"}
          variant={isSynced ? "filled" : "outlined"}
          size="small"
        />
        {isSynced && plan.stripeIsTestMode !== null && (
          <Chip
            label={
              plan.stripeIsTestMode
                ? t("custom_plans.env_test")
                : t("custom_plans.env_live")
            }
            color={plan.stripeIsTestMode ? "warning" : "info"}
            variant="filled"
            size="small"
            sx={{ fontSize: "0.65rem", height: 20 }}
          />
        )}
      </Stack>

      {/* Links — only shown when synced */}
      {isSynced && plan.stripeProductId && (
        <Stack spacing={0.5}>
          {/* Stripe Dashboard link */}
          <Tooltip title={t("custom_plans.stripe_dashboard_link")}>
            <Chip
              icon={<DashboardIcon sx={{ fontSize: "14px !important" }} />}
              label={t("custom_plans.stripe_dashboard_short")}
              size="small"
              variant="filled"
              color="primary"
              component="a"
              href={`${dashboardBase}/products/${plan.stripeProductId}`}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{ fontSize: "0.7rem", height: 22, cursor: "pointer" }}
            />
          </Tooltip>

          {/* Monthly payment link */}
          {plan.monthlyPaymentLink && (
            <Stack direction="row" spacing={0.25} alignItems="center">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.65rem" }}
              >
                {t("custom_plans.monthly_link_label")}
              </Typography>
              <Tooltip
                title={
                  copied === "monthly"
                    ? t("custom_plans.link_copied")
                    : t("custom_plans.copy_link")
                }
              >
                <IconButton
                  size="small"
                  sx={{ p: 0.25 }}
                  onClick={() =>
                    handleCopy(plan.monthlyPaymentLink!, "monthly")
                  }
                >
                  <CopyIcon
                    sx={{ fontSize: 13 }}
                    color={copied === "monthly" ? "success" : "inherit"}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("custom_plans.open_link")}>
                <IconButton
                  size="small"
                  sx={{ p: 0.25 }}
                  component="a"
                  href={plan.monthlyPaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OpenInNewIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}

          {/* Annual payment link */}
          {plan.annualPaymentLink && (
            <Stack direction="row" spacing={0.25} alignItems="center">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.65rem" }}
              >
                {t("custom_plans.annual_link_label")}
              </Typography>
              <Tooltip
                title={
                  copied === "annual"
                    ? t("custom_plans.link_copied")
                    : t("custom_plans.copy_link")
                }
              >
                <IconButton
                  size="small"
                  sx={{ p: 0.25 }}
                  onClick={() => handleCopy(plan.annualPaymentLink!, "annual")}
                >
                  <CopyIcon
                    sx={{ fontSize: 13 }}
                    color={copied === "annual" ? "success" : "inherit"}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("custom_plans.open_link")}>
                <IconButton
                  size="small"
                  sx={{ p: 0.25 }}
                  component="a"
                  href={plan.annualPaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OpenInNewIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const CustomPlansPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  const { data: plans, isLoading, isError } = useCustomPlans();
  const createPlan = useCreateCustomPlan();
  const updatePlan = useUpdateCustomPlan();
  const deletePlan = useDeleteCustomPlan();
  const assignPlan = useAssignCustomPlan();
  const syncToStripe = useSyncCustomPlanToStripe();

  const isSuperAdmin = user?.roles?.includes(UserRoles.SUPER_ADMIN);

  // Filter state: null = all, true = test only, false = live only
  const [envFilter, setEnvFilter] = useState<boolean | null>(null);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomPlanRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomPlanRecord | null>(
    null,
  );
  const [assignTarget, setAssignTarget] = useState<CustomPlanRecord | null>(
    null,
  );

  // Handlers — defined before early returns to satisfy Rules of Hooks
  const handleCreate = useCallback(
    (values: PlanFormValues) => {
      const dto: CreateCustomPlanDto = {
        name: values.name,
        ...(values.companyUid ? { companyUid: values.companyUid } : {}),
        maxUsers: values.maxUsers,
        maxJobPositions: values.maxJobPositions,
        maxCandidatesPerPosition: values.maxCandidatesPerPosition,
        maxStorageMB: values.maxStorageMB,
        aiScoringCreditsPerMonth: values.aiScoringCreditsPerMonth,
        emailTemplatesEnabled: values.emailTemplatesEnabled,
        analyticsEnabled: values.analyticsEnabled,
        monthlyPrice: values.monthlyPrice,
        annualPrice: values.annualPrice,
        currency: values.currency,
      };
      createPlan.mutate(dto, { onSuccess: () => setCreateOpen(false) });
    },
    [createPlan],
  );

  const handleEdit = useCallback(
    (values: PlanFormValues) => {
      if (!editTarget) return;
      const dto: UpdateCustomPlanDto = {
        name: values.name,
        maxUsers: values.maxUsers,
        maxJobPositions: values.maxJobPositions,
        maxCandidatesPerPosition: values.maxCandidatesPerPosition,
        maxStorageMB: values.maxStorageMB,
        aiScoringCreditsPerMonth: values.aiScoringCreditsPerMonth,
        emailTemplatesEnabled: values.emailTemplatesEnabled,
        analyticsEnabled: values.analyticsEnabled,
        monthlyPrice: values.monthlyPrice,
        annualPrice: values.annualPrice,
        currency: values.currency,
      };
      updatePlan.mutate(
        { uid: editTarget.uid, dto },
        { onSuccess: () => setEditTarget(null) },
      );
    },
    [editTarget, updatePlan],
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deletePlan.mutate(deleteTarget.uid, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deletePlan]);

  const handleAssign = useCallback(
    (companyUid: string) => {
      if (!assignTarget) return;
      assignPlan.mutate(
        { uid: assignTarget.uid, companyUid },
        { onSuccess: () => setAssignTarget(null) },
      );
    },
    [assignTarget, assignPlan],
  );

  const handleSyncStripe = useCallback(
    (uid: string) => {
      syncToStripe.mutate(uid);
    },
    [syncToStripe],
  );

  // Permission guard
  if (!user) return <Navigate to="/login" />;
  if (!isSuperAdmin)
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <PageHeader
          title="custom_plans.title"
          subtitle="custom_plans.subtitle"
        />
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(7)].map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton width={80} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // Error state
  if (isError || !plans) {
    return (
      <Box>
        <PageHeader
          title="custom_plans.title"
          subtitle="custom_plans.subtitle"
        />
        <Typography color="error">{t("custom_plans.load_error")}</Typography>
      </Box>
    );
  }

  const formatPrice = (cents: number, currency: string) => {
    if (cents === 0) return t("custom_plans.free");
    return `${(cents / 100).toFixed(2)} ${currency}`;
  };

  const formatQuota = (value: number) =>
    value === -1 ? t("custom_plans.unlimited") : String(value);

  // Apply environment filter
  const filteredPlans =
    envFilter === null
      ? plans
      : plans.filter((p) => {
          if (envFilter === true) return p.stripeIsTestMode === true;
          if (envFilter === false) return p.stripeIsTestMode === false;
          return true;
        });

  return (
    <Box>
      <PageHeader
        title="custom_plans.title"
        subtitle="custom_plans.subtitle"
        action={{
          label: "custom_plans.create_plan",
          icon: <AddIcon />,
          onClick: () => setCreateOpen(true),
          variant: "contained",
        }}
      />

      {/* Environment filter chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          label={t("custom_plans.filter_all")}
          onClick={() => setEnvFilter(null)}
          color={envFilter === null ? "primary" : "default"}
          variant={envFilter === null ? "filled" : "outlined"}
        />
        <Chip
          label={t("custom_plans.filter_test")}
          onClick={() => setEnvFilter(envFilter === true ? null : true)}
          color={envFilter === true ? "warning" : "default"}
          variant={envFilter === true ? "filled" : "outlined"}
        />
        <Chip
          label={t("custom_plans.filter_live")}
          onClick={() => setEnvFilter(envFilter === false ? null : false)}
          color={envFilter === false ? "info" : "default"}
          variant={envFilter === false ? "filled" : "outlined"}
        />
      </Stack>

      {filteredPlans.length === 0 && plans.length > 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            {t("custom_plans.filter_no_results")}
          </Typography>
        </Paper>
      ) : filteredPlans.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("custom_plans.no_plans_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("custom_plans.no_plans_body")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            {t("custom_plans.create_plan")}
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("custom_plans.col_name")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("custom_plans.col_company")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  {t("custom_plans.col_monthly_price")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  {t("custom_plans.col_annual_price")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("custom_plans.col_quotas")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("custom_plans.col_stripe")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  {t("common.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow
                  key={plan.uid}
                  sx={{
                    "&:hover": { backgroundColor: "action.hover" },
                    transition: "background-color 0.15s",
                  }}
                >
                  {/* Name */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {plan.name}
                    </Typography>
                    <Chip
                      label={t("custom_plans.custom_badge")}
                      size="small"
                      color="secondary"
                      variant="filled"
                      sx={{ mt: 0.5, fontSize: "0.7rem", height: 20 }}
                    />
                  </TableCell>

                  {/* Company */}
                  <TableCell>
                    {plan.companyName ? (
                      <Typography variant="body2">
                        {plan.companyName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        {t("custom_plans.unassigned")}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Monthly price */}
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatPrice(plan.monthlyPrice, plan.currency)}
                    </Typography>
                  </TableCell>

                  {/* Annual price */}
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatPrice(plan.annualPrice, plan.currency)}
                    </Typography>
                  </TableCell>

                  {/* Quotas summary */}
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        {t("custom_plans.quota_users")}:{" "}
                        {formatQuota(plan.maxUsers)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("custom_plans.quota_positions")}:{" "}
                        {formatQuota(plan.maxJobPositions)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("custom_plans.quota_ai")}:{" "}
                        {formatQuota(plan.aiScoringCreditsPerMonth)}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Stripe sync status + links */}
                  <TableCell>
                    <StripeLinks plan={plan} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      {/* Sync to Stripe */}
                      <Tooltip title={t("custom_plans.sync_stripe_action")}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleSyncStripe(plan.uid)}
                            disabled={syncToStripe.isPending}
                            color="primary"
                          >
                            {syncToStripe.isPending &&
                            syncToStripe.variables === plan.uid ? (
                              <CircularProgress size={16} />
                            ) : (
                              <SyncIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Assign to company */}
                      <Tooltip title={t("custom_plans.assign_action")}>
                        <IconButton
                          size="small"
                          onClick={() => setAssignTarget(plan)}
                          color="default"
                        >
                          <AssignIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Edit */}
                      <Tooltip title={t("common.edit")}>
                        <IconButton
                          size="small"
                          onClick={() => setEditTarget(plan)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip title={t("common.delete")}>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(plan)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <PlanFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initial={null}
        onSubmit={handleCreate}
        isSubmitting={createPlan.isPending}
      />

      {/* Edit Dialog */}
      <PlanFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        initial={editTarget}
        onSubmit={handleEdit}
        isSubmitting={updatePlan.isPending}
      />

      {/* Assign Company Dialog */}
      <AssignDialog
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        plan={assignTarget}
        onAssign={handleAssign}
        isAssigning={assignPlan.isPending}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        plan={deleteTarget}
        onConfirm={handleDelete}
        isDeleting={deletePlan.isPending}
      />
    </Box>
  );
};

export default CustomPlansPage;
