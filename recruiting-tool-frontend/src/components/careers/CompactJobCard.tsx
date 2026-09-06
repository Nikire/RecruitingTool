import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Stack,
  Tooltip,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import { Link as RouterLink } from "react-router-dom";
import { buildJobPath } from "../../pages/careers/careersUrls";

/** ISO 4217 codes ("USD", "MXN") get proper currency formatting; anything else ("$") is used as a prefix. */
const CURRENCY_CODE_PATTERN = /^[A-Za-z]{3}$/;

interface CompactJobCardProps {
  jobPosition: {
    uid: string;
    title: string;
    companyName?: string;
    companyLogoUrl?: string;
    status: string;
    createdAt?: Date | string;
    description?: string;
    // Location and work type
    city?: string;
    country?: string;
    jobType?: string;
    workLocation?: string;
    // Experience and urgency
    experienceLevel?: string;
    isUrgent?: boolean;
    // Salary
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    salaryPeriod?: string;
    showSalary?: boolean;
    // Application deadline
    applicationDeadline?: Date | string;
    // Misc
    tags?: string[];
    isHighlighted?: boolean;
  };
  onApplyClick: (uid: string, title: string) => void;
}

const CompactJobCard: React.FC<CompactJobCardProps> = React.memo(
  ({ jobPosition, onApplyClick }) => {
    const { t, i18n } = useTranslation();

    // Canonical detail URL — straight there, not via the legacy /careers/:uid
    // redirect, and as a real anchor so it is crawlable and middle-clickable.
    const jobPath = buildJobPath({
      uid: jobPosition.uid,
      title: jobPosition.title,
      companyName: jobPosition.companyName,
    });

    // Calculate days since posted
    const daysSincePosted = jobPosition.createdAt
      ? Math.floor(
          (Date.now() - new Date(jobPosition.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    // Calculate days until deadline
    const daysUntilDeadline = jobPosition.applicationDeadline
      ? Math.ceil(
          (new Date(jobPosition.applicationDeadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

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

    // Get company initials for avatar fallback
    const getCompanyInitials = (name: string | undefined) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Format location
    const getLocationText = () => {
      const parts = [];
      if (jobPosition.city) parts.push(jobPosition.city);
      if (jobPosition.country) parts.push(jobPosition.country);
      return parts.join(", ") || t("careersJob.location_not_specified");
    };

    // Format salary period suffix
    const getSalaryPeriodSuffix = () => {
      switch (jobPosition.salaryPeriod) {
        case "YEARLY":
          return t("careersJob.per_year");
        case "MONTHLY":
          return t("careersJob.per_month");
        case "HOURLY":
          return t("careersJob.per_hour");
        default:
          return "";
      }
    };

    // Format salary
    const getSalaryText = () => {
      if (
        !jobPosition.showSalary ||
        (!jobPosition.salaryMin && !jobPosition.salaryMax)
      ) {
        return null;
      }
      const currency = jobPosition.salaryCurrency || "$";
      const periodSuffix = getSalaryPeriodSuffix();
      const formatAmount = (amount: number): string => {
        if (CURRENCY_CODE_PATTERN.test(currency)) {
          try {
            return new Intl.NumberFormat(i18n.language, {
              style: "currency",
              currency: currency.toUpperCase(),
              maximumFractionDigits: 0,
            }).format(amount);
          } catch {
            // Unknown code — fall through to the plain prefix form.
          }
        }
        return `${currency}${amount.toLocaleString(i18n.language)}`;
      };
      const min = jobPosition.salaryMin
        ? formatAmount(jobPosition.salaryMin)
        : "";
      const max = jobPosition.salaryMax
        ? formatAmount(jobPosition.salaryMax)
        : "";

      if (min && max) {
        return periodSuffix
          ? `${min} - ${max}${periodSuffix}`
          : `${min} - ${max}`;
      } else if (min) {
        return periodSuffix
          ? `${t("careersJob.from")} ${min}${periodSuffix}`
          : `${t("careersJob.from")} ${min}`;
      } else if (max) {
        return periodSuffix
          ? `${t("careersJob.up_to")} ${max}${periodSuffix}`
          : `${t("careersJob.up_to")} ${max}`;
      }
      return null;
    };

    // Get experience level label
    const getExperienceLevelLabel = () => {
      switch (jobPosition.experienceLevel) {
        case "ENTRY":
          return t("careersFilters.entry_level");
        case "MID":
          return t("careersFilters.mid_level");
        case "SENIOR":
          return t("careersFilters.senior_level");
        case "LEAD":
          return t("careersFilters.lead_level");
        case "EXECUTIVE":
          return t("careersFilters.executive_level");
        default:
          return null;
      }
    };

    // Format application deadline
    const getDeadlineText = () => {
      if (
        !jobPosition.applicationDeadline ||
        daysUntilDeadline === null ||
        daysUntilDeadline < 0
      ) {
        return null;
      }
      const date = new Date(jobPosition.applicationDeadline);
      const formattedDate = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return t("careersJob.apply_by", { date: formattedDate });
    };

    const experienceLevelLabel = getExperienceLevelLabel();
    const deadlineText = getDeadlineText();
    const isDeadlineSoon =
      daysUntilDeadline !== null &&
      daysUntilDeadline >= 0 &&
      daysUntilDeadline <= 7;

    // Get work location type badge color
    const getWorkLocationColor = () => {
      switch (jobPosition.workLocation) {
        case "REMOTE":
          return "success";
        case "HYBRID":
          return "info";
        case "ON_SITE":
          return "default";
        default:
          return "default";
      }
    };

    // Get work location label
    const getWorkLocationLabel = () => {
      switch (jobPosition.workLocation) {
        case "REMOTE":
          return t("careersFilters.remote");
        case "HYBRID":
          return t("careersFilters.hybrid");
        case "ON_SITE":
          return t("careersFilters.onsite");
        default:
          return t("careersJob.location_not_specified");
      }
    };

    // Get job type label
    const getJobTypeLabel = () => {
      switch (jobPosition.jobType) {
        case "FULL_TIME":
          return t("careersFilters.full_time");
        case "PART_TIME":
          return t("careersFilters.part_time");
        case "CONTRACT":
          return t("careersFilters.contract");
        case "INTERNSHIP":
          return t("careersFilters.internship");
        case "TEMPORARY":
          return t("careersFilters.temporary");
        case "FREELANCE":
          return t("create_job_position.job_type_freelance");
        default:
          // No job type set: show nothing rather than advertise "Full-time".
          return null;
      }
    };

    const salaryText = getSalaryText();
    const jobTypeLabel = getJobTypeLabel();
    const companyNameText =
      jobPosition.companyName || t("careers.company_name");

    return (
      <Card
        sx={{
          height: "100%",
          width: 320,
          maxWidth: "100%",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "visible",
          border: jobPosition.isHighlighted ? 2 : 1,
          borderColor: jobPosition.isHighlighted ? "primary.main" : "divider",
          "&:hover, &:focus-within": {
            transform: "translateY(-4px)",
            boxShadow: (theme) =>
              `0 8px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
            "& .apply-button": {
              transform: "scale(1.02)",
            },
          },
        }}
      >
        {/* New/Highlighted badge */}
        {(jobPosition.status === "OPEN" && daysSincePosted < 7) ||
        jobPosition.isHighlighted ? (
          <Chip
            label={
              jobPosition.isHighlighted
                ? t("careersJob.featured")
                : t("careers.new_position")
            }
            color={jobPosition.isHighlighted ? "primary" : "success"}
            size="small"
            sx={{
              position: "absolute",
              top: -10,
              right: 16,
              fontWeight: 600,
              boxShadow: 2,
            }}
          />
        ) : null}

        {/*
          The whole card body is one real link (anchor, focus ring, Enter/Space)
          to the posting; the Apply button sits outside it so no interactive
          control nests inside another.
        */}
        <CardActionArea
          component={RouterLink}
          to={jobPath}
          aria-label={jobPosition.title}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            borderRadius: "inherit",
          }}
        >
          <CardContent
            sx={{
              p: 2.5,
              pb: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              "&:last-child": { pb: 0 },
            }}
          >
            {/* Company logo and name */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              {jobPosition.companyLogoUrl ? (
                <Avatar
                  src={jobPosition.companyLogoUrl}
                  alt={jobPosition.companyName}
                  sx={{ width: 40, height: 40, boxShadow: 1 }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "primary.main",
                    fontSize: "1rem",
                    fontWeight: 700,
                    boxShadow: 1,
                  }}
                >
                  {getCompanyInitials(jobPosition.companyName)}
                </Avatar>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Tooltip title={companyNameText} enterDelay={500}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {companyNameText}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>

            {/* Job title */}
            <Tooltip title={jobPosition.title} enterDelay={500}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  fontSize: "1.1rem",
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
            </Tooltip>

            {/* Location and Work Type */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              gap={0.5}
              mb={1.5}
            >
              <Chip
                icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                label={getLocationText()}
                size="small"
                sx={{
                  fontSize: "0.7rem",
                  height: 24,
                  "& .MuiChip-icon": { color: "text.secondary" },
                }}
              />
              <Chip
                label={getWorkLocationLabel()}
                size="small"
                color={getWorkLocationColor()}
                sx={{ fontSize: "0.7rem", height: 24 }}
              />
            </Stack>

            {/* Job Type and Experience Level */}
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              gap={0.5}
              mb={1.5}
            >
              {jobTypeLabel && (
                <Chip
                  icon={<WorkIcon sx={{ fontSize: 14 }} />}
                  label={jobTypeLabel}
                  size="small"
                  variant="filled"
                  sx={{
                    fontSize: "0.7rem",
                    height: 24,
                    borderColor: "divider",
                    "& .MuiChip-icon": { color: "text.secondary" },
                  }}
                />
              )}
              {experienceLevelLabel && (
                <Chip
                  label={experienceLevelLabel}
                  size="small"
                  variant="filled"
                  color="secondary"
                  sx={{ fontSize: "0.7rem", height: 24 }}
                />
              )}
              {jobPosition.isUrgent && (
                <Chip
                  label={t("careersJob.urgent")}
                  size="small"
                  color="error"
                  sx={{ fontSize: "0.7rem", height: 24, fontWeight: 600 }}
                />
              )}
            </Stack>

            {/* Salary (if shown) */}
            {salaryText && (
              <Box sx={{ mb: 1.5 }}>
                <Chip
                  icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                  label={salaryText}
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontSize: "0.7rem", height: 24 }}
                />
              </Box>
            )}

            {/* Tags (first 3) */}
            {jobPosition.tags && jobPosition.tags.length > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                gap={0.5}
                mb={1.5}
              >
                {jobPosition.tags.slice(0, 3).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="filled"
                    sx={{
                      fontSize: "0.65rem",
                      height: 20,
                      borderColor: "divider",
                      color: "text.secondary",
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Application deadline */}
            {deadlineText && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 1,
                  color: isDeadlineSoon ? "warning.main" : "text.secondary",
                }}
              >
                <EventIcon sx={{ fontSize: 14 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isDeadlineSoon ? 600 : 500,
                    fontSize: "0.7rem",
                  }}
                >
                  {deadlineText}
                </Typography>
              </Box>
            )}

            {/* Posted date */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 2,
                color: "text.secondary",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 14 }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 500, fontSize: "0.7rem" }}
              >
                {getPostedText()}
              </Typography>
            </Box>

            {/* Spacer to push button to bottom */}
            <Box sx={{ flex: 1 }} />
          </CardContent>
        </CardActionArea>

        {/* Apply button — outside the link so it is its own control */}
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Button
            className="apply-button"
            fullWidth
            variant="contained"
            size="medium"
            onClick={() => onApplyClick(jobPosition.uid, jobPosition.title)}
            disabled={jobPosition.status !== "OPEN"}
            sx={{
              py: 1,
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.2s",
              boxShadow: 1,
              "&:hover": {
                boxShadow: 2,
              },
            }}
          >
            {t("careers.apply_now")}
          </Button>
        </Box>
      </Card>
    );
  },
);

CompactJobCard.displayName = "CompactJobCard";

export default CompactJobCard;
