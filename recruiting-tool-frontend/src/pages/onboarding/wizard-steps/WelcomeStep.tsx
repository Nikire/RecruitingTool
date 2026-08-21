import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface WelcomeStepProps {
  /**
   * Finishes onboarding and navigates. Defaults to the HR dashboard when no
   * destination is given. Every exit from this step goes through here so the
   * `onboarding_completed` event fires exactly once, wherever the user lands.
   */
  onComplete: (destination?: string) => void;
}

/**
 * Quick-start actions. Every `path` is a route that exists in App.tsx:
 *   /hr/job-positions   App.tsx:444
 *   /settings/team      App.tsx:501
 *   /settings/calendar  App.tsx:464
 *   /hr/email-templates App.tsx:460
 */
const QUICK_START_ACTIONS: Array<{
  key: string;
  path: string;
  icon: React.ReactNode;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    key: "first_job",
    path: "/hr/job-positions",
    icon: <WorkIcon color="primary" />,
    labelKey: "onboarding.welcome.quick_steps.create_first_job",
    descriptionKey:
      "onboarding.welcome.quick_steps.create_first_job_description",
  },
  {
    key: "invite_team",
    path: "/settings/team",
    icon: <PeopleIcon color="primary" />,
    labelKey: "onboarding.welcome.quick_steps.add_team_members",
    descriptionKey:
      "onboarding.welcome.quick_steps.add_team_members_description",
  },
  {
    key: "connect_calendar",
    path: "/settings/calendar",
    icon: <CalendarTodayIcon color="primary" />,
    labelKey: "onboarding.welcome.quick_steps.connect_calendar",
    descriptionKey:
      "onboarding.welcome.quick_steps.connect_calendar_description",
  },
  {
    key: "email_templates",
    path: "/hr/email-templates",
    icon: <EmailIcon color="primary" />,
    labelKey: "onboarding.welcome.quick_steps.setup_email_templates",
    descriptionKey:
      "onboarding.welcome.quick_steps.setup_email_templates_description",
  },
];

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <RocketLaunchIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {t("onboarding.welcome.title")}
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          {t("onboarding.welcome.subtitle")}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t("onboarding.welcome.description")}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            {t("onboarding.welcome.quick_start_title")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t("onboarding.welcome.quick_start_hint")}
          </Typography>
          <List sx={{ mt: 1 }}>
            {QUICK_START_ACTIONS.map((action) => (
              <ListItem key={action.key} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => onComplete(action.path)}
                  sx={{ borderRadius: 1, bgcolor: "action.hover" }}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    {action.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={t(action.labelKey)}
                    secondary={t(action.descriptionKey)}
                    primaryTypographyProps={{
                      variant: "body1",
                      fontWeight: 600,
                    }}
                  />
                  <ChevronRightIcon color="action" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            {t("onboarding.welcome.resources_title")}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {/* In-app HR guide - App.tsx:480 */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => onComplete("/hr/guide")}
              >
                {t("onboarding.welcome.resources.guide")}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {/* Contact form - App.tsx:321 */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => onComplete("/contact")}
              >
                {t("onboarding.welcome.resources.support")}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => onComplete()}
          sx={{ px: 6, py: 1.5 }}
        >
          {t("onboarding.welcome.complete_setup")}
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomeStep;
