import { Box, Grid, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import WorkIcon from "@mui/icons-material/Work";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import { useApplications } from "../../hooks/api/useApplications";
import { useCandidates } from "../../hooks/api/useCandidates";
import { useJobPositions } from "../../hooks/api/useJobPositions";
import { useAuthMe } from "../../hooks/api/useAuth";
import { canManageResources } from "../../utils/permissions";
import { Navigate } from "react-router-dom";
import { useDialog } from "../../hooks/useDialog";
import ApplicationDetailDialog from "../../components/dialogs/ApplicationDetailDialog";
import ManualCandidateDialog from "../../components/dialogs/ManualCandidateDialog";
import { Application } from "../../types/application.types";
import {
  ApplicationListItem,
  QuickActionButton,
  StatisticsCards,
  StatCardData,
} from "../../components/dashboard";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { CenteredLoadingSpinner, PageHeader } from "../../components/common";

/**
 * HRDashboard - Main dashboard for HR users
 * Shows overview of applications, candidates, and job positions with quick actions
 */
const HRDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading: userLoading, isAuthenticated } = useAuthMe();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const manualCandidateDialog = useDialog<never>();

  // Call all hooks before any early returns
  const { data: applications, isLoading: applicationsLoading } =
    useApplications();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();
  const { data: jobPositions, isLoading: jobPositionsLoading } =
    useJobPositions();

  // Wait for user data to load before checking permissions (fixes race condition)
  if (userLoading) {
    return <CenteredLoadingSpinner />;
  }

  // Permission check - only after user data is loaded
  const hasAccess = canManageResources(user);
  if (!isAuthenticated || !hasAccess) {
    return <Navigate to="/login" />;
  }

  // Calculate statistics
  const totalApplications = applications?.length || 0;
  const pendingApplications =
    applications?.filter((app) => app.status === "PENDING")?.length || 0;
  const totalCandidates = candidates?.length || 0;
  const totalJobPositions = jobPositions?.length || 0;
  const openPositions =
    jobPositions?.filter((job) => job.status === "OPEN")?.length || 0;

  // Get recent applications (last 5)
  const recentApplications = applications?.slice(0, 5) || [];

  const isLoading =
    applicationsLoading || candidatesLoading || jobPositionsLoading;

  // Dashboard stat cards data
  const statsData: StatCardData[] = [
    {
      title: "dashboard.stats.applications",
      value: totalApplications,
      subtitle: t("dashboard.stats.pending_review_count", {
        count: pendingApplications,
      }),
      icon: <AssignmentIcon />,
      iconColor: "primary.main",
      onClick: () => navigate("/hr/applications"),
      translate: true,
    },
    {
      title: "dashboard.stats.candidates",
      value: totalCandidates,
      subtitle: t("dashboard.stats.active_in_hiring"),
      icon: <GroupIcon />,
      iconColor: "success.main",
      onClick: () => navigate("/hr/candidates"),
      translate: true,
    },
    {
      title: "dashboard.stats.job_positions",
      value: totalJobPositions,
      subtitle: t("dashboard.stats.currently_open", { count: openPositions }),
      icon: <WorkIcon />,
      iconColor: "info.main",
      onClick: () => navigate("/hr/job-positions"),
      translate: true,
    },
    {
      title: "dashboard.stats.pending_review",
      value: pendingApplications,
      subtitle: t("dashboard.stats.applications_need_attention"),
      icon: <AssignmentIcon />,
      iconColor: "warning.main",
      translate: true,
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      icon: <PersonAddIcon />,
      label: "dashboard.add_candidate",
      onClick: () => manualCandidateDialog.open(),
    },
    {
      icon: <WorkIcon />,
      label: "dashboard.manage_positions",
      onClick: () => navigate("/hr/job-positions"),
    },
    {
      icon: <AssignmentIcon />,
      label: "dashboard.review_applications",
      onClick: () => navigate("/hr/applications"),
    },
    {
      icon: <GroupIcon />,
      label: "dashboard.view_candidates",
      onClick: () => navigate("/hr/candidates"),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="dashboard.title"
        action={{
          label: "dashboard.create_position",
          icon: <AddIcon />,
          onClick: () => navigate("/hr/job-positions"),
          ariaLabel: t("dashboard.create_position"),
        }}
      />

      {/* Statistics Cards - Enhanced with better spacing */}
      <StatisticsCards stats={statsData} isLoading={isLoading} />

      {/* Recent Applications - Enhanced Paper styling */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 2,
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: 3,
          },
        }}
      >
        <Box
          sx={{
            mb: { xs: 2.5, sm: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {t("dashboard.recent_applications")}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate("/hr/applications")}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minHeight: "44px",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 1.5,
            }}
          >
            {t("dashboard.view_all")}
          </Button>
        </Box>

        {isLoading ? (
          <SkeletonLoader variant="list" count={5} />
        ) : recentApplications.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AssignmentIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 1 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {t("dashboard.no_applications")}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {t("dashboard.no_applications_desc")}
            </Typography>
          </Box>
        ) : (
          <Box>
            {recentApplications.map((application) => (
              <ApplicationListItem
                key={application.uid}
                application={application}
                onClick={setSelectedApplication}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Quick Actions - Enhanced section styling */}
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 2.5,
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {t("dashboard.quick_actions")}
        </Typography>
        <Grid container spacing={2.5}>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
              translate
            />
          ))}
        </Grid>
      </Box>

      {/* Application Detail Dialog */}
      <ApplicationDetailDialog
        open={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
      />

      {/* Manual Candidate Dialog */}
      <ManualCandidateDialog
        open={manualCandidateDialog.isOpen}
        onClose={manualCandidateDialog.close}
      />
    </Box>
  );
};

export default HRDashboard;
