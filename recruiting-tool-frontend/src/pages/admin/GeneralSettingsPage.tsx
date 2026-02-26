import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import {
  BusinessOutlined as CompanyIcon,
  NotificationsOutlined as NotificationsIcon,
  PublicOutlined as TimezoneIcon,
  LanguageOutlined as LocaleIcon,
  BadgeOutlined as NameIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";
import PageHeader from "../../components/common/PageHeader";
import AccessDeniedMessage from "../../components/common/AccessDeniedMessage";

/**
 * Displays a read-only info row with an icon, label and placeholder value.
 */
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
    <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center", pt: 0.25 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Box>
);

/**
 * GeneralSettingsPage - App-wide general settings (stub)
 *
 * Shows company settings and notification preferences as read-only
 * placeholders. Full editing support will be implemented in a future
 * release once backend endpoints are ready.
 *
 * Access: SUPER_ADMIN only
 */
const GeneralSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isSuperAdmin = user?.roles?.includes(UserRoles.SUPER_ADMIN);
  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;
  }

  return (
    <Box>
      <PageHeader
        title="general_settings.title"
        subtitle="general_settings.subtitle"
      />

      <Grid container spacing={3}>
        {/* Company Settings Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CompanyIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("general_settings.company_section")}
                  </Typography>
                  <Chip
                    label={t("general_settings.coming_soon_chip")}
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ ml: "auto", fontWeight: 500 }}
                  />
                </Box>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <InfoRow
                  icon={<NameIcon fontSize="small" />}
                  label={t("general_settings.company_name_label")}
                  value={t("general_settings.company_name_placeholder")}
                />
                <Divider />
                <InfoRow
                  icon={<TimezoneIcon fontSize="small" />}
                  label={t("general_settings.timezone_label")}
                  value={t("general_settings.timezone_placeholder")}
                />
                <Divider />
                <InfoRow
                  icon={<LocaleIcon fontSize="small" />}
                  label={t("general_settings.default_locale_label")}
                  value={t("general_settings.default_locale_placeholder")}
                />

                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("general_settings.coming_soon_note")}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <NotificationsIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("general_settings.notifications_section")}
                  </Typography>
                  <Chip
                    label={t("general_settings.coming_soon_chip")}
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ ml: "auto", fontWeight: 500 }}
                  />
                </Box>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t("general_settings.notifications_description")}
                </Typography>

                {/* Placeholder rows for upcoming notification preferences */}
                {(
                  [
                    "notifications_new_application",
                    "notifications_stage_change",
                    "notifications_candidate_hired",
                    "notifications_system_alerts",
                  ] as const
                ).map((key) => (
                  <Box
                    key={key}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.5,
                      opacity: 0.55,
                    }}
                  >
                    <Typography variant="body2">
                      {t(`general_settings.${key}`)}
                    </Typography>
                    <Chip
                      label={t("general_settings.coming_soon_chip")}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  </Box>
                ))}

                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("general_settings.coming_soon_note")}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralSettingsPage;
