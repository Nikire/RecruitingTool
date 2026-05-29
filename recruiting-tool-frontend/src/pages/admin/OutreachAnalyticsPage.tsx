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
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ReplyIcon from "@mui/icons-material/Reply";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
import { useProspectAnalytics } from "../../hooks/api/useProspectTracking";

const PIE_COLORS = [
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
];

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  subtitle?: string;
  isLoading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  subtitle,
  isLoading,
}) => (
  <Card variant="outlined">
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: `${iconColor}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton width={60} height={32} />
          ) : (
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ── Chart Card ────────────────────────────────────────────────────────────────

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  height?: number;
}> = ({ title, children, isLoading, height = 280 }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {isLoading ? (
        <Skeleton variant="rectangular" height={height} />
      ) : (
        <Box sx={{ height }}>{children}</Box>
      )}
    </CardContent>
  </Card>
);

// ── Main Component ────────────────────────────────────────────────────────────

const OutreachAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, isError } = useProspectAnalytics();

  // Translate funnel labels
  const funnelData =
    data?.funnel.map((f) => ({
      ...f,
      label: t(`outreach_crm.status_${f.status.toLowerCase()}`),
    })) ?? [];

  // Translate source labels
  const sourceData =
    data?.bySource.map((s) => ({
      ...s,
      label: t(`outreach_crm.source_${s.source.toLowerCase()}`),
    })) ?? [];

  // Translate status labels
  const statusData =
    data?.byStatus.map((s) => ({
      ...s,
      label: t(`outreach_crm.status_${s.status.toLowerCase()}`),
    })) ?? [];

  // Format dates for activities chart
  const activitiesData =
    data?.activitiesOverTime.map((a) => ({
      ...a,
      label: new Date(a.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    })) ?? [];

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t("errors.generic")}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="outreach_analytics.title"
        subtitle="outreach_analytics.subtitle"
      />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            title={t("outreach_analytics.kpi_total")}
            value={data?.totalProspects ?? 0}
            icon={<TrackChangesIcon />}
            iconColor="#1976d2"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            title={t("outreach_analytics.kpi_response_rate")}
            value={`${data?.responseRate ?? 0}%`}
            icon={<ReplyIcon />}
            iconColor="#ed6c02"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            title={t("outreach_analytics.kpi_demos")}
            value={data?.demosScheduled ?? 0}
            icon={<EventIcon />}
            iconColor="#9c27b0"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            title={t("outreach_analytics.kpi_conversion")}
            value={`${data?.conversionRate ?? 0}%`}
            icon={<CheckCircleIcon />}
            iconColor="#2e7d32"
            subtitle={
              data
                ? t("outreach_analytics.avg_days", {
                    days: data.avgDaysToConvert,
                  })
                : undefined
            }
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Conversion Funnel */}
      <Box sx={{ mb: 3 }}>
        <ChartCard
          title={t("outreach_analytics.funnel_title")}
          isLoading={isLoading}
          height={220}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ left: 16, right: 32, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="label"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [
                  value,
                  t("outreach_analytics.companies"),
                ]}
              />
              <Bar dataKey="count" fill={theme.palette.primary.main} radius={4}>
                {funnelData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === funnelData.length - 1
                        ? theme.palette.success.main
                        : theme.palette.primary.main
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      {/* By Source + By Status */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title={t("outreach_analytics.by_source_title")}
            isLoading={isLoading}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ label, percent }) =>
                    percent > 0.05
                      ? `${label} (${(percent * 100).toFixed(0)}%)`
                      : ""
                  }
                  labelLine={false}
                >
                  {sourceData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title={t("outreach_analytics.by_status_title")}
            isLoading={isLoading}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ left: 0, right: 8, top: 8, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [
                    value,
                    t("outreach_analytics.companies"),
                  ]}
                />
                <Bar dataKey="count" fill={theme.palette.info.main} radius={4}>
                  {statusData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Activities over time */}
      <ChartCard
        title={t("outreach_analytics.activities_title")}
        isLoading={isLoading}
        height={240}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={activitiesData}
            margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval={4}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [
                value,
                t("outreach_analytics.activities"),
              ]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </Box>
  );
};

export default OutreachAnalyticsPage;
