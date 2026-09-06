import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import EventIcon from "@mui/icons-material/Event";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import toast from "react-hot-toast";
import SettingsCard from "../../components/settings/SettingsCard";
import StatusIndicator from "../../components/settings/StatusIndicator";
import CompanyCalendarSettingsCard from "../../components/settings/CompanyCalendarSettingsCard";
import {
  useCalendarConnectionStatus,
  useGetAuthUrl,
  useDisconnectCalendar,
} from "../../hooks/api/useGoogleCalendar";

const CalendarSettingsPage = () => {
  const { t } = useTranslation();

  const {
    data: connectionStatus,
    isLoading,
    refetch,
  } = useCalendarConnectionStatus();
  const { mutate: getAuthUrl, isPending: isGettingAuthUrl } = useGetAuthUrl();
  const { mutate: disconnectCalendar, isPending: isDisconnecting } =
    useDisconnectCalendar();

  const isConnected = connectionStatus?.connected ?? false;

  // Poll handle for the OAuth popup. Kept in a ref so it can be cleared on
  // unmount — a leaked interval used to poll a closed window forever.
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const handleConnect = () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // Opened synchronously, inside the click's user-activation window, so
    // popup blockers do not swallow it while the auth URL request is in
    // flight (same approach as api/files.ts#openFileInNewTab).
    const popup = window.open(
      "",
      "Google Calendar Authorization",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      toast.error(t("calendar_settings.popup_blocked"));
      return;
    }

    getAuthUrl(undefined, {
      onSuccess: (data) => {
        popup.location.href = data.authUrl;

        if (pollRef.current !== null) {
          window.clearInterval(pollRef.current);
        }
        pollRef.current = window.setInterval(() => {
          if (!popup.closed) return;

          if (pollRef.current !== null) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
          }

          // Closing the window is not proof of authorization, so only claim
          // success once the refetched status says we are connected.
          void refetch().then(({ data: status }) => {
            if (status?.connected) {
              toast.success(t("calendar_settings.connected_success"));
            } else {
              toast(t("calendar_settings.connection_not_completed"), {
                icon: "ℹ️",
              });
            }
          });
        }, 1000);
      },
      onError: () => {
        popup.close();
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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
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
        {/* Google Calendar Connection — must be configured first */}
        <Grid size={{ xs: 12 }}>
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

                <Box>
                  {isConnected ? (
                    <Stack spacing={2}>
                      <Alert severity="success" icon={<LinkIcon />}>
                        {t("calendar_settings.connected_message")}
                      </Alert>
                      <Button
                        variant="contained"
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

                <Alert severity="info" icon={<InfoIcon />}>
                  {t("calendar_settings.oauth_info")}
                </Alert>
              </Stack>
            )}
          </SettingsCard>
        </Grid>

        {/* Booking System Settings — requires Google Calendar */}
        <Grid size={{ xs: 12 }}>
          <CompanyCalendarSettingsCard
            isGoogleCalendarConnected={isConnected}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CalendarSettingsPage;
