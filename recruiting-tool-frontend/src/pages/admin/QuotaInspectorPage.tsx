import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BlockIcon from "@mui/icons-material/Block";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common";
import {
  CompanyQuotaItem,
  QuotaResourceUsage,
  useAdminQuotaOverview,
} from "../../api/adminQuota";

// ─── Types ──────────────────────────────────────────────────────────────────

type HealthStatus = "OK" | "WARNING" | "CRITICAL" | "EXCEEDED";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getHealthColor = (
  status: HealthStatus,
): "success" | "warning" | "error" | "default" => {
  switch (status) {
    case "OK":
      return "success";
    case "WARNING":
      return "warning";
    case "CRITICAL":
      return "error";
    case "EXCEEDED":
      return "error";
    default:
      return "default";
  }
};

const getProgressColor = (
  percentage: number,
): "success" | "warning" | "error" | "inherit" => {
  if (percentage >= 100) return "error";
  if (percentage >= 90) return "error";
  if (percentage >= 70) return "warning";
  return "success";
};

const getPlanColor = (plan: string): "default" | "primary" | "secondary" => {
  switch (plan) {
    case "PROFESSIONAL":
      return "primary";
    case "ENTERPRISE":
      return "secondary";
    default:
      return "default";
  }
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const ResourceBar: React.FC<{
  resource: QuotaResourceUsage;
  unlimitedLabel: string;
}> = ({ resource, unlimitedLabel }) => {
  const isUnlimited = resource.limit === -1;
  const displayText = isUnlimited
    ? `${resource.used} / ${unlimitedLabel}`
    : `${resource.used} / ${resource.limit}`;

  return (
    <Box sx={{ width: "100%", minWidth: 120 }}>
      {!isUnlimited && (
        <LinearProgress
          variant="determinate"
          value={Math.min(resource.percentage, 100)}
          color={getProgressColor(resource.percentage)}
          sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
        />
      )}
      <Typography variant="caption" color="text.secondary">
        {displayText}
      </Typography>
    </Box>
  );
};

const SummaryCard: React.FC<{
  label: string;
  count: number;
  color: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}> = ({ label, count, color, icon, isLoading }) => (
  <Card
    sx={{
      flex: 1,
      minWidth: 160,
      border: `1px solid ${alpha(color, 0.3)}`,
      borderLeft: `4px solid ${color}`,
      bgcolor: alpha(color, 0.08),
    }}
    elevation={0}
  >
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box sx={{ color }}>{icon}</Box>
        <Typography variant="caption" fontWeight={600} color={color}>
          {label}
        </Typography>
      </Box>
      {isLoading ? (
        <Skeleton width={40} height={36} />
      ) : (
        <Typography variant="h4" fontWeight={700} color={color}>
          {count}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const QuotaInspectorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [planFilter, setPlanFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const { data, isLoading, isFetching } = useAdminQuotaOverview({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    plan: planFilter || undefined,
    status: statusFilter || undefined,
  });

  const handlePlanChange = (e: SelectChangeEvent) => {
    setPlanFilter(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const columns: GridColDef<CompanyQuotaItem>[] = [
    {
      field: "name",
      headerName: t("quota_inspector.company"),
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<CompanyQuotaItem>) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            cursor: "pointer",
            color: "primary.main",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => navigate(`/admin/companies/${params.row.uid}`)}
        >
          {params.row.name}
        </Typography>
      ),
    },
    {
      field: "plan",
      headerName: t("quota_inspector.plan"),
      width: 140,
      renderCell: (params: GridRenderCellParams<CompanyQuotaItem>) => (
        <Chip
          label={params.row.plan}
          color={getPlanColor(params.row.plan)}
          variant="filled"
          size="small"
        />
      ),
    },
    {
      field: "jobPositions",
      headerName: t("quota_inspector.job_positions"),
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CompanyQuotaItem>) => (
        <ResourceBar
          resource={params.row.jobPositions}
          unlimitedLabel={t("quota_inspector.unlimited")}
        />
      ),
    },
    {
      field: "users",
      headerName: t("quota_inspector.users"),
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CompanyQuotaItem>) => (
        <ResourceBar
          resource={params.row.users}
          unlimitedLabel={t("quota_inspector.unlimited")}
        />
      ),
    },
    {
      field: "aiCredits",
      headerName: t("quota_inspector.ai_credits"),
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CompanyQuotaItem>) => (
        <ResourceBar
          resource={params.row.aiCredits}
          unlimitedLabel={t("quota_inspector.unlimited")}
        />
      ),
    },
    {
      field: "healthStatus",
      headerName: t("quota_inspector.health_status"),
      width: 140,
      renderCell: (params: GridRenderCellParams<CompanyQuotaItem>) => {
        const status = params.row.healthStatus as HealthStatus;
        const isExceeded = status === "EXCEEDED";
        return (
          <Chip
            label={t(`quota_inspector.${status.toLowerCase()}`)}
            color={getHealthColor(status)}
            variant="filled"
            size="small"
            sx={
              isExceeded
                ? {
                    bgcolor: "#c62828",
                    color: "#fff",
                    "& .MuiChip-label": { fontWeight: 700 },
                  }
                : undefined
            }
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader
        title={t("quota_inspector.title")}
        subtitle={t("quota_inspector.subtitle")}
        translate={false}
      />

      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
        {t("quota_inspector.description")}
      </Alert>

      {/* Summary cards */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <SummaryCard
          label={t("quota_inspector.ok")}
          count={data?.summary.okCount ?? 0}
          color="#2e7d32"
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("quota_inspector.warning")}
          count={data?.summary.warningCount ?? 0}
          color="#e65100"
          icon={<WarningAmberIcon fontSize="small" />}
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("quota_inspector.critical")}
          count={data?.summary.criticalCount ?? 0}
          color="#b71c1c"
          icon={<ErrorOutlineIcon fontSize="small" />}
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("quota_inspector.exceeded")}
          count={data?.summary.exceededCount ?? 0}
          color="#c62828"
          icon={<BlockIcon fontSize="small" />}
          isLoading={isLoading}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t("quota_inspector.filter_plan")}</InputLabel>
          <Select
            value={planFilter}
            label={t("quota_inspector.filter_plan")}
            onChange={handlePlanChange}
          >
            <MenuItem value="">{t("common.filter")}</MenuItem>
            <MenuItem value="FREE">FREE</MenuItem>
            <MenuItem value="PROFESSIONAL">PROFESSIONAL</MenuItem>
            <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t("quota_inspector.filter_status")}</InputLabel>
          <Select
            value={statusFilter}
            label={t("quota_inspector.filter_status")}
            onChange={handleStatusChange}
          >
            <MenuItem value="">{t("common.filter")}</MenuItem>
            <MenuItem value="OK">{t("quota_inspector.ok")}</MenuItem>
            <MenuItem value="WARNING">{t("quota_inspector.warning")}</MenuItem>
            <MenuItem value="CRITICAL">
              {t("quota_inspector.critical")}
            </MenuItem>
            <MenuItem value="EXCEEDED">
              {t("quota_inspector.exceeded")}
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <DataGrid
          rows={data?.companies ?? []}
          columns={columns}
          getRowId={(row) => row.uid}
          rowCount={data?.total ?? 0}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          loading={isLoading || isFetching}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-columnHeader": {
              bgcolor: "action.hover",
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default QuotaInspectorPage;
