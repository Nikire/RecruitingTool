import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessIcon from "@mui/icons-material/Business";
import { useNavigate } from "react-router-dom";

interface PublicJobCardProps {
  jobPosition: {
    uid: string;
    title: string;
    companyName?: string;
    status: string;
    createdAt: string;
    description?: string;
    // Add any additional fields from your API
  };
  onApplyClick: (uid: string, title: string) => void;
}

const PublicJobCard: React.FC<PublicJobCardProps> = ({
  jobPosition,
  onApplyClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/careers/${jobPosition.uid}`);
  };

  // Calculate days since posted
  const daysSincePosted = Math.floor(
    (Date.now() - new Date(jobPosition.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const getPostedText = () => {
    if (daysSincePosted === 0) {
      return t("careers.posted_today");
    } else if (daysSincePosted === 1) {
      return t("careers.posted_yesterday");
    } else if (daysSincePosted < 7) {
      return t("careers.posted_days_ago", { days: daysSincePosted });
    } else if (daysSincePosted < 30) {
      const weeks = Math.floor(daysSincePosted / 7);
      return t("careers.posted_weeks_ago", { weeks });
    } else {
      const months = Math.floor(daysSincePosted / 30);
      return t("careers.posted_months_ago", { months });
    }
  };

  // Get company initials for avatar
  const getCompanyInitials = (name: string | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      sx={{
        height: "100%",
        width: 400,
        maxWidth: "100%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: (theme) =>
            `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          "& .apply-button": {
            transform: "scale(1.05)",
          },
        },
      }}
      onClick={handleCardClick}
    >
      {/* Status badge */}
      {jobPosition.status === "OPEN" && daysSincePosted < 7 && (
        <Chip
          label={t("careers.new_position")}
          color="success"
          size="small"
          sx={{
            position: "absolute",
            top: -10,
            right: 16,
            fontWeight: 600,
            boxShadow: 2,
          }}
        />
      )}

      <CardContent
        sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
      >
        {/* Company avatar and name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              fontSize: "1.25rem",
              fontWeight: 700,
              boxShadow: 2,
            }}
          >
            {getCompanyInitials(jobPosition.companyName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: "0.75rem",
              }}
            >
              {jobPosition.companyName || t("careers.company_name")}
            </Typography>
          </Box>
        </Box>

        {/* Job title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
            lineHeight: 1.3,
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.6em",
          }}
        >
          {jobPosition.title}
        </Typography>

        {/* Job metadata chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
          <Chip
            icon={<BusinessIcon sx={{ fontSize: 16 }} />}
            label={t("job_position_card.full_time")}
            size="small"
            variant="outlined"
            sx={{
              borderColor: "divider",
              "& .MuiChip-icon": { color: "text.secondary" },
            }}
          />
          <Chip
            icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
            label={t("job_position_card.remote")}
            size="small"
            variant="outlined"
            sx={{
              borderColor: "divider",
              "& .MuiChip-icon": { color: "text.secondary" },
            }}
          />
        </Box>

        {/* Posted date */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 3,
            color: "text.secondary",
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {getPostedText()}
          </Typography>
        </Box>

        {/* Spacer to push button to bottom */}
        <Box sx={{ flex: 1 }} />

        {/* Apply button */}
        <Button
          className="apply-button"
          fullWidth
          variant="contained"
          size="large"
          onClick={(e) => {
            e.stopPropagation();
            onApplyClick(jobPosition.uid, jobPosition.title);
          }}
          disabled={jobPosition.status !== "OPEN"}
          sx={{
            py: 1.5,
            fontWeight: 600,
            fontSize: "1rem",
            transition: "all 0.2s",
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          {t("careers.apply_now")} →
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublicJobCard;
