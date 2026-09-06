import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Stack,
  Paper,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../../hooks/useNotificationPreferences";
import { UpdateNotificationPreferencesDto } from "../../types/notification-preferences.types";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";

const NotificationPreferencesPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    data: preferences,
    isLoading,
    isError,
  } = useNotificationPreferences();
  const { mutate: updatePreferences, isPending } =
    useUpdateNotificationPreferences();

  // Local state for immediate UI feedback
  const [localPreferences, setLocalPreferences] =
    useState<UpdateNotificationPreferencesDto>({});

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        emailApplicationStatus: preferences.emailApplicationStatus,
        emailInterviewScheduled: preferences.emailInterviewScheduled,
        emailNewCandidate: preferences.emailNewCandidate,
        emailSystemAnnouncement: preferences.emailSystemAnnouncement,
        inAppApplicationStatus: preferences.inAppApplicationStatus,
        inAppInterviewScheduled: preferences.inAppInterviewScheduled,
        inAppNewCandidate: preferences.inAppNewCandidate,
        inAppSystemAnnouncement: preferences.inAppSystemAnnouncement,
      });
    }
  }, [preferences]);

  const handleToggle = (field: keyof UpdateNotificationPreferencesDto) => {
    const newValue = !localPreferences[field];
    const updatedPreferences = {
      ...localPreferences,
      [field]: newValue,
    };

    // Update local state immediately for responsive UI
    setLocalPreferences(updatedPreferences);

    // Send update to backend. On failure the switch must go back to the value
    // the server still holds — otherwise the toast says the update failed while
    // the UI keeps showing the new position.
    updatePreferences(
      { [field]: newValue },
      {
        onError: () => {
          setLocalPreferences((prev) => ({ ...prev, [field]: !newValue }));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{t("notificationPreferences.loadError")}</Alert>
      </Container>
    );
  }

  const countEmailEnabled = Object.entries(localPreferences)
    .filter(([key]) => key.startsWith("email"))
    .filter(([, value]) => value === true).length;

  const countInAppEnabled = Object.entries(localPreferences)
    .filter(([key]) => key.startsWith("inApp"))
    .filter(([, value]) => value === true).length;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {t("notificationPreferences.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("notificationPreferences.description")}
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Email Notifications Section */}
        <Card
          elevation={2}
          sx={{
            overflow: "visible",
            transition: "box-shadow 0.3s",
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    mr: 2,
                  }}
                >
                  <EmailIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t("notificationPreferences.emailNotifications")}
                </Typography>
              </Box>
              <Chip
                label={t("notificationPreferences.active_count", {
                  count: countEmailEnabled,
                  total: 4,
                })}
                color="primary"
                size="small"
              />
            </Box>
            <Alert severity="info" icon={false} sx={{ mb: 2 }}>
              {t("notificationPreferences.emailDescription")}
            </Alert>

            <Divider sx={{ mb: 2 }} />

            <FormGroup>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: localPreferences.emailApplicationStatus
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.emailApplicationStatus ?? true}
                      onChange={() => handleToggle("emailApplicationStatus")}
                      disabled={isPending}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.emailApplicationStatus")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "notificationPreferences.emailApplicationStatusDesc",
                        )}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: localPreferences.emailInterviewScheduled
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.emailInterviewScheduled ?? true}
                      onChange={() => handleToggle("emailInterviewScheduled")}
                      disabled={isPending}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.emailInterviewScheduled")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "notificationPreferences.emailInterviewScheduledDesc",
                        )}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: localPreferences.emailNewCandidate
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.emailNewCandidate ?? true}
                      onChange={() => handleToggle("emailNewCandidate")}
                      disabled={isPending}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.emailNewCandidate")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("notificationPreferences.emailNewCandidateDesc")}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: localPreferences.emailSystemAnnouncement
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.emailSystemAnnouncement ?? true}
                      onChange={() => handleToggle("emailSystemAnnouncement")}
                      disabled={isPending}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.emailSystemAnnouncement")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "notificationPreferences.emailSystemAnnouncementDesc",
                        )}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>
            </FormGroup>
          </CardContent>
        </Card>

        {/* In-App Notifications Section */}
        <Card
          elevation={2}
          sx={{
            overflow: "visible",
            transition: "box-shadow 0.3s",
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    bgcolor: "secondary.main",
                    color: "white",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    mr: 2,
                  }}
                >
                  <NotificationsIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t("notificationPreferences.inAppNotifications")}
                </Typography>
              </Box>
              <Chip
                label={t("notificationPreferences.active_count", {
                  count: countInAppEnabled,
                  total: 4,
                })}
                color="secondary"
                size="small"
              />
            </Box>
            <Alert severity="info" icon={false} sx={{ mb: 2 }}>
              {t("notificationPreferences.inAppDescription")}
            </Alert>

            <Divider sx={{ mb: 2 }} />

            <FormGroup>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: localPreferences.inAppApplicationStatus
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inAppApplicationStatus ?? true}
                      onChange={() => handleToggle("inAppApplicationStatus")}
                      disabled={isPending}
                      color="secondary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.inAppApplicationStatus")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "notificationPreferences.inAppApplicationStatusDesc",
                        )}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: localPreferences.inAppInterviewScheduled
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inAppInterviewScheduled ?? true}
                      onChange={() => handleToggle("inAppInterviewScheduled")}
                      disabled={isPending}
                      color="secondary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.inAppInterviewScheduled")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "notificationPreferences.inAppInterviewScheduledDesc",
                        )}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: localPreferences.inAppNewCandidate
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inAppNewCandidate ?? true}
                      onChange={() => handleToggle("inAppNewCandidate")}
                      disabled={isPending}
                      color="secondary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.inAppNewCandidate")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("notificationPreferences.inAppNewCandidateDesc")}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: localPreferences.inAppSystemAnnouncement
                    ? "action.selected"
                    : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences.inAppSystemAnnouncement ?? true}
                      onChange={() => handleToggle("inAppSystemAnnouncement")}
                      disabled={isPending}
                      color="secondary"
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("notificationPreferences.inAppSystemAnnouncement")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "notificationPreferences.inAppSystemAnnouncementDesc",
                        )}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>
            </FormGroup>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default NotificationPreferencesPage;
