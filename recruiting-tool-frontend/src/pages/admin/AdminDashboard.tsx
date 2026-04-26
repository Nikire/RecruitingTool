import { Box, Typography, Divider } from "@mui/material";
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Subscriptions as SubscriptionsIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  Email as EmailIcon,
  ForwardToInbox as ForwardToInboxIcon,
  Tune as TuneIcon,
  FlagOutlined as FlagOutlinedIcon,
  DisplaySettingsOutlined as DisplaySettingsOutlinedIcon,
  WebhookOutlined as WebhookOutlinedIcon,
  WorkspacePremiumOutlined as WorkspacePremiumOutlinedIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  MonitorHeart as MonitorHeartIcon,
  RocketLaunch as RocketLaunchIcon,
  EventNote as EventNoteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  BarChart as BarChartIcon,
  NewReleases as NewReleasesIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UnifiedStatCard } from "../../components/common";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const navigate = useNavigate();

  const managementItems = [
    {
      title: t("admin_dashboard.pipeline_analytics"),
      icon: <BarChartIcon />,
      color: "#0277bd",
      description: t("admin_dashboard.pipeline_analytics_desc"),
      path: "/admin/pipeline-analytics",
    },
    {
      title: t("admin_dashboard.revenue_dashboard"),
      icon: <TrendingUpIcon />,
      color: "#1565c0",
      description: t("admin_dashboard.revenue_dashboard_desc"),
      path: "/admin/revenue",
    },
    {
      title: t("admin_dashboard.quota_inspector"),
      icon: <SpeedIcon />,
      color: "#00695c",
      description: t("admin_dashboard.quota_inspector_desc"),
      path: "/admin/quota-inspector",
    },
    {
      title: t("admin_dashboard.company_health"),
      icon: <MonitorHeartIcon />,
      color: "#7b1fa2",
      description: t("admin_dashboard.company_health_desc"),
      path: "/admin/health",
    },
    {
      title: t("admin_dashboard.trial_tracker"),
      icon: <RocketLaunchIcon />,
      color: "#00838f",
      description: t("admin_dashboard.trial_tracker_desc"),
      path: "/admin/trials",
    },
    {
      title: t("admin_dashboard.demo_manager"),
      icon: <EventNoteIcon />,
      color: "#6a1b9a",
      description: t("admin_dashboard.demo_manager_desc"),
      path: "/admin/demos",
    },
    {
      title: t("admin_layout.companies"),
      icon: <BusinessIcon />,
      color: "#2e7d32",
      description: t("admin_dashboard.company_management_desc"),
      path: "/admin/companies",
    },
    {
      title: t("admin_layout.users"),
      icon: <PeopleIcon />,
      color: "#1976d2",
      description: t("admin_dashboard.user_management_desc"),
      path: "/admin/users",
    },
    {
      title: t("admin_layout.subscriptions"),
      icon: <SubscriptionsIcon />,
      color: "#ed6c02",
      description: t("admin_dashboard.subscriptions_desc"),
      path: "/admin/subscriptions",
    },
    {
      title: t("admin_layout.deleted_records"),
      icon: <RestoreFromTrashIcon />,
      color: "#d32f2f",
      description: t("admin_dashboard.deleted_records_desc"),
      path: "/admin/deleted-records",
    },
    {
      title: t("admin_layout.contact_messages"),
      icon: <EmailIcon />,
      color: "#0288d1",
      description: t("admin_dashboard.contact_messages_desc"),
      path: "/admin/contact-messages",
    },
    {
      title: t("admin_layout.email_logs"),
      icon: <ForwardToInboxIcon />,
      color: "#6a1b9a",
      description: t("admin_dashboard.email_logs_desc"),
      path: "/admin/email-logs",
    },
    {
      title: t("admin_dashboard.email_deliverability"),
      icon: <MarkEmailReadIcon />,
      color: "#00695c",
      description: t("admin_dashboard.email_deliverability_desc"),
      path: "/admin/email-deliverability",
    },
    {
      title: t("admin_dashboard.changelog"),
      icon: <NewReleasesIcon />,
      color: "#1565c0",
      description: t("admin_dashboard.changelog_desc"),
      path: "/admin/changelog",
    },
  ];

  const configurationItems = [
    {
      title: t("admin_layout.plan_limits"),
      icon: <TuneIcon />,
      color: "#9c27b0",
      description: t("admin_dashboard.plan_limits_desc"),
      path: "/admin/plan-limits",
    },
    {
      title: t("admin_layout.feature_flags"),
      icon: <FlagOutlinedIcon />,
      color: "#f57c00",
      description: t("admin_dashboard.feature_flags_desc"),
      path: "/admin/feature-flags",
    },
    {
      title: t("admin_layout.general_settings"),
      icon: <DisplaySettingsOutlinedIcon />,
      color: "#455a64",
      description: t("admin_dashboard.general_settings_desc"),
      path: "/admin/general-settings",
    },
    {
      title: t("admin_layout.webhooks"),
      icon: <WebhookOutlinedIcon />,
      color: "#00838f",
      description: t("admin_dashboard.webhooks_desc"),
      path: "/admin/webhooks",
    },
    {
      title: t("admin_layout.custom_plans"),
      icon: <WorkspacePremiumOutlinedIcon />,
      color: "#5e35b1",
      description: t("admin_dashboard.custom_plans_desc"),
      path: "/admin/custom-plans",
    },
    {
      title: t("admin_layout.ai_quota"),
      icon: <PsychologyIcon />,
      color: "#e91e63",
      description: t("admin_dashboard.ai_quota_desc"),
      path: "/admin/ai-quota",
    },
    {
      title: t("admin_layout.settings"),
      icon: <SettingsIcon />,
      color: "#37474f",
      description: t("admin_dashboard.system_settings_desc"),
      path: "/admin/settings",
    },
    {
      title: t("admin_layout.docs"),
      icon: <ArticleIcon />,
      color: "#558b2f",
      description: t("admin_dashboard.docs_desc"),
      path: "/admin/docs",
    },
  ];

  return (
    <Box sx={{ width: "100%", py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 4, sm: 5 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}
        >
          {t("admin_dashboard.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("admin_dashboard.welcome", { name: user?.name })}
        </Typography>
      </Box>

      {/* Management section */}
      <SectionHeader label={t("admin_layout.group_management")} />
      <CardGrid>
        {managementItems.map((item) => (
          <UnifiedStatCard
            key={item.path}
            title={item.title}
            icon={item.icon}
            color={item.color}
            subtitle={item.description}
            onClick={() => navigate(item.path)}
            variant="navigation"
          />
        ))}
      </CardGrid>

      <Divider sx={{ my: 4 }} />

      {/* Configuration section */}
      <SectionHeader label={t("admin_layout.group_configuration")} />
      <CardGrid>
        {configurationItems.map((item) => (
          <UnifiedStatCard
            key={item.path}
            title={item.title}
            icon={item.icon}
            color={item.color}
            subtitle={item.description}
            onClick={() => navigate(item.path)}
            variant="navigation"
          />
        ))}
      </CardGrid>
    </Box>
  );
};

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Typography
    variant="overline"
    fontWeight={700}
    color="text.secondary"
    sx={{ display: "block", mb: 2, letterSpacing: 1.2 }}
  >
    {label}
  </Typography>
);

const CardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
      },
      gap: 2.5,
      mb: 1,
    }}
  >
    {children}
  </Box>
);

export default AdminDashboard;
