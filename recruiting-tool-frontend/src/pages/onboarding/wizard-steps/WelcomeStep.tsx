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
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface WelcomeStepProps {
  onComplete: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <PeopleIcon color="primary" />,
      titleKey: "onboarding.welcome.features.candidate_management.title",
      descriptionKey:
        "onboarding.welcome.features.candidate_management.description",
    },
    {
      icon: <WorkIcon color="primary" />,
      titleKey: "onboarding.welcome.features.job_postings.title",
      descriptionKey: "onboarding.welcome.features.job_postings.description",
    },
    {
      icon: <AssessmentIcon color="primary" />,
      titleKey: "onboarding.welcome.features.analytics.title",
      descriptionKey: "onboarding.welcome.features.analytics.description",
    },
    {
      icon: <EmailIcon color="primary" />,
      titleKey: "onboarding.welcome.features.email_templates.title",
      descriptionKey: "onboarding.welcome.features.email_templates.description",
    },
    {
      icon: <CalendarTodayIcon color="primary" />,
      titleKey: "onboarding.welcome.features.interview_scheduling.title",
      descriptionKey:
        "onboarding.welcome.features.interview_scheduling.description",
    },
  ];

  const quickSteps = [
    "onboarding.welcome.quick_steps.create_first_job",
    "onboarding.welcome.quick_steps.add_team_members",
    "onboarding.welcome.quick_steps.setup_email_templates",
    "onboarding.welcome.quick_steps.explore_dashboard",
  ];

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
            {t("onboarding.welcome.features_title")}
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 2,
                    height: "100%",
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <Box sx={{ mb: 1.5 }}>{feature.icon}</Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t(feature.titleKey)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t(feature.descriptionKey)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card
        sx={{ mb: 3, bgcolor: "primary.light", color: "primary.contrastText" }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            {t("onboarding.welcome.quick_start_title")}
          </Typography>
          <List>
            {quickSteps.map((step, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon sx={{ color: "success.main" }} />
                </ListItemIcon>
                <ListItemText
                  primary={t(step)}
                  primaryTypographyProps={{ variant: "body1", fontWeight: 500 }}
                />
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
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                href="https://docs.recruitingtool.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("onboarding.welcome.resources.documentation")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                href="https://support.recruitingtool.com"
                target="_blank"
                rel="noopener noreferrer"
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
          onClick={onComplete}
          sx={{ px: 6, py: 1.5 }}
        >
          {t("onboarding.welcome.complete_setup")}
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomeStep;
