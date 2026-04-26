import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import BusinessIcon from "@mui/icons-material/Business";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { PageHeader } from "../../components/common";
import { useAdminRevenueStats } from "../../api/adminRevenue";

const PIE_COLORS: Record<string, string> = {
  FREE: "#78909c",
  PROFESSIONAL: "#1976d2",
  ENTERPRISE: "#7b1fa2",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#2e7d32",
  TRIALING: "#ed6c02",
  PAST_DUE: "#c62828",
  CANCELED: "#546e7a",
};

const DEFAULT_COLOR = "#90a4ae";

/** KPI card with icon, title, value and optional sub-label */
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  subLabel?: string;
  isLoading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  subLabel,
  isLoading = false,
}) => {
  return (
    <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Box
            sx={{
              bgcolor: iconColor,
              color: "white",
              p: 1.25,
              borderRadius: 1.5,
              display: "flex",
              boxShadow: 1,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ lineHeight: 1.2, mt: 0.5 }}
          >
            {value}
          </Typography>
        )}
        {subLabel && !isLoading && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            {subLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

/** Chart card wrapper */
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  height?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  isLoading = false,
  height = 280,
}) => {
  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 2,
        height: "100%",
        transition: "box-shadow 0.3s ease",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.125rem" } }}
        >
          {title}
        </Typography>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            height={height}
            sx={{ borderRadius: 1 }}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

const RevenueDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useAdminRevenueStats();

  // MRR growth indicator
  const growth = data?.mrrGrowth ?? 0;
  const GrowthIcon =
    growth === 0
      ? TrendingFlatIcon
      : growth > 0
        ? TrendingUpIcon
        : TrendingDownIcon;
  const growthColor =
    growth === 0
      ? theme.palette.text.secondary
      : growth > 0
        ? theme.palette.success.main
        : theme.palette.error.main;

  const mrrSubLabel = isLoading
    ? undefined
    : `${growth >= 0 ? "+" : ""}${growth}% ${t("revenue_dashboard.vs_last_month")}`;

  return (
    <Box>
      <PageHeader
        title="revenue_dashboard.title"
        subtitle="revenue_dashboard.subtitle"
        translate={true}
      />

      {/* KPI Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Estimated MRR */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("revenue_dashboard.mrr")}
            value={isLoading ? "—" : `$${(data?.mrr ?? 0).toLocaleString()}`}
            icon={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <AttachMoneyIcon fontSize="small" />
                <GrowthIcon
                  fontSize="small"
                  sx={{ color: growthColor, ml: -0.5 }}
                />
              </Box>
            }
            iconColor="#1565c0"
            subLabel={mrrSubLabel}
            isLoading={isLoading}
          />
        </Grid>

        {/* Active companies */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("revenue_dashboard.active_companies")}
            value={isLoading ? "—" : (data?.activeCompanies ?? 0)}
            icon={<BusinessIcon fontSize="small" />}
            iconColor="#2e7d32"
            isLoading={isLoading}
          />
        </Grid>

        {/* Trialing */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("revenue_dashboard.trialing")}
            value={isLoading ? "—" : (data?.trialingCompanies ?? 0)}
            icon={<HourglassEmptyIcon fontSize="small" />}
            iconColor="#ed6c02"
            isLoading={isLoading}
          />
        </Grid>

        {/* Canceled this month */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={t("revenue_dashboard.canceled_this_month")}
            value={isLoading ? "—" : (data?.canceledThisMonth ?? 0)}
            icon={<CancelIcon fontSize="small" />}
            iconColor="#c62828"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1: Plan Distribution + Monthly Signups */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Plan Distribution Pie */}
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard
            title={t("revenue_dashboard.plan_distribution")}
            isLoading={isLoading}
            height={280}
          >
            {data && data.planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.planDistribution}
                    dataKey="count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {data.planDistribution.map((entry) => (
                      <Cell
                        key={entry.plan}
                        fill={PIE_COLORS[entry.plan] ?? DEFAULT_COLOR}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      value,
                      t("revenue_dashboard.companies"),
                    ]}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend
                    formatter={(value: string) =>
                      t(`revenue_dashboard.${value.toLowerCase()}`, {
                        defaultValue: value,
                      })
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("revenue_dashboard.no_data")}
                </Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>

        {/* Monthly Signups Line Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard
            title={t("revenue_dashboard.monthly_signups")}
            isLoading={isLoading}
            height={280}
          >
            {data && data.monthlySignups.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={data.monthlySignups}
                  margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.palette.divider }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.palette.divider }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      value,
                      t("revenue_dashboard.new_companies"),
                    ]}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: theme.palette.primary.main,
                      strokeWidth: 0,
                    }}
                    activeDot={{ r: 6, fill: theme.palette.primary.main }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("revenue_dashboard.no_data")}
                </Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Row 2: Status Breakdown Bar Chart */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <ChartCard
            title={t("revenue_dashboard.status_breakdown")}
            isLoading={isLoading}
            height={260}
          >
            {data && data.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.statusDistribution}
                  margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.palette.divider }}
                    tickFormatter={(value: string) =>
                      t(
                        `revenue_dashboard.${value.toLowerCase().replace("_", "_")}`,
                        {
                          defaultValue: value,
                        },
                      )
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.palette.divider }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      value,
                      t("revenue_dashboard.companies"),
                    ]}
                    labelFormatter={(label: string) =>
                      t(`revenue_dashboard.${label.toLowerCase()}`, {
                        defaultValue: label,
                      })
                    }
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.statusDistribution.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? DEFAULT_COLOR}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("revenue_dashboard.no_data")}
                </Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenueDashboardPage;
