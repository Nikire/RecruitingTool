import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common";
import {
  CompanyHealthItem,
  RiskTier,
  useAdminCompanyHealth,
} from "../../api/adminHealth";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getScoreColor = (
  score: number,
): "success.main" | "warning.main" | "#e65100" | "error.main" => {
  if (score >= 80) return "success.main";
  if (score >= 50) return "warning.main";
  if (score >= 20) return "#e65100";
  return "error.main";
};

const getPlanColor = (
  plan: string,
): "default" | "primary" | "secondary" | "info" => {
  switch (plan) {
    case "PROFESSIONAL":
      return "primary";
    case "ENTERPRISE":
      return "secondary";
    case "FREE":
      return "default";
    default:
      return "info";
  }
};

// ─── Summary Card ────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isLoading: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  count,
  icon,
  color,
  bgColor,
  isLoading,
}) => (
  <Card
    variant="outlined"
    sx={{
      flex: 1,
      minWidth: 160,
      borderLeft: `4px solid ${color}`,
      borderRadius: 2,
    }}
  >
    <CardContent
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 2,
        "&:last-child": { pb: 2 },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        {isLoading ? (
          <>
            <Skeleton width={40} height={28} />
            <Skeleton width={80} height={18} />
          </>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
              {count}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              {label}
            </Typography>
          </>
        )}
      </Box>
    </CardContent>
  </Card>
);

// ─── Risk Tier Chip ──────────────────────────────────────────────────────────

const RiskTierChip: React.FC<{ tier: RiskTier; label: string }> = ({
  tier,
  label,
}) => {
  if (tier === "HEALTHY")
    return <Chip label={label} color="success" variant="filled" size="small" />;
  if (tier === "AT_RISK")
    return <Chip label={label} color="warning" variant="filled" size="small" />;
  if (tier === "CHURNING")
    return (
      <Chip
        label={label}
        variant="filled"
        size="small"
        sx={{ bgcolor: "#e65100", color: "#fff" }}
      />
    );
  return <Chip label={label} color="error" variant="filled" size="small" />;
};

// ─── Page ────────────────────────────────────────────────────────────────────

const CompanyHealthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [riskTierFilter, setRiskTierFilter] = useState<string>("");
  const [page, setPage] = useState(0); // DataGrid uses 0-based pages
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching } = useAdminCompanyHealth({
    page: page + 1,
    limit: pageSize,
    riskTier: riskTierFilter || undefined,
  });

  const handleRiskTierChange = (e: SelectChangeEvent<string>) => {
    setRiskTierFilter(e.target.value);
    setPage(0);
  };

  const riskTierLabel = (tier: RiskTier): string => {
    switch (tier) {
      case "HEALTHY":
        return t("company_health.healthy");
      case "AT_RISK":
        return t("company_health.at_risk");
      case "CHURNING":
        return t("company_health.churning");
      case "CRITICAL":
        return t("company_health.critical");
    }
  };

  const columns: GridColDef<CompanyHealthItem>[] = [
    {
      field: "name",
      headerName: t("quota_inspector.company"),
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<CompanyHealthItem, string>) => (
        <Box
          sx={{
            cursor: "pointer",
            color: "primary.main",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
          onClick={() => navigate(`/admin/companies/${params.row.uid}`)}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "plan",
      headerName: t("quota_inspector.plan"),
      width: 140,
      renderCell: (params: GridRenderCellParams<CompanyHealthItem, string>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            label={params.value}
            color={getPlanColor(params.value ?? "")}
            variant="filled"
            size="small"
          />
        </Box>
      ),
    },
    {
      field: "healthScore",
      headerName: t("company_health.health_score"),
      width: 130,
      renderCell: (params: GridRenderCellParams<CompanyHealthItem, number>) => {
        const score = params.value ?? 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 28,
                borderRadius: 1.5,
                bgcolor: `${getScoreColor(score)}22`,
                color: getScoreColor(score),
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {score}
            </Box>
          </Box>
        );
      },
    },
    {
      field: "riskTier",
      headerName: t("company_health.risk_tier"),
      width: 130,
      renderCell: (
        params: GridRenderCellParams<CompanyHealthItem, RiskTier>,
      ) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <RiskTierChip
            tier={params.value ?? "CRITICAL"}
            label={riskTierLabel(params.value ?? "CRITICAL")}
          />
        </Box>
      ),
    },
    {
      field: "lastLoginDaysAgo",
      headerName: t("company_health.last_login"),
      width: 150,
      renderCell: (
        params: GridRenderCellParams<CompanyHealthItem, number | null>,
      ) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2" color="text.secondary">
            {params.value === null
              ? t("company_health.never")
              : t("company_health.days_ago", { count: params.value })}
          </Typography>
        </Box>
      ),
    },
    {
      field: "activeJobPositions",
      headerName: t("company_health.active_jobs"),
      width: 130,
      type: "number",
      renderCell: (params: GridRenderCellParams<CompanyHealthItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "applicationsThisMonth",
      headerName: t("company_health.apps_this_month"),
      width: 160,
      type: "number",
      renderCell: (params: GridRenderCellParams<CompanyHealthItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "hiringActivitiesThisMonth",
      headerName: t("company_health.hiring_activities"),
      width: 170,
      type: "number",
      renderCell: (params: GridRenderCellParams<CompanyHealthItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
  ];

  const summary = data?.summary;

  return (
    <Box sx={{ width: "100%", py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader
        title="company_health.title"
        subtitle="company_health.subtitle"
      />

      {/* Summary Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard
          label={t("company_health.healthy")}
          count={summary?.healthyCount ?? 0}
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          color="#2e7d32"
          bgColor="#e8f5e9"
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("company_health.at_risk")}
          count={summary?.atRiskCount ?? 0}
          icon={<WarningAmberIcon fontSize="small" />}
          color="#e65100"
          bgColor="#fff3e0"
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("company_health.churning")}
          count={summary?.churningCount ?? 0}
          icon={<TrendingDownIcon fontSize="small" />}
          color="#bf360c"
          bgColor="#fbe9e7"
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("company_health.critical")}
          count={summary?.criticalCount ?? 0}
          icon={<ErrorOutlineIcon fontSize="small" />}
          color="#c62828"
          bgColor="#ffebee"
          isLoading={isLoading}
        />
      </Box>

      {/* Filter row */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t("company_health.filter_risk")}</InputLabel>
          <Select
            value={riskTierFilter}
            label={t("company_health.filter_risk")}
            onChange={handleRiskTierChange}
          >
            <MenuItem value="">
              {t("common.filter")} — {t("common.select")}
            </MenuItem>
            <MenuItem value="HEALTHY">{t("company_health.healthy")}</MenuItem>
            <MenuItem value="AT_RISK">{t("company_health.at_risk")}</MenuItem>
            <MenuItem value="CHURNING">{t("company_health.churning")}</MenuItem>
            <MenuItem value="CRITICAL">{t("company_health.critical")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={data?.companies ?? []}
          columns={columns}
          getRowId={(row) => row.uid}
          loading={isLoading || isFetching}
          paginationMode="server"
          rowCount={data?.total ?? 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 2,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.default",
              fontWeight: 700,
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default CompanyHealthPage;
