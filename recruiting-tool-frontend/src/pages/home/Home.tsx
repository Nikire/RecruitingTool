import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import {
  WorkOutline as WorkIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      titleKey: "home.features.candidate_management.title",
      descriptionKey: "home.features.candidate_management.description",
    },
    {
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      titleKey: "home.features.interview_scheduling.title",
      descriptionKey: "home.features.interview_scheduling.description",
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      titleKey: "home.features.application_tracking.title",
      descriptionKey: "home.features.application_tracking.description",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      titleKey: "home.features.team_collaboration.title",
      descriptionKey: "home.features.team_collaboration.description",
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      titleKey: "home.features.analytics_reporting.title",
      descriptionKey: "home.features.analytics_reporting.description",
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      titleKey: "home.features.multi_stage_hiring.title",
      descriptionKey: "home.features.multi_stage_hiring.description",
    },
  ];

  const benefits = [
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      titleKey: "home.benefits.save_time.title",
      descriptionKey: "home.benefits.save_time.description",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
      titleKey: "home.benefits.streamline_hiring.title",
      descriptionKey: "home.benefits.streamline_hiring.description",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 48 }} />,
      titleKey: "home.benefits.improve_collaboration.title",
      descriptionKey: "home.benefits.improve_collaboration.description",
    },
    {
      icon: <LightbulbIcon sx={{ fontSize: 48 }} />,
      titleKey: "home.benefits.data_driven.title",
      descriptionKey: "home.benefits.data_driven.description",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.9,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                fontWeight="bold"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  mb: 2,
                }}
              >
                {t("home.hero.headline")}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  fontSize: { xs: "1.1rem", md: "1.5rem" },
                  opacity: 0.95,
                }}
              >
                {t("home.hero.subheadline")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[8],
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("home.hero.cta_primary")}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/careers")}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("home.hero.cta_secondary")}
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <WorkIcon
                  sx={{
                    fontSize: { xs: 120, md: 200 },
                    opacity: 0.9,
                    filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.3))",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container
        maxWidth="xl"
        disableGutters
        sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight="bold"
            color="text.primary"
            sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
          >
            {t("home.features.section_title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto" }}
          >
            {t("home.features.section_subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card
                sx={{
                  height: "100%",
                  width: 350,
                  maxWidth: "100%",
                  mx: "auto",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[12],
                  },
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    textAlign: "center",
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      color: "primary.main",
                      mb: 1,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                    sx={{ fontSize: "1rem", mb: 0.5 }}
                  >
                    {t(feature.titleKey)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.813rem" }}
                  >
                    {t(feature.descriptionKey)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          py: { xs: 8, md: 12 },
        }}
      >
        <Container
          maxWidth="xl"
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 } }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              fontWeight="bold"
              color="text.primary"
              sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
            >
              {t("home.benefits.section_title")}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: "auto" }}
            >
              {t("home.benefits.section_subtitle")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* First Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                flexWrap: { xs: "wrap", sm: "nowrap" },
              }}
            >
              {benefits.slice(0, 2).map((benefit, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: "center",
                    p: 3,
                    width: { xs: "100%", sm: "50%" },
                    maxWidth: 400,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      color: "primary.main",
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {t(benefit.titleKey)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(benefit.descriptionKey)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Second Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                flexWrap: { xs: "wrap", sm: "nowrap" },
              }}
            >
              {benefits.slice(2, 4).map((benefit, index) => (
                <Box
                  key={index + 2}
                  sx={{
                    textAlign: "center",
                    p: 3,
                    width: { xs: "100%", sm: "50%" },
                    maxWidth: 400,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      color: "primary.main",
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {t(benefit.titleKey)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(benefit.descriptionKey)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Call-to-Action Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: "white",
            textAlign: "center",
            p: { xs: 4, md: 6 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CheckIcon
            sx={{
              position: "absolute",
              fontSize: 300,
              opacity: 0.1,
              top: -80,
              right: -80,
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
            >
              {t("home.cta.headline")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.95,
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
            >
              {t("home.cta.subheadline")}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 5,
                py: 2,
                fontSize: "1.2rem",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.9),
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[12],
                },
                transition: "all 0.3s ease",
              }}
            >
              {t("home.cta.button")}
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Home;
