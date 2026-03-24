import { useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import { useAuthMe } from "../../../hooks/api/useAuth";
import { canManageResources } from "../../../utils/permissions";
import { ApplicationStatus } from "../../../types/application.types";
import ApplicationsTable from "../../../components/applications/ApplicationsTable";
import ApplicationsGroupedList from "../../../components/applications/ApplicationsGroupedList";
import {
  AccessDeniedMessage,
  CenteredLoadingSpinner,
  PageHeader,
} from "../../../components/common";
import { useTranslation } from "react-i18next";

const ApplicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading: userLoading } = useAuthMe();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [groupByPosition, setGroupByPosition] = useState(true);

  // Wait for user data to load before checking permissions (fixes race condition)
  if (userLoading) {
    return <CenteredLoadingSpinner />;
  }

  const canManage = canManageResources(user);

  // Check if user has HR or admin access
  if (!canManage) {
    return (
      <AccessDeniedMessage requiredRoles={["HR", "ADMIN", "SUPER_ADMIN"]} />
    );
  }

  const ApplicationStatusOptions: {
    value: ApplicationStatus | "";
    label: string;
  }[] = [
    { value: "", label: t("applications_page.all_applications") },
    { value: ApplicationStatus.PENDING, label: t("status.pending") },
    { value: ApplicationStatus.REVIEWED, label: t("status.reviewed") },
    { value: ApplicationStatus.ACCEPTED, label: t("status.accepted") },
    { value: ApplicationStatus.REJECTED, label: t("status.rejected") },
    { value: ApplicationStatus.ARCHIVED, label: t("status.archived") },
  ];

  return (
    <Box>
      <PageHeader title="applications_page.title" />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">
              {t("applications_page.filter_by_status")}
            </InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label={t("applications_page.filter_by_status")}
              onChange={(e) =>
                setStatusFilter(e.target.value as ApplicationStatus | "")
              }
            >
              {ApplicationStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Group-by toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          mt: 1,
          mb: 0.5,
          px: 0.5,
        }}
      >
        <Tooltip title={t("applications_page.group_toggle_tooltip")}>
          <FormControlLabel
            control={
              <Switch
                checked={groupByPosition}
                onChange={(e) => setGroupByPosition(e.target.checked)}
                size="small"
                color="primary"
                inputProps={{
                  "aria-label": t("applications_page.group_toggle_aria"),
                }}
              />
            }
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: groupByPosition ? "primary.main" : "text.secondary",
                }}
              >
                <ViewAgendaOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  {t("applications_page.group_by_position")}
                </Typography>
              </Box>
            }
            labelPlacement="start"
            sx={{ mr: 0 }}
          />
        </Tooltip>
      </Box>

      {groupByPosition ? (
        <ApplicationsGroupedList
          key={statusFilter}
          statusFilter={statusFilter || undefined}
        />
      ) : (
        <ApplicationsTable statusFilter={statusFilter || undefined} />
      )}
    </Box>
  );
};

export default ApplicationsPage;
