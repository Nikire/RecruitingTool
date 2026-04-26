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
  Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common";
import {
  ConversionReadiness,
  TrialCompanyItem,
  useAdminTrialOverview,
} from "../../api/adminTrials";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getScoreColor = (score: number): string => {
  if (score >= 70) return "#2e7d32";
  if (score >= 40) return "#f57c00";
  return "#c62828";
};

const getScoreBgColor = (score: number): string => {
  if (score >= 70) return "#e8f5e9";
  if (score >= 40) return "#fff3e0";
  return "#ffebee";
};

const getPlanColor = (
  plan: string,
): "default" | "primary" | "secondary" | "info" => {
  switch (plan) {
    case "PROFESSIONAL":
      return "primary";
    case "ENTERPRISE":
      return "secondary";
    default:
      return "default";
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

// ─── Readiness Chip ──────────────────────────────────────────────────────────

const ReadinessChip: React.FC<{
  readiness: ConversionReadiness;
  label: string;
}> = ({ readiness, label }) => {
  if (readiness === "HOT")
    return (
      <Chip
        label={label}
        variant="filled"
        size="small"
        sx={{ bgcolor: "#c62828", color: "#fff" }}
      />
    );
  if (readiness === "WARM")
    return <Chip label={label} color="warning" variant="filled" size="small" />;
  return <Chip label={label} color="info" variant="filled" size="small" />;
};

// ─── Signal Cell ─────────────────────────────────────────────────────────────

const SignalCell: React.FC<{ value: number; met: boolean }> = ({
  value,
  met,
}) => (
  <Typography
    variant="body2"
    fontWeight={met ? 700 : 400}
    color={met ? "success.main" : "text.disabled"}
  >
    {value}
  </Typography>
);

// ─── Page ────────────────────────────────────────────────────────────────────

const TrialTrackerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [readinessFilter, setReadinessFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [page, setPage] = useState(0); // DataGrid uses 0-based pages
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching } = useAdminTrialOverview({
    page: page + 1,
    limit: pageSize,
    readiness: readinessFilter || undefined,
    plan: planFilter || undefined,
  });

  const handleReadinessChange = (e: SelectChangeEvent<string>) => {
    setReadinessFilter(e.target.value);
    setPage(0);
  };

  const handlePlanChange = (e: SelectChangeEvent<string>) => {
    setPlanFilter(e.target.value);
    setPage(0);
  };

  const readinessLabel = (r: ConversionReadiness): string => {
    switch (r) {
      case "HOT":
        return t("trial_tracker.hot");
      case "WARM":
        return t("trial_tracker.warm");
      case "COLD":
        return t("trial_tracker.cold");
    }
  };

  const columns: GridColDef<TrialCompanyItem>[] = [
    {
      field: "name",
      headerName: t("quota_inspector.company"),
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, string>) => (
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
      width: 130,
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, string>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            label={`${params.value} / ${params.row.subscriptionStatus}`}
            color={getPlanColor(params.value ?? "")}
            variant="filled"
            size="small"
          />
        </Box>
      ),
    },
    {
      field: "daysOnPlatform",
      headerName: t("trial_tracker.days_on_platform"),
      width: 130,
      type: "number",
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "activationScore",
      headerName: t("trial_tracker.activation_score"),
      width: 140,
      type: "number",
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, number>) => {
        const score = params.value ?? 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 28,
                borderRadius: 1.5,
                bgcolor: getScoreBgColor(score),
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
      field: "conversionReadiness",
      headerName: t("trial_tracker.conversion_readiness"),
      width: 160,
      renderCell: (
        params: GridRenderCellParams<TrialCompanyItem, ConversionReadiness>,
      ) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <ReadinessChip
            readiness={params.value ?? "COLD"}
            label={readinessLabel(params.value ?? "COLD")}
          />
        </Box>
      ),
    },
    {
      field: "jobPositionsCreated",
      headerName: t("trial_tracker.jobs"),
      width: 80,
      type: "number",
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <SignalCell
            value={params.value ?? 0}
            met={(params.value ?? 0) >= 1}
          />
        </Box>
      ),
    },
    {
      field: "candidatesAdded",
      headerName: t("trial_tracker.candidates"),
      width: 100,
      type: "number",
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <SignalCell
            value={params.value ?? 0}
            met={(params.value ?? 0) >= 5}
          />
        </Box>
      ),
    },
    {
      field: "applicationsReceived",
      headerName: t("trial_tracker.applications"),
      width: 120,
      type: "number",
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <SignalCell
            value={params.value ?? 0}
            met={(params.value ?? 0) >= 3}
          />
        </Box>
      ),
    },
    {
      field: "teamMembersInvited",
      headerName: t("trial_tracker.team"),
      width: 80,
      type: "number",
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, number>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <SignalCell
            value={params.value ?? 0}
            met={(params.value ?? 0) >= 2}
          />
        </Box>
      ),
    },
    {
      field: "hasOutreachRecord",
      headerName: "CRM",
      width: 160,
      renderCell: (params: GridRenderCellParams<TrialCompanyItem, boolean>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {params.value ? (
            <Chip
              label={t("trial_tracker.in_crm")}
              color="success"
              variant="filled"
              size="small"
              onClick={() => navigate("/admin/outreach-crm")}
              sx={{ cursor: "pointer" }}
            />
          ) : (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => navigate("/admin/outreach-crm")}
              sx={{ fontSize: "0.75rem", py: 0.25, px: 1 }}
            >
              {t("trial_tracker.add_to_crm")}
            </Button>
          )}
        </Box>
      ),
    },
  ];

  const summary = data?.summary;

  return (
    <Box sx={{ width: "100%", py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader
        title="trial_tracker.title"
        subtitle="trial_tracker.subtitle"
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
          label={t("trial_tracker.hot")}
          count={summary?.hotCount ?? 0}
          icon={<LocalFireDepartmentIcon fontSize="small" />}
          color="#c62828"
          bgColor="#ffebee"
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("trial_tracker.warm")}
          count={summary?.warmCount ?? 0}
          icon={<WhatshotIcon fontSize="small" />}
          color="#e65100"
          bgColor="#fff3e0"
          isLoading={isLoading}
        />
        <SummaryCard
          label={t("trial_tracker.cold")}
          count={summary?.coldCount ?? 0}
          icon={<AcUnitIcon fontSize="small" />}
          color="#1565c0"
          bgColor="#e3f2fd"
          isLoading={isLoading}
        />
      </Box>

      {/* Filter row */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t("trial_tracker.filter_readiness")}</InputLabel>
          <Select
            value={readinessFilter}
            label={t("trial_tracker.filter_readiness")}
            onChange={handleReadinessChange}
          >
            <MenuItem value="">
              {t("common.filter")} — {t("common.select")}
            </MenuItem>
            <MenuItem value="HOT">{t("trial_tracker.hot")}</MenuItem>
            <MenuItem value="WARM">{t("trial_tracker.warm")}</MenuItem>
            <MenuItem value="COLD">{t("trial_tracker.cold")}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t("trial_tracker.filter_plan")}</InputLabel>
          <Select
            value={planFilter}
            label={t("trial_tracker.filter_plan")}
            onChange={handlePlanChange}
          >
            <MenuItem value="">
              {t("common.filter")} — {t("common.select")}
            </MenuItem>
            <MenuItem value="FREE">{t("trial_tracker.plan_free")}</MenuItem>
            <MenuItem value="TRIALING">
              {t("trial_tracker.plan_trialing")}
            </MenuItem>
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

export default TrialTrackerPage;
