import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import WorkIcon from "@mui/icons-material/Work";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  DashboardLayout,
  DashboardMenuItem,
  DashboardMenuGroup,
} from "../components/layout";
import { useTranslation } from "react-i18next";
import { useUserAtom } from "../hooks/api/state/useUserAtom";
import { hasRole } from "../utils/permissions";
import { UserRoles } from "../types/user.types";

/**
 * HRLayout - Layout component for HR panel with dedicated navigation
 * Accessible to HR, COMPANY_OWNER, ADMIN, and SUPER_ADMIN roles
 */
const HRLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const isCompanyOwner = hasRole(user, UserRoles.COMPANY_OWNER);

  interface ExtendedMenuItem extends DashboardMenuItem {
    requiresCompanyOwner?: boolean;
  }

  // Standalone items (always visible at top)
  const flatItems: DashboardMenuItem[] = [
    {
      text: t("hr_layout.dashboard"),
      icon: <DashboardIcon />,
      path: "/hr/dashboard",
    },
    {
      text: t("hr_layout.analytics"),
      icon: <BarChartIcon />,
      path: "/hr/analytics",
    },
    {
      text: t("hr_layout.email_templates"),
      icon: <EmailIcon />,
      path: "/hr/email-templates",
    },
  ];

  // Grouped sections
  const menuGroups: DashboardMenuGroup[] = [
    {
      label: t("hr_layout.group_recruitment"),
      icon: <WorkIcon />,
      items: [
        {
          text: t("hr_layout.applications"),
          icon: <AssignmentIcon />,
          path: "/hr/applications",
        },
        {
          text: t("hr_layout.candidates"),
          icon: <GroupIcon />,
          path: "/hr/candidates",
        },
        {
          text: t("hr_layout.job_positions"),
          icon: <WorkIcon />,
          path: "/hr/job-positions",
        },
        {
          text: t("hr_layout.hiring_processes"),
          icon: <AccountTreeIcon />,
          path: "/hr/hiring-processes",
        },
      ],
    },
    {
      label: t("hr_layout.group_scheduling"),
      icon: <EventIcon />,
      items: [
        {
          text: t("hr_layout.meetings"),
          icon: <EventIcon />,
          path: "/hr/calendar",
        },
        {
          text: t("hr_layout.interviews"),
          icon: <EventNoteIcon />,
          path: "/hr/interviews",
        },
      ],
    },
    {
      label: t("hr_layout.group_settings"),
      icon: <SettingsIcon />,
      items: [
        {
          text: t("hr_layout.calendar"),
          icon: <CalendarMonthIcon />,
          path: "/settings/calendar",
        },
        {
          text: t("hr_layout.team"),
          icon: <PeopleIcon />,
          path: "/settings/team",
        },
        {
          text: t("hr_layout.billing"),
          icon: <ReceiptIcon />,
          path: "/hr/billing",
          requiresCompanyOwner: true,
        } as ExtendedMenuItem,
        {
          text: t("hr_layout.company_profile"),
          icon: <BusinessIcon />,
          path: "/hr/settings/company",
          requiresCompanyOwner: true,
        } as ExtendedMenuItem,
      ],
    },
  ];

  // Filter items based on company owner status
  const canShowMenuItem = (item: DashboardMenuItem) => {
    const extended = item as ExtendedMenuItem;
    if (extended.requiresCompanyOwner && !isCompanyOwner) {
      return false;
    }
    return true;
  };

  return (
    <DashboardLayout
      title={t("hr_layout.title")}
      menuItems={flatItems}
      menuGroups={menuGroups}
      ariaLabel={t("hr_layout.aria_label")}
      canShowMenuItem={canShowMenuItem}
    />
  );
};

export default HRLayout;
