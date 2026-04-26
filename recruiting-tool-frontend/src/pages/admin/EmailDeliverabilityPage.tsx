import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/common";
import {
  useEmailDeliverabilityStats,
  useEmailDeliverabilityPerType,
  EmailDeliverabilityPerTypeItem,
} from "../../api/adminEmailDeliverability";

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  isLoading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  isLoading,
}) => (
  <Card variant="outlined">
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Box sx={{ color: iconColor, display: "flex" }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {title}
        </Typography>
      </Box>
      {isLoading ? (
        <Skeleton variant="text" width={80} height={36} />
      ) : (
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// ─── Health chip ─────────────────────────────────────────────────────────────

const HealthChip: React.FC<{ bounceRate: number }> = ({ bounceRate }) => {
  const { t } = useTranslation();

  if (bounceRate > 5) {
    return (
      <Chip
        label={t("email_deliverability.health_critical")}
        color="error"
        size="small"
        variant="filled"
      />
    );
  }
  if (bounceRate >= 2) {
    return (
      <Chip
        label={t("email_deliverability.health_warning")}
        color="warning"
        size="small"
        variant="filled"
      />
    );
  }
  return (
    <Chip
      label={t("email_deliverability.health_ok")}
      color="success"
      size="small"
      variant="filled"
    />
  );
};

// ─── Per-type DataGrid columns ────────────────────────────────────────────────

const usePerTypeColumns = (): GridColDef<EmailDeliverabilityPerTypeItem>[] => {
  const { t } = useTranslation();

  return [
    {
      field: "emailType",
      headerName: t("email_deliverability.email_type"),
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "total",
      headerName: t("email_deliverability.total_sent"),
      flex: 0.8,
      minWidth: 90,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "delivered",
      headerName: t("email_deliverability.delivered"),
      flex: 0.8,
      minWidth: 90,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "opened",
      headerName: t("email_deliverability.opened"),
      flex: 0.8,
      minWidth: 80,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "bounced",
      headerName: t("email_deliverability.bounced"),
      flex: 0.8,
      minWidth: 80,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "bounceRate",
      headerName: t("email_deliverability.bounce_rate"),
      flex: 0.8,
      minWidth: 100,
      type: "number",
      align: "left",
      headerAlign: "left",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value}%</Typography>
      ),
    },
    {
      field: "health",
      headerName: "Health",
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <HealthChip bounceRate={params.row.bounceRate as number} />
      ),
    },
  ];
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const EmailDeliverabilityPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } =
    useEmailDeliverabilityStats();
  const { data: perTypeData, isLoading: perTypeLoading } =
    useEmailDeliverabilityPerType();

  const columns = usePerTypeColumns();
  const perTypeRows = (perTypeData?.perType ?? []).map((row, idx) => ({
    ...row,
    id: idx,
  }));

  const showHighBounceWarning = stats && !statsLoading && stats.bounceRate > 5;

  return (
    <Box sx={{ width: "100%", py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader
        title={t("email_deliverability.title")}
        subtitle={t("email_deliverability.subtitle")}
        translate={false}
      />

      {/* High bounce warning */}
      {showHighBounceWarning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t("email_deliverability.high_bounce_warning")}
        </Alert>
      )}

      {/* KPI cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(3, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <KpiCard
          title={t("email_deliverability.total_sent")}
          value={stats?.totalSent ?? 0}
          icon={<EmailIcon />}
          iconColor="#1976d2"
          isLoading={statsLoading}
        />
        <KpiCard
          title={t("email_deliverability.delivery_rate")}
          value={`${stats?.deliveryRate ?? 0}%`}
          icon={<CheckCircleIcon />}
          iconColor="#2e7d32"
          isLoading={statsLoading}
        />
        <KpiCard
          title={t("email_deliverability.open_rate")}
          value={`${stats?.openRate ?? 0}%`}
          icon={<VisibilityIcon />}
          iconColor="#0288d1"
          isLoading={statsLoading}
        />
        <KpiCard
          title={t("email_deliverability.bounce_rate")}
          value={`${stats?.bounceRate ?? 0}%`}
          icon={<ErrorOutlineIcon />}
          iconColor="#ed6c02"
          isLoading={statsLoading}
        />
        <KpiCard
          title={t("email_deliverability.spam")}
          value={stats?.spam ?? 0}
          icon={<ReportGmailerrorredIcon />}
          iconColor="#c62828"
          isLoading={statsLoading}
        />
      </Box>

      {/* Per email type table */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        {t("email_deliverability.per_type_title")}
      </Typography>
      <Paper variant="outlined" sx={{ mb: 4 }}>
        <DataGrid
          rows={perTypeRows}
          columns={columns}
          loading={perTypeLoading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              alignItems: "center",
              display: "flex",
            },
          }}
        />
      </Paper>

      {/* Recent bounces */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        {t("email_deliverability.recent_bounces")}
      </Typography>
      {statsLoading ? (
        <Paper variant="outlined">
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          ))}
        </Paper>
      ) : stats?.recentBounces.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {t("email_deliverability.no_bounces")}
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {stats?.recentBounces.map((bounce, idx) => (
              <ListItem
                key={bounce.uid}
                divider={idx < (stats?.recentBounces.length ?? 0) - 1}
                sx={{ alignItems: "flex-start", gap: 1 }}
              >
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {bounce.recipientEmail}
                      </Typography>
                      {bounce.bounceType && (
                        <Chip
                          label={bounce.bounceType}
                          size="small"
                          color={
                            bounce.bounceType === "hard" ? "error" : "warning"
                          }
                          variant="filled"
                        />
                      )}
                      <Chip
                        label={bounce.emailType}
                        size="small"
                        variant="filled"
                        color="default"
                      />
                    </Box>
                  }
                  secondary={
                    <Box
                      component="span"
                      sx={{ display: "flex", flexDirection: "column", mt: 0.5 }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        noWrap
                      >
                        {bounce.subject}
                      </Typography>
                      {bounce.bouncedAt && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(bounce.bouncedAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default EmailDeliverabilityPage;
