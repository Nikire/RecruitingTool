import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BusinessIcon from "@mui/icons-material/Business";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PageHeader } from "../../components/common";
import { useAdminPipelineAnalytics } from "../../api/adminPipelineAnalytics";

// Colour palette for source pie chart
const SOURCE_COLORS = [
  "#1976d2",
  "#2e7d32",
  "#ed6c02",
  "#7b1fa2",
  "#00838f",
  "#c62828",
  "#558b2f",
  "#6a1b9a",
  "#f9a825",
  "#37474f",
  "#00695c",
  "#bf360c",
  "#1565c0",
];

// ── KPI Card ──────────────────────────────────────────────────────────────────

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
}) => (
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

// ── Chart Card ────────────────────────────────────────────────────────────────

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
}) => (
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

// ── Month label formatter: "2025-04" → "Apr" ─────────────────────────────────
const formatMonthLabel = (value: string): string => {
  const [year, month] = value.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString("default", { month: "short" });
};

// ── Page ─────────────────────────────────────────────────────────────────────

const PipelineAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useAdminPipelineAnalytics();

  const stats = data?.platformStats;

  // Growth badge for Applications This Month
  const growth = stats?.applicationsLastMonthGrowth ?? 0;
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

  const appsGrowthLabel = isLoading
    ? undefined
    : `${growth >= 0 ? "+" : ""}${growth}% ${t("pipeline_analytics.vs_last_month")}`;

  return (
    <Box>
      <PageHeader
        title="pipeline_analytics.title"
        subtitle={
          isLoading
            ? "pipeline_analytics.subtitle"
            : t("pipeline_analytics.platform_note", {
                count: stats?.totalActiveCompanies ?? 0,
              })
        }
        translate={!isLoading}
      />

      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
        {t("pipeline_analytics.description")}
      </Alert>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Applications */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            title={t("pipeline_analytics.total_applications")}
            value={
              isLoading ? "—" : (stats?.totalApplications ?? 0).toLocaleString()
            }
            icon={<AssignmentIcon fontSize="small" />}
            iconColor="#1565c0"
            isLoading={isLoading}
          />
        </Grid>

        {/* Applications This Month */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            title={t("pipeline_analytics.apps_this_month")}
            value={
              isLoading
                ? "—"
                : (stats?.applicationsThisMonth ?? 0).toLocaleString()
            }
            icon={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <AssignmentIcon fontSize="small" />
                <GrowthIcon
                  fontSize="small"
                  sx={{ color: growthColor, ml: -0.5 }}
                />
              </Box>
            }
            iconColor="#1976d2"
            subLabel={appsGrowthLabel}
            isLoading={isLoading}
          />
        </Grid>

        {/* Open Positions */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            title={t("pipeline_analytics.open_positions")}
            value={
              isLoading ? "—" : (stats?.openPositions ?? 0).toLocaleString()
            }
            icon={<WorkIcon fontSize="small" />}
            iconColor="#2e7d32"
            subLabel={
              isLoading
                ? undefined
                : `${stats?.totalPositions ?? 0} ${t("pipeline_analytics.total_positions")}`
            }
            isLoading={isLoading}
          />
        </Grid>

        {/* Avg Time to Hire */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            title={t("pipeline_analytics.avg_time_to_hire")}
            value={
              isLoading
                ? "—"
                : `${stats?.avgTimeToHireDays ?? 0} ${t("pipeline_analytics.days")}`
            }
            icon={<AccessTimeIcon fontSize="small" />}
            iconColor="#ed6c02"
            isLoading={isLoading}
          />
        </Grid>

        {/* Conversion Rate */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            title={t("pipeline_analytics.conversion_rate")}
            value={isLoading ? "—" : `${stats?.conversionRate ?? 0}%`}
            icon={<ShowChartIcon fontSize="small" />}
            iconColor="#7b1fa2"
            subLabel={
              isLoading
                ? undefined
                : `${stats?.closedPositions ?? 0} ${t("pipeline_analytics.closed_positions")}`
            }
            isLoading={isLoading}
          />
        </Grid>

        {/* Active Companies */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard
            title={t("pipeline_analytics.active_companies")}
            value={
              isLoading
                ? "—"
                : (stats?.totalActiveCompanies ?? 0).toLocaleString()
            }
            icon={<BusinessIcon fontSize="small" />}
            iconColor="#00695c"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        {/* Monthly Applications Line Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard
            title={t("pipeline_analytics.monthly_applications")}
            isLoading={isLoading}
            height={280}
          >
            {data && data.monthlyApplications.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={data.monthlyApplications}
                  margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonthLabel}
                    tick={{
                      fontSize: 11,
                      fill: theme.palette.text.secondary,
                    }}
                    tickLine={false}
                    axisLine={{ stroke: theme.palette.divider }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: theme.palette.text.secondary,
                    }}
                    tickLine={false}
                    axisLine={{ stroke: theme.palette.divider }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      value,
                      t("pipeline_analytics.applications"),
                    ]}
                    labelFormatter={(label: string) => formatMonthLabel(label)}
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
              <NoDataPlaceholder
                height={280}
                label={t("pipeline_analytics.no_data")}
              />
            )}
          </ChartCard>
        </Grid>

        {/* Application Sources Pie Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard
            title={t("pipeline_analytics.application_sources")}
            isLoading={isLoading}
            height={280}
          >
            {data && data.applicationSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.applicationSources}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.applicationSources.map((entry, index) => (
                      <Cell
                        key={entry.source}
                        fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      value,
                      t("pipeline_analytics.applications"),
                    ]}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder
                height={280}
                label={t("pipeline_analytics.no_data")}
              />
            )}
          </ChartCard>
        </Grid>

        {/* Interviews KPI summary bar */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent
              sx={{
                p: { xs: 2, sm: 2.5 },
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: "#6a1b9a",
                    color: "white",
                    p: 1,
                    borderRadius: 1.5,
                    display: "flex",
                  }}
                >
                  <EventNoteIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {t("pipeline_analytics.total_interviews")}
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={60} height={28} />
                  ) : (
                    <Typography variant="h5" fontWeight={700}>
                      {(stats?.totalInterviews ?? 0).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: "#00838f",
                    color: "white",
                    p: 1,
                    borderRadius: 1.5,
                    display: "flex",
                  }}
                >
                  <EventNoteIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {t("pipeline_analytics.interviews_this_month")}
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={60} height={28} />
                  ) : (
                    <Typography variant="h5" fontWeight={700}>
                      {(stats?.interviewsThisMonth ?? 0).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ── Empty state helper ────────────────────────────────────────────────────────

const NoDataPlaceholder: React.FC<{ height: number; label: string }> = ({
  height,
  label,
}) => (
  <Box
    sx={{
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "action.hover",
      borderRadius: 1,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default PipelineAnalyticsPage;
