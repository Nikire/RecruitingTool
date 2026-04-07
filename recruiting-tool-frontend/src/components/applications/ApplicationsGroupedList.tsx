import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Divider,
  Skeleton,
  Alert,
  TablePagination,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useTranslation } from "react-i18next";
import { useApplicationsGrouped } from "../../hooks/api/useApplications";
import {
  Application,
  ApplicationGroup,
  ApplicationStatus,
} from "../../types/application.types";
import ApplicationDetailDialog from "../dialogs/ApplicationDetailDialog";
import { getApplicationStatusColor } from "../../utils/statusColors";

interface ApplicationsGroupedListProps {
  statusFilter?: ApplicationStatus;
}

// ---------------------------------------------------------------------------
// GroupHeader
// ---------------------------------------------------------------------------
const GroupHeader: React.FC<{
  group: ApplicationGroup;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ group, isExpanded, onToggle }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: "pointer",
        userSelect: "none",
        "&:hover": { bgcolor: "action.hover" },
      }}
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
    >
      <WorkOutlineIcon sx={{ color: "primary.main", fontSize: 20 }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
        {group.jobPositionTitle}
      </Typography>
      <Chip
        label={t("applications_page.group.count", {
          count: group.applications.length,
        })}
        size="small"
        color="primary"
        variant="filled"
        sx={{ fontWeight: 500 }}
      />
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// ApplicationRow
// ---------------------------------------------------------------------------
const ApplicationRow: React.FC<{
  application: Application;
  onView: (application: Application) => void;
}> = ({ application, onView }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 3,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        flexWrap: { xs: "wrap", md: "nowrap" },
        "&:last-child": {
          borderBottom: "none",
        },
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      {/* Applicant name */}
      <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          title={application.applicantName}
        >
          {application.applicantName}
        </Typography>
      </Box>

      {/* Applicant email */}
      <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          title={application.applicantEmail}
        >
          {application.applicantEmail}
        </Typography>
      </Box>

      {/* Status */}
      <Box sx={{ flex: "0 0 110px" }}>
        <Chip
          label={t(`status.${application.status.toLowerCase()}`)}
          color={getApplicationStatusColor(application.status)}
          size="small"
        />
      </Box>

      {/* Applied date */}
      <Box sx={{ flex: "0 0 140px" }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {new Date(application.appliedAt).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          gap: 0.5,
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            onView(application);
          }}
        >
          {t("common.view")}
        </Button>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// GroupSection
// ---------------------------------------------------------------------------
const GroupSection: React.FC<{
  group: ApplicationGroup;
  onView: (application: Application) => void;
}> = ({ group, onView }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2,
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <GroupHeader
        group={group}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />
      <Divider />
      <Collapse in={isExpanded} timeout="auto" unmountOnExit={false}>
        <Box>
          {group.applications.map((application) => (
            <ApplicationRow
              key={application.uid}
              application={application}
              onView={onView}
            />
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

// ---------------------------------------------------------------------------
// ApplicationsGroupedList (main export)
// ---------------------------------------------------------------------------
const ApplicationsGroupedList: React.FC<ApplicationsGroupedListProps> = ({
  statusFilter,
}) => {
  const { t } = useTranslation();

  const [page, setPage] = useState(0); // TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error } = useApplicationsGrouped({
    status: statusFilter,
    page: page + 1, // backend is 1-indexed
    limit: rowsPerPage,
  });

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewClick = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ---- Loading state -------------------------------------------------------
  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        {[1, 2, 3].map((i) => (
          <Paper key={i} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={200} height={28} />
              <Box sx={{ flexGrow: 1 }} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Box>
            <Divider />
            {[1, 2].map((j) => (
              <Box
                key={j}
                sx={{
                  px: 3,
                  py: 1.5,
                  display: "flex",
                  gap: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Skeleton variant="text" width="25%" />
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="text" width="15%" />
              </Box>
            ))}
          </Paper>
        ))}
      </Box>
    );
  }

  // ---- Error state ---------------------------------------------------------
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t("errors.fetch_failed")}
      </Alert>
    );
  }

  const groups = data?.data ?? [];
  const total = data?.total ?? 0;

  // ---- Empty state ---------------------------------------------------------
  if (total === 0 && !isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 1,
        }}
      >
        <WorkOutlineIcon sx={{ fontSize: 64, color: "text.disabled" }} />
        <Typography variant="h6" color="text.secondary">
          {statusFilter
            ? t("applications.no_applications_with_status", {
                status: statusFilter,
              })
            : t("applications.no_applications_submitted")}
        </Typography>
      </Box>
    );
  }

  // ---- Main render ---------------------------------------------------------
  return (
    <>
      <Box sx={{ mt: 2 }}>
        {/* Column headers (desktop only) */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "1 1 180px", textTransform: "uppercase" }}
          >
            {t("applications.applicant_name")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "1 1 200px", textTransform: "uppercase" }}
          >
            {t("applications.email")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "0 0 110px", textTransform: "uppercase" }}
          >
            {t("applications.status")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "0 0 140px", textTransform: "uppercase" }}
          >
            {t("applications.applied_date")}
          </Typography>
          <Box sx={{ flex: "0 0 auto", minWidth: 80 }} />
        </Box>

        {groups.map((group) => (
          <GroupSection
            key={group.jobPositionUid ?? "__no_position__"}
            group={group}
            onView={handleViewClick}
          />
        ))}
      </Box>

      {/* Pagination */}
      {total > 0 && (
        <Paper variant="outlined" sx={{ mt: 1 }}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={t("applications_page.group.positions_per_page")}
            labelDisplayedRows={({ from, to, count }) =>
              t("pagination.showing", { start: from, end: to, total: count })
            }
            aria-label={t("aria.pagination_controls")}
          />
        </Paper>
      )}

      <ApplicationDetailDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        application={selectedApplication}
      />
    </>
  );
};

export default ApplicationsGroupedList;
