import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EventIcon from "@mui/icons-material/Event";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";
import ScheduleIcon from "@mui/icons-material/Schedule";
import toast from "react-hot-toast";
import SettingsCard from "../../components/settings/SettingsCard";
import StatusIndicator from "../../components/settings/StatusIndicator";
import {
  useCalendarConnectionStatus,
  useGetAuthUrl,
  useDisconnectCalendar,
} from "../../hooks/api/useGoogleCalendar";

/**
 * CalendarSettingsPage - Google Calendar integration settings
 *
 * Features:
 * - Connect/disconnect Google Calendar via OAuth
 * - Connection status indicator
 * - Working hours selector for each day of week
 * - Meeting buffer time setting
 * - Default meeting duration setting
 */

interface WorkingHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface CalendarSettings {
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  bufferTime: number; // minutes
  defaultDuration: number; // minutes
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
  enabled: true,
  startTime: "09:00",
  endTime: "17:00",
};

const DEFAULT_SETTINGS: CalendarSettings = {
  workingHours: {
    monday: DEFAULT_WORKING_HOURS,
    tuesday: DEFAULT_WORKING_HOURS,
    wednesday: DEFAULT_WORKING_HOURS,
    thursday: DEFAULT_WORKING_HOURS,
    friday: DEFAULT_WORKING_HOURS,
    saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
  },
  bufferTime: 15,
  defaultDuration: 60,
};

const CalendarSettingsPage = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);

  // API hooks
  const {
    data: connectionStatus,
    isLoading,
    refetch,
  } = useCalendarConnectionStatus();
  const { mutate: getAuthUrl, isPending: isGettingAuthUrl } = useGetAuthUrl();
  const { mutate: disconnectCalendar, isPending: isDisconnecting } =
    useDisconnectCalendar();

  const isConnected = connectionStatus?.connected ?? false;

  const handleConnect = () => {
    getAuthUrl(undefined, {
      onSuccess: (data) => {
        // Open OAuth URL in a new window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          data.authUrl,
          "Google Calendar Authorization",
          `width=${width},height=${height},left=${left},top=${top}`,
        );

        // Poll for popup close or listen for callback
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Refetch connection status
            refetch();
            toast.success(t("calendar_settings.connection_check"));
          }
        }, 1000);
      },
      onError: () => {
        toast.error(t("calendar_settings.connect_error"));
      },
    });
  };

  const handleDisconnect = () => {
    disconnectCalendar(undefined, {
      onSuccess: () => {
        toast.success(t("calendar_settings.disconnected_success"));
      },
      onError: () => {
        toast.error(t("calendar_settings.disconnect_error"));
      },
    });
  };

  const handleWorkingHoursChange = (
    day: keyof CalendarSettings["workingHours"],
    field: keyof WorkingHours,
    value: boolean | string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Call backend API to save settings
    // For now, just show success message
    toast.success(t("calendar_settings.settings_saved"));
  };

  const daysOfWeek: Array<keyof CalendarSettings["workingHours"]> = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {t("calendar_settings.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("calendar_settings.subtitle")}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Google Calendar Connection Card */}
        <Grid item xs={12}>
          <SettingsCard
            icon={<EventIcon />}
            title={t("calendar_settings.google_calendar")}
            iconColor="primary.main"
            action={
              <Tooltip title={t("calendar_settings.refresh_status")}>
                <IconButton
                  onClick={() => refetch()}
                  disabled={isLoading}
                  size="small"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            }
          >
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={3}>
                {/* Connection Status */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t("calendar_settings.connection_status")}
                  </Typography>
                  <StatusIndicator
                    status={isConnected ? "ok" : "warning"}
                    label={
                      isConnected
                        ? "calendar_settings.connected"
                        : "calendar_settings.not_connected"
                    }
                    translate
                  />
                </Box>

                {/* Connection Actions */}
                <Box>
                  {isConnected ? (
                    <Stack spacing={2}>
                      <Alert severity="success" icon={<LinkIcon />}>
                        {t("calendar_settings.connected_message")}
                      </Alert>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LinkOffIcon />}
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                      >
                        {isDisconnecting
                          ? t("calendar_settings.disconnecting")
                          : t("calendar_settings.disconnect")}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Alert severity="info" icon={<InfoIcon />}>
                        {t("calendar_settings.not_connected_message")}
                      </Alert>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LinkIcon />}
                        onClick={handleConnect}
                        disabled={isGettingAuthUrl}
                      >
                        {isGettingAuthUrl
                          ? t("calendar_settings.connecting")
                          : t("calendar_settings.connect")}
                      </Button>
                    </Stack>
                  )}
                </Box>

                {/* Information */}
                <Alert severity="info" icon={<InfoIcon />}>
                  {t("calendar_settings.oauth_info")}
                </Alert>
              </Stack>
            )}
          </SettingsCard>
        </Grid>

        {/* Working Hours Settings */}
        <Grid item xs={12}>
          <SettingsCard
            icon={<AccessTimeIcon />}
            title={t("calendar_settings.working_hours")}
            iconColor="success.main"
          >
            <Stack spacing={3}>
              <Alert severity="info" icon={<InfoIcon />}>
                {t("calendar_settings.working_hours_description")}
              </Alert>

              <Divider />

              {daysOfWeek.map((day) => {
                const hours = settings.workingHours[day];
                return (
                  <Paper
                    key={day}
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: hours.enabled
                        ? "background.paper"
                        : "action.hover",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              textTransform: "capitalize",
                              fontWeight: 500,
                            }}
                          >
                            {t(`calendar_settings.days.${day}`)}
                          </Typography>
                          {hours.enabled && (
                            <Chip
                              label={t("calendar_settings.active")}
                              size="small"
                              color="success"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={hours.enabled ? "enabled" : "disabled"}
                          onChange={(e) =>
                            handleWorkingHoursChange(
                              day,
                              "enabled",
                              e.target.value === "enabled",
                            )
                          }
                          label={t("calendar_settings.status")}
                        >
                          <MenuItem value="enabled">
                            {t("calendar_settings.enabled")}
                          </MenuItem>
                          <MenuItem value="disabled">
                            {t("calendar_settings.disabled")}
                          </MenuItem>
                        </TextField>
                      </Grid>
                      {hours.enabled && (
                        <>
                          <Grid item xs={6} sm={3}>
                            <TextField
                              type="time"
                              size="small"
                              fullWidth
                              label={t("calendar_settings.start_time")}
                              value={hours.startTime}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  day,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <TextField
                              type="time"
                              size="small"
                              fullWidth
                              label={t("calendar_settings.end_time")}
                              value={hours.endTime}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  day,
                                  "endTime",
                                  e.target.value,
                                )
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Paper>
                );
              })}
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Meeting Settings */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<ScheduleIcon />}
            title={t("calendar_settings.meeting_settings")}
            iconColor="warning.main"
          >
            <Stack spacing={3}>
              <Box>
                <TextField
                  select
                  label={t("calendar_settings.buffer_time")}
                  value={settings.bufferTime}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      bufferTime: Number(e.target.value),
                    }))
                  }
                  fullWidth
                  helperText={t("calendar_settings.buffer_time_helper")}
                  size="medium"
                >
                  <MenuItem value={0}>
                    {t("calendar_settings.no_buffer")}
                  </MenuItem>
                  <MenuItem value={5}>
                    5 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={10}>
                    10 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={15}>
                    15 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={30}>
                    30 {t("calendar_settings.minutes")}
                  </MenuItem>
                </TextField>
              </Box>

              <Box>
                <TextField
                  select
                  label={t("calendar_settings.default_duration")}
                  value={settings.defaultDuration}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      defaultDuration: Number(e.target.value),
                    }))
                  }
                  fullWidth
                  helperText={t("calendar_settings.default_duration_helper")}
                  size="medium"
                >
                  <MenuItem value={15}>
                    15 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={30}>
                    30 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={45}>
                    45 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={60}>
                    60 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={90}>
                    90 {t("calendar_settings.minutes")}
                  </MenuItem>
                  <MenuItem value={120}>
                    120 {t("calendar_settings.minutes")}
                  </MenuItem>
                </TextField>
              </Box>

              <Divider />

              <Button
                variant="contained"
                onClick={handleSaveSettings}
                fullWidth
                size="large"
                startIcon={<SaveIcon />}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                {t("common.save")}
              </Button>
            </Stack>
          </SettingsCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CalendarSettingsPage;
