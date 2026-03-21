import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  AccountTree as AccountTreeIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  CalendarMonth as CalendarMonthIcon,
  Psychology as PsychologyIcon,
  Email as EmailIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  CreditCard as CreditCardIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Extension as ExtensionIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";

// Import all markdown files as raw strings
import overviewMd from "../../docs/overview.md?raw";
import rolesMd from "../../docs/roles-permissions.md?raw";
import candidatesMd from "../../docs/candidates.md?raw";
import jobPositionsMd from "../../docs/job-positions.md?raw";
import hiringProcessesMd from "../../docs/hiring-processes.md?raw";
import applicationsMd from "../../docs/applications.md?raw";
import interviewsMd from "../../docs/interviews.md?raw";
import calendarMd from "../../docs/calendar.md?raw";
import aiScoringMd from "../../docs/ai-scoring.md?raw";
import emailTemplatesMd from "../../docs/email-templates.md?raw";
import analyticsMd from "../../docs/analytics.md?raw";
import teamManagementMd from "../../docs/team-management.md?raw";
import subscriptionMd from "../../docs/subscription.md?raw";
import adminPanelMd from "../../docs/admin-panel.md?raw";
import integrationsMd from "../../docs/integrations.md?raw";
import whyBorderlessMd from "../../docs/why-borderless.md?raw";

const SIDEBAR_WIDTH = 260;

interface DocSection {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  file: string;
}

const docContent: Record<string, string> = {
  overview: overviewMd,
  "roles-permissions": rolesMd,
  candidates: candidatesMd,
  "job-positions": jobPositionsMd,
  "hiring-processes": hiringProcessesMd,
  applications: applicationsMd,
  interviews: interviewsMd,
  calendar: calendarMd,
  "ai-scoring": aiScoringMd,
  "email-templates": emailTemplatesMd,
  analytics: analyticsMd,
  "team-management": teamManagementMd,
  subscription: subscriptionMd,
  "admin-panel": adminPanelMd,
  integrations: integrationsMd,
  "why-borderless": whyBorderlessMd,
};

const DocsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections: DocSection[] = [
    {
      id: "overview",
      labelKey: "docs.sections.overview",
      icon: <DashboardIcon />,
      file: "overview",
    },
    {
      id: "roles-permissions",
      labelKey: "docs.sections.roles",
      icon: <SecurityIcon />,
      file: "roles-permissions",
    },
    {
      id: "candidates",
      labelKey: "docs.sections.candidates",
      icon: <PeopleIcon />,
      file: "candidates",
    },
    {
      id: "job-positions",
      labelKey: "docs.sections.job_positions",
      icon: <WorkIcon />,
      file: "job-positions",
    },
    {
      id: "hiring-processes",
      labelKey: "docs.sections.hiring_processes",
      icon: <AccountTreeIcon />,
      file: "hiring-processes",
    },
    {
      id: "applications",
      labelKey: "docs.sections.applications",
      icon: <AssignmentIcon />,
      file: "applications",
    },
    {
      id: "interviews",
      labelKey: "docs.sections.interviews",
      icon: <VideoCallIcon />,
      file: "interviews",
    },
    {
      id: "calendar",
      labelKey: "docs.sections.calendar",
      icon: <CalendarMonthIcon />,
      file: "calendar",
    },
    {
      id: "ai-scoring",
      labelKey: "docs.sections.ai_scoring",
      icon: <PsychologyIcon />,
      file: "ai-scoring",
    },
    {
      id: "email-templates",
      labelKey: "docs.sections.email_templates",
      icon: <EmailIcon />,
      file: "email-templates",
    },
    {
      id: "analytics",
      labelKey: "docs.sections.analytics",
      icon: <BarChartIcon />,
      file: "analytics",
    },
    {
      id: "team-management",
      labelKey: "docs.sections.team_management",
      icon: <GroupIcon />,
      file: "team-management",
    },
    {
      id: "subscription",
      labelKey: "docs.sections.subscription",
      icon: <CreditCardIcon />,
      file: "subscription",
    },
    {
      id: "admin-panel",
      labelKey: "docs.sections.admin_panel",
      icon: <AdminPanelSettingsIcon />,
      file: "admin-panel",
    },
    {
      id: "integrations",
      labelKey: "docs.sections.integrations",
      icon: <ExtensionIcon />,
      file: "integrations",
    },
    {
      id: "why-borderless",
      labelKey: "docs.sections.why_borderless",
      icon: <AutoAwesomeIcon />,
      file: "why-borderless",
    },
  ];

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {t("docs.title")}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {t("docs.description")}
        </Typography>
      </Box>
      <List dense sx={{ flex: 1, overflow: "auto", py: 1 }}>
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 && index % 5 === 0 && (
              <Divider sx={{ my: 0.5, mx: 2 }} />
            )}
            <ListItem disablePadding>
              <ListItemButton
                selected={activeSection === section.id}
                onClick={() => handleSectionSelect(section.id)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color:
                      activeSection === section.id
                        ? "primary.contrastText"
                        : "text.secondary",
                  }}
                >
                  {section.icon}
                </ListItemIcon>
                <ListItemText
                  primary={t(section.labelKey)}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: activeSection === section.id ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const markdownContent = docContent[activeSection] ?? "";

  return (
    <Box
      sx={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}
    >
      {/* Mobile toggle button */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 72,
            left: 8,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Tooltip title={t("docs.toggle_sidebar")}>
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              size="small"
              sx={{
                bgcolor: "background.paper",
                boxShadow: 2,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              {mobileOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Sidebar — permanent on desktop, drawer on mobile */}
      {isMobile ? (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant="temporary"
          sx={{
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              top: 64,
              height: "calc(100% - 64px)",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 860,
            mx: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <MarkdownContent content={markdownContent} />
        </Paper>
      </Box>
    </Box>
  );
};

// ─── Markdown renderer component ─────────────────────────────────────────────

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <Box
      sx={{
        "& h1": {
          fontSize: "1.75rem",
          fontWeight: 700,
          mb: 2,
          mt: 0,
          color: "text.primary",
          lineHeight: 1.3,
        },
        "& h2": {
          fontSize: "1.25rem",
          fontWeight: 600,
          mt: 4,
          mb: 1.5,
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        },
        "& h3": {
          fontSize: "1.05rem",
          fontWeight: 600,
          mt: 3,
          mb: 1,
          color: "text.primary",
        },
        "& p": {
          fontSize: "0.9375rem",
          lineHeight: 1.7,
          mb: 1.5,
          color: "text.secondary",
        },
        "& ul, & ol": {
          pl: 3,
          mb: 1.5,
          "& li": {
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            mb: 0.5,
            color: "text.secondary",
          },
        },
        "& strong": {
          color: "text.primary",
          fontWeight: 600,
        },
        "& code": {
          fontFamily: "monospace",
          fontSize: "0.8125rem",
          bgcolor: "action.hover",
          color: "primary.main",
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5,
          border: "1px solid",
          borderColor: "divider",
        },
        "& pre": {
          bgcolor: "action.hover",
          borderRadius: 1,
          p: 2,
          overflow: "auto",
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          "& code": {
            bgcolor: "transparent",
            border: "none",
            p: 0,
            fontSize: "0.8125rem",
            color: "text.primary",
          },
        },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.light",
          ml: 0,
          pl: 2,
          py: 0.5,
          bgcolor: "action.hover",
          borderRadius: "0 4px 4px 0",
          mb: 2,
          "& p": {
            mb: 0,
            color: "text.secondary",
            fontStyle: "italic",
          },
        },
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          mb: 2,
          fontSize: "0.875rem",
          "& thead": {
            bgcolor: "action.hover",
            "& th": {
              p: 1.25,
              textAlign: "left",
              fontWeight: 600,
              color: "text.primary",
              borderBottom: "2px solid",
              borderColor: "divider",
              borderRight: "1px solid",
              borderRightColor: "divider",
              "&:last-child": {
                borderRight: "none",
              },
            },
          },
          "& tbody": {
            "& tr": {
              "&:nth-of-type(even)": {
                bgcolor: "action.selected",
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
              "& td": {
                p: 1.25,
                color: "text.secondary",
                borderBottom: "1px solid",
                borderColor: "divider",
                borderRight: "1px solid",
                borderRightColor: "divider",
                "&:last-child": {
                  borderRight: "none",
                },
              },
            },
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        },
        "& hr": {
          border: "none",
          borderTop: "1px solid",
          borderColor: "divider",
          my: 3,
        },
        "& a": {
          color: "primary.main",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  );
};

export default DocsPage;
