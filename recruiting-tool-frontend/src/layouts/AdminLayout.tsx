import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import EmailIcon from "@mui/icons-material/Email";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import TuneIcon from "@mui/icons-material/Tune";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import DisplaySettingsOutlinedIcon from "@mui/icons-material/DisplaySettingsOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ArticleIcon from "@mui/icons-material/Article";
import CampaignIcon from "@mui/icons-material/Campaign";
import SendIcon from "@mui/icons-material/Send";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InsightsIcon from "@mui/icons-material/Insights";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import BarChartIcon from "@mui/icons-material/BarChart";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useUserAtom } from "../hooks/api/state/useUserAtom";
import { hasRole } from "../utils/permissions";
import { UserRoles } from "../types/user.types";
import {
  DashboardLayout,
  DashboardMenuItem,
  DashboardMenuGroup,
} from "../components/layout";
import { useTranslation } from "react-i18next";

/**
 * AdminLayout - Layout component for system administration
 * Accessible to ADMIN and SUPER_ADMIN roles only
 */
const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const isSuperAdmin = hasRole(user, UserRoles.SUPER_ADMIN);

  // Standalone items
  const flatItems: DashboardMenuItem[] = [
    {
      text: t("admin_layout.dashboard"),
      icon: <DashboardIcon />,
      path: "/admin",
      requiresSuperAdmin: false,
    },
  ];

  // Grouped sections
  const menuGroups: DashboardMenuGroup[] = [
    {
      label: t("admin_layout.group_outreach"),
      icon: <CampaignIcon />,
      items: [
        {
          text: t("admin_layout.outreach_crm"),
          icon: <TrackChangesIcon />,
          path: "/admin/outreach-crm",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.outreach_templates"),
          icon: <CampaignIcon />,
          path: "/admin/outreach-templates",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.outreach_campaigns"),
          icon: <SendIcon />,
          path: "/admin/outreach-campaigns",
          requiresSuperAdmin: false,
        },
      ],
    },
    {
      label: t("admin_layout.group_management"),
      icon: <ManageAccountsIcon />,
      items: [
        {
          text: t("admin_layout.companies"),
          icon: <BusinessIcon />,
          path: "/admin/companies",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.users"),
          icon: <PeopleIcon />,
          path: "/admin/users",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.subscriptions"),
          icon: <SubscriptionsIcon />,
          path: "/admin/subscriptions",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.deleted_records"),
          icon: <RestoreFromTrashIcon />,
          path: "/admin/deleted-records",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.contact_messages"),
          icon: <EmailIcon />,
          path: "/admin/contact-messages",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.email_logs"),
          icon: <ForwardToInboxIcon />,
          path: "/admin/email-logs",
          requiresSuperAdmin: true,
        },
      ],
    },
    {
      label: t("admin_layout.group_business_intelligence"),
      icon: <InsightsIcon />,
      items: [
        {
          text: t("admin_layout.revenue_dashboard"),
          icon: <TrendingUpIcon />,
          path: "/admin/revenue",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.quota_inspector"),
          icon: <SpeedIcon />,
          path: "/admin/quota-inspector",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.company_health"),
          icon: <MonitorHeartIcon />,
          path: "/admin/health",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.trial_tracker"),
          icon: <RocketLaunchIcon />,
          path: "/admin/trials",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.pipeline_analytics"),
          icon: <BarChartIcon />,
          path: "/admin/pipeline-analytics",
          requiresSuperAdmin: false,
        },
      ],
    },
    {
      label: t("admin_layout.group_operations"),
      icon: <BuildIcon />,
      items: [
        {
          text: t("admin_layout.demo_bookings"),
          icon: <EventIcon />,
          path: "/admin/demos",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.email_deliverability"),
          icon: <MarkEmailReadIcon />,
          path: "/admin/email-deliverability",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.changelog"),
          icon: <NewReleasesIcon />,
          path: "/admin/changelog",
          requiresSuperAdmin: false,
        },
        {
          text: t("admin_layout.task_tracker"),
          icon: <AssignmentIcon />,
          path: "/admin/tasks",
          requiresSuperAdmin: false,
        },
      ],
    },
    {
      label: t("admin_layout.group_configuration"),
      icon: <SettingsIcon />,
      items: [
        {
          text: t("admin_layout.plan_limits"),
          icon: <TuneIcon />,
          path: "/admin/plan-limits",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.feature_flags"),
          icon: <FlagOutlinedIcon />,
          path: "/admin/feature-flags",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.general_settings"),
          icon: <DisplaySettingsOutlinedIcon />,
          path: "/admin/general-settings",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.webhooks"),
          icon: <WebhookOutlinedIcon />,
          path: "/admin/webhooks",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.custom_plans"),
          icon: <WorkspacePremiumOutlinedIcon />,
          path: "/admin/custom-plans",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.ai_quota"),
          icon: <PsychologyIcon />,
          path: "/admin/ai-quota",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.settings"),
          icon: <SettingsIcon />,
          path: "/admin/settings",
          requiresSuperAdmin: true,
        },
        {
          text: t("admin_layout.docs"),
          icon: <ArticleIcon />,
          path: "/admin/docs",
          requiresSuperAdmin: true,
        },
      ],
    },
  ];

  // Filter items based on super admin status
  const canShowMenuItem = (item: DashboardMenuItem) => {
    if (item.requiresSuperAdmin && !isSuperAdmin) {
      return false;
    }
    return true;
  };

  return (
    <DashboardLayout
      title={t("admin_layout.title")}
      menuItems={flatItems}
      menuGroups={menuGroups}
      ariaLabel={t("admin_layout.aria_label")}
      canShowMenuItem={canShowMenuItem}
    />
  );
};

export default AdminLayout;
