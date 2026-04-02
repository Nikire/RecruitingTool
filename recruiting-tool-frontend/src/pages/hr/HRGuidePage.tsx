import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  PlayArrow as GettingStartedIcon,
  Work as JobPositionsIcon,
  Assignment as ApplicationsIcon,
  Group as CandidatesIcon,
  AccountTree as HiringProcessIcon,
  VideoCall as InterviewsIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";

import gettingStartedMd from "../../docs/hr-getting-started.md?raw";
import jobPositionsMd from "../../docs/hr-job-positions.md?raw";
import applicationsMd from "../../docs/hr-applications.md?raw";
import candidatesMd from "../../docs/hr-candidates.md?raw";
import hiringProcessesMd from "../../docs/hr-hiring-processes.md?raw";
import interviewsMd from "../../docs/hr-interviews.md?raw";
import analyticsMd from "../../docs/hr-analytics.md?raw";
import teamSettingsMd from "../../docs/hr-team-settings.md?raw";

const SIDEBAR_WIDTH = 240;

interface GuideSection {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
}

const guideContent: Record<string, string> = {
  "getting-started": gettingStartedMd,
  "job-positions": jobPositionsMd,
  applications: applicationsMd,
  candidates: candidatesMd,
  "hiring-processes": hiringProcessesMd,
  interviews: interviewsMd,
  analytics: analyticsMd,
  "team-settings": teamSettingsMd,
};

const HRGuidePage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeSection, setActiveSection] = useState<string>("getting-started");
  const [mobileOpen, setMobileOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      labelKey: "hrGuide.sections.getting_started",
      icon: <GettingStartedIcon />,
    },
    {
      id: "job-positions",
      labelKey: "hrGuide.sections.job_positions",
      icon: <JobPositionsIcon />,
    },
    {
      id: "applications",
      labelKey: "hrGuide.sections.applications",
      icon: <ApplicationsIcon />,
    },
    {
      id: "candidates",
      labelKey: "hrGuide.sections.candidates",
      icon: <CandidatesIcon />,
    },
    {
      id: "hiring-processes",
      labelKey: "hrGuide.sections.hiring_processes",
      icon: <HiringProcessIcon />,
    },
    {
      id: "interviews",
      labelKey: "hrGuide.sections.interviews",
      icon: <InterviewsIcon />,
    },
    {
      id: "analytics",
      labelKey: "hrGuide.sections.analytics",
      icon: <AnalyticsIcon />,
    },
    {
      id: "team-settings",
      labelKey: "hrGuide.sections.team_settings",
      icon: <SettingsIcon />,
    },
  ];

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

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
          {t("hrGuide.title")}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {t("hrGuide.description")}
        </Typography>
      </Box>
      <List dense sx={{ flex: 1, overflow: "auto", py: 1 }}>
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            {index === 5 && <Divider sx={{ my: 0.5, mx: 2 }} />}
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

  const markdownContent = guideContent[activeSection] ?? "";

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
          <Tooltip title={t("hrGuide.toggle_sidebar")}>
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

      {/* Sidebar */}
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
        ref={contentRef}
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

// ─── Markdown renderer ────────────────────────────────────────────────────────

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
              "&:last-child": { borderRight: "none" },
            },
          },
          "& tbody": {
            "& tr": {
              "&:nth-of-type(even)": { bgcolor: "action.selected" },
              "&:hover": { bgcolor: "action.hover" },
              "& td": {
                p: 1.25,
                color: "text.secondary",
                borderBottom: "1px solid",
                borderColor: "divider",
                borderRight: "1px solid",
                borderRightColor: "divider",
                "&:last-child": { borderRight: "none" },
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
          "&:hover": { textDecoration: "underline" },
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  );
};

export default HRGuidePage;
