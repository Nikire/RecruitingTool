import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { JobPosition } from "../../types/jobPosition.types";
import { formatRelativeTime } from "../../utils/dateFormatters";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";

interface JobPositionCardProps {
  jobPosition: JobPosition;
  onView: (jobPosition: JobPosition) => void;
  onEdit?: (jobPosition: JobPosition) => void;
  onManageStages?: (jobPosition: JobPosition) => void;
  onMore?: (jobPosition: JobPosition) => void;
}

const getStatusColor = (status: string): "success" | "default" | "warning" => {
  switch (status) {
    case "OPEN":
      return "success";
    case "CLOSED":
      return "default";
    case "CANCELLED":
      return "warning";
    default:
      return "default";
  }
};

const JobPositionCard: React.FC<JobPositionCardProps> = ({
  jobPosition,
  onView,
  onEdit,
  onManageStages,
  onMore,
}) => {
  const { t, i18n } = useTranslation();

  const postedDate = jobPosition.createdAt
    ? formatRelativeTime(jobPosition.createdAt, i18n.language)
    : t("common.unknown");

  const applicantCount = jobPosition.hiringProcesses?.length || 0;

  return (
    <Card
      sx={{
        height: "100%",
        width: 360,
        maxWidth: "100%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      {/* Status Badge */}
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Chip
          label={t(`status.${jobPosition.status.toLowerCase()}`)}
          color={getStatusColor(jobPosition.status)}
          size="small"
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        {/* Job Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            mb: 2,
            fontWeight: 600,
            fontSize: "1.25rem",
            pr: 8, // Space for status badge
          }}
        >
          {jobPosition.title}
        </Typography>

        {/* Company/Department */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <BusinessIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {jobPosition.companyName || t("common.n_a")}
          </Typography>
        </Box>

        {/* Employment Type Badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <WorkIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Chip
            label={t("job_position_card.full_time")}
            size="small"
            variant="filled"
          />
        </Box>

        {/* Posted Date */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <CalendarTodayIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {postedDate}
          </Typography>
        </Box>

        {/* Number of Applicants */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <PeopleIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography variant="body2" fontWeight={500}>
            {t("job_position_card.applicants_count", { count: applicantCount })}
          </Typography>
        </Box>
      </CardContent>

      {/* Action Buttons */}
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={t("common.view")}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onView(jobPosition)}
              aria-label={t("aria.view_item", { item: jobPosition.title })}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {onEdit && (
            <Tooltip title={t("common.edit")}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(jobPosition)}
                aria-label={t("aria.edit_item", { item: jobPosition.title })}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onManageStages && (
            <Tooltip title={t("job_positions.edit_stages")}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onManageStages(jobPosition)}
                aria-label={t("job_positions.edit_stages_aria", {
                  item: jobPosition.title,
                })}
              >
                <AccountTreeIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {onMore && (
          <Tooltip title={t("common.actions")}>
            <IconButton
              size="small"
              onClick={() => onMore(jobPosition)}
              aria-label={t("aria.actions")}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default JobPositionCard;
