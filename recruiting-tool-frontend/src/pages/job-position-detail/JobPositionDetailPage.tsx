import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import { usePublicJobPosition } from "../../hooks/api/useJobPositions";
import { JobPosition, SalaryPeriod } from "../../types/jobPosition.types";
import StatusLabel from "../../components/StatusLabel";
import { HiringProcessStatus } from "../../types/hiringProcess.types";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { canManageResources } from "../../utils/permissions";
import { ApplyToJobDialog } from "../../components/dialogs/ApplyToJobDialog";
import {
  MetadataDisplay,
  CenteredLoadingSpinner,
  StatusFilterChips,
} from "../../components/common";
import { StagesList, CustomQuestionsList } from "../../components/job-position";
import { wrapLongText, truncatingChipSx } from "../../utils/textOverflow";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Seo from "../../components/common/Seo";
import { buildJobPostingLd, SITE_NAME } from "../../utils/structuredData";
import { buildJobPath, extractJobUid } from "../careers/careersUrls";

const getStatusColor = (
  status: HiringProcessStatus,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (status) {
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "primary";
    case "CLOSED":
      return "success";
    case "CANCELLED":
      return "default";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

const getJobTypeKey = (jobType: string): string => {
  const map: Record<string, string> = {
    FULL_TIME: "job_type.full_time",
    PART_TIME: "job_type.part_time",
    CONTRACT: "job_type.contract",
    INTERNSHIP: "job_type.internship",
    TEMPORARY: "job_type.temporary",
    FREELANCE: "create_job_position.job_type_freelance",
  };
  return map[jobType] ?? jobType;
};

const getWorkLocationKey = (workLocation: string): string => {
  const map: Record<string, string> = {
    REMOTE: "work_location.remote",
    HYBRID: "work_location.hybrid",
    ON_SITE: "work_location.on_site",
  };
  return map[workLocation] ?? workLocation;
};

const getExperienceLevelKey = (experienceLevel: string): string => {
  const map: Record<string, string> = {
    ENTRY: "create_job_position.experience_entry",
    MID: "create_job_position.experience_mid",
    SENIOR: "create_job_position.experience_senior",
    LEAD: "create_job_position.experience_lead",
    EXECUTIVE: "create_job_position.experience_executive",
  };
  return map[experienceLevel] ?? experienceLevel;
};

/**
 * Turns a raw enum-ish value into a readable label as a last resort,
 * e.g. "HIGH_SCHOOL" -> "High school". Used as the i18n fallback so an
 * unknown value coming from the API never renders as a raw enum.
 */
const humanizeEnumValue = (value: string): string => {
  const normalized = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  if (!normalized) return value;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

/**
 * educationLevel is a free-form string on the API (there is no Prisma enum).
 * The values the app itself produces come from EDUCATION_LEVELS in
 * CreateJobPositionDialog: HIGH_SCHOOL | ASSOCIATE | BACHELOR | MASTER |
 * DOCTORATE | NONE. Anything else (e.g. written through the public API)
 * falls back to a humanized label instead of the raw enum.
 */
const EDUCATION_LEVEL_KEYS: Record<string, string> = {
  HIGH_SCHOOL: "create_job_position.education_high_school",
  ASSOCIATE: "create_job_position.education_associate",
  BACHELOR: "create_job_position.education_bachelor",
  MASTER: "create_job_position.education_master",
  DOCTORATE: "create_job_position.education_doctorate",
  NONE: "create_job_position.education_none",
};

const getEducationLevelKey = (educationLevel: string): string => {
  const normalized = educationLevel
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (EDUCATION_LEVEL_KEYS[normalized]) {
    return EDUCATION_LEVEL_KEYS[normalized];
  }

  // Tolerate common plural / alias spellings (BACHELORS, PHD, HIGHSCHOOL, ...)
  const aliases: Record<string, string> = {
    HIGHSCHOOL: "HIGH_SCHOOL",
    SECONDARY: "HIGH_SCHOOL",
    ASSOCIATES: "ASSOCIATE",
    ASSOCIATE_DEGREE: "ASSOCIATE",
    BACHELORS: "BACHELOR",
    BACHELORS_DEGREE: "BACHELOR",
    BACHELOR_DEGREE: "BACHELOR",
    MASTERS: "MASTER",
    MASTERS_DEGREE: "MASTER",
    MASTER_DEGREE: "MASTER",
    PHD: "DOCTORATE",
    DOCTORAL: "DOCTORATE",
    DOCTORATE_DEGREE: "DOCTORATE",
    NOT_REQUIRED: "NONE",
    NO_REQUIREMENT: "NONE",
  };

  const alias = aliases[normalized];
  if (alias) {
    return EDUCATION_LEVEL_KEYS[alias];
  }

  // i18next returns the key itself when it is missing, so a humanized label
  // renders as-is instead of leaking "HIGH_SCHOOL" to the public page.
  return humanizeEnumValue(educationLevel);
};

const getHiringProcessStatusKey = (status: string): string =>
  `hiring_process_status.${status.toLowerCase()}`;

const getSalaryPeriodKey = (period: SalaryPeriod): string => {
  const map: Record<SalaryPeriod, string> = {
    HOURLY: "job_position_detail.salary_period_hourly",
    MONTHLY: "job_position_detail.salary_period_monthly",
    YEARLY: "job_position_detail.salary_period_yearly",
  };
  return map[period] ?? period;
};

/** Longest meta description Google will render before truncating. */
const META_DESCRIPTION_MAX_LENGTH = 155;

/**
 * Job descriptions are authored in Markdown and rendered through
 * `<ReactMarkdown>`, but a meta description must be plain text. Strip the
 * syntax, collapse whitespace and cut on a word boundary so the snippet reads
 * as a sentence rather than as raw `## Heading` noise.
 */
const toPlainTextSummary = (
  markdown: string | undefined | null,
  maxLength: number,
): string => {
  if (!markdown) return "";

  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;

  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography
    variant="h6"
    component="h2"
    sx={{
      mb: 1.5,
      fontSize: { xs: "1rem", sm: "1.125rem" },
      fontWeight: 600,
      ...wrapLongText,
    }}
  >
    {children}
  </Typography>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <Box component="ul" sx={{ m: 0, pl: 2.5, ...wrapLongText }}>
    {items.map((item, index) => (
      <Box
        component="li"
        key={index}
        sx={{
          mb: 0.5,
          color: "text.secondary",
          lineHeight: 1.7,
          ...wrapLongText,
        }}
      >
        <Typography variant="body2" component="span" sx={wrapLongText}>
          {item}
        </Typography>
      </Box>
    ))}
  </Box>
);

const JobPositionDetailPage: React.FC = () => {
  const { t } = useTranslation();
  /*
   * Two routes render this page:
   *   - `/jobs/:companySlug/:jobSlug` — the canonical, keyword-bearing URL,
   *     where the UID is the tail of `:jobSlug` and both slugs are decoration;
   *   - `/careers/:uid` — the legacy URL, kept alive for links already sent to
   *     candidates and already indexed.
   * Either way the lookup key is the UID and nothing else: no numeric id is
   * exposed, and no human-authored slug is ever trusted to resolve a posting.
   */
  const { uid: uidParam, jobSlug } = useParams<{
    uid?: string;
    jobSlug?: string;
  }>();
  const uid = uidParam ?? extractJobUid(jobSlug) ?? "";
  const navigate = useNavigate();
  const { user } = useUserAtom();
  const {
    data: jobPositionData,
    isLoading,
    error,
  } = usePublicJobPosition(uid || "");
  const [statusFilter, setStatusFilter] = useState<HiringProcessStatus | "ALL">(
    "ALL",
  );
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const canManage = canManageResources(user);

  // `usePublicJobPosition` is typed as returning the full `JobPosition` shape;
  // it is `undefined` until the query settles.
  const job = jobPositionData as JobPosition | undefined;

  /**
   * `JobPosting` markup is what puts a posting into Google for Jobs, so it is
   * emitted only while the role is genuinely open — Google asks that expired
   * postings drop their structured data rather than keep advertising a role
   * nobody can be hired into. `directApply` is true because the Apply dialog
   * lives on this same page; there is no redirect to a third-party board.
   *
   * `showSalary` gating happens inside `buildJobPostingLd`: compensation is
   * published only when the recruiter opted in.
   *
   * Memoised because `<Seo>` keys its head entry on `jsonLd` by reference.
   */
  const jobPostingLd = useMemo(
    () =>
      job && job.status === "OPEN"
        ? buildJobPostingLd(job, {
            directApply: true,
            // Must match the canonical below, or Google sees the posting at two
            // URLs and picks one of them for you.
            url: buildJobPath({
              uid: job.uid,
              title: job.title,
              companyName: job.companyName,
            }),
          })
        : undefined,
    [job],
  );

  const seoTitle = t("seo.job_detail.title", {
    title: job?.title ?? "",
    company: job?.companyName || SITE_NAME,
  });

  const seoDescription =
    toPlainTextSummary(job?.description, META_DESCRIPTION_MAX_LENGTH) ||
    t("seo.job_detail.description", {
      title: job?.title ?? "",
      company: job?.companyName || SITE_NAME,
    });

  // "ALL" is prepended by <StatusFilterChips />, so it is not listed here.
  const statusOptions: HiringProcessStatus[] = [
    "OPEN",
    "IN_PROGRESS",
    "CLOSED",
    "CANCELLED",
    "REJECTED",
  ];

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (error || !jobPositionData) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* A missing or unreachable posting is a soft 404 — keep it out of the index. */}
        <Seo
          title={t("seo.job_detail.not_found_title")}
          description={t("seo.job_detail.not_found_description")}
          noindex
        />
        <Typography color="error">
          {t("job_position_detail.error_loading")}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/job-positions")}
          sx={{ mt: 2 }}
        >
          {t("job_position_detail.back_to_positions")}
        </Button>
      </Box>
    );
  }

  const jobPosition = jobPositionData as JobPosition;

  // Filter hiring processes by status
  const filteredHiringProcesses =
    jobPosition.hiringProcesses?.filter(
      (process) => statusFilter === "ALL" || process.status === statusFilter,
    ) || [];

  // Build location string
  const locationParts = [
    jobPosition.city,
    jobPosition.state,
    jobPosition.country,
  ].filter(Boolean);
  const locationString = locationParts.join(", ");

  // Salary display
  const hasSalary =
    jobPosition.showSalary &&
    (jobPosition.salaryMin != null || jobPosition.salaryMax != null);
  const salaryPeriodLabel = jobPosition.salaryPeriod
    ? t(getSalaryPeriodKey(jobPosition.salaryPeriod))
    : "";
  const salaryCurrency = jobPosition.salaryCurrency ?? "";

  const getSalaryDisplay = () => {
    if (!hasSalary) return null;
    const { salaryMin, salaryMax } = jobPosition;
    if (salaryMin != null && salaryMax != null) {
      return t("job_position_detail.salary_range", {
        min: salaryMin.toLocaleString(),
        max: salaryMax.toLocaleString(),
        currency: salaryCurrency,
        period: salaryPeriodLabel,
      });
    }
    if (salaryMin != null) {
      return t("job_position_detail.salary_from", {
        min: salaryMin.toLocaleString(),
        currency: salaryCurrency,
        period: salaryPeriodLabel,
      });
    }
    if (salaryMax != null) {
      return t("job_position_detail.salary_up_to", {
        max: salaryMax.toLocaleString(),
        currency: salaryCurrency,
        period: salaryPeriodLabel,
      });
    }
    return null;
  };

  const salaryDisplay = getSalaryDisplay();

  // Application deadline
  const deadlineDisplay = jobPosition.applicationDeadline
    ? new Date(jobPosition.applicationDeadline).toLocaleDateString()
    : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Seo
        title={seoTitle}
        description={seoDescription}
        /*
         * Always the slugged URL, even when the visitor arrived on the legacy
         * `/careers/:uid` path. This is what consolidates the two URLs in
         * search: whichever one gets crawled, both declare the same canonical.
         */
        canonical={buildJobPath({
          uid: jobPosition.uid,
          title: jobPosition.title,
          companyName: jobPosition.companyName,
        })}
        ogType="article"
        jsonLd={jobPostingLd}
      />

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/careers")}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        {t("common.back_to_careers")}
      </Button>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
                flexWrap: "wrap",
                minWidth: 0,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontSize: { xs: "1.75rem", sm: "2.125rem" },
                  ...wrapLongText,
                }}
              >
                {jobPosition.title}
              </Typography>
              {jobPosition.isUrgent && (
                <Chip
                  label={t("job_position_detail.urgent_badge")}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>
            <Typography variant="subtitle1" color="textSecondary">
              {canManage
                ? t("job_position_detail.hiring_overview")
                : t("job_position_detail.job_posting")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
            }}
          >
            <StatusLabel status={jobPosition.status} />
            {jobPosition.status === "OPEN" && (
              <Button
                variant="contained"
                onClick={() => setApplyDialogOpen(true)}
                sx={{ flex: { xs: 1, sm: "none" }, minHeight: 44 }}
              >
                {t("job_position_detail.apply_now")}
              </Button>
            )}
          </Box>
        </Box>

        {/* Top chips: job type, work location, experience level */}
        {(jobPosition.jobType ||
          jobPosition.workLocation ||
          jobPosition.experienceLevel) && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 2 }}
          >
            {jobPosition.jobType && (
              <Chip
                icon={<WorkIcon />}
                label={t(getJobTypeKey(jobPosition.jobType))}
                variant="outlined"
                size="small"
              />
            )}
            {jobPosition.workLocation && (
              <Chip
                icon={<LocationOnIcon />}
                label={t(getWorkLocationKey(jobPosition.workLocation))}
                variant="outlined"
                size="small"
              />
            )}
            {jobPosition.experienceLevel && (
              <Chip
                label={t(getExperienceLevelKey(jobPosition.experienceLevel))}
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        <MetadataDisplay
          items={[
            {
              label: "job_position_detail.company",
              value: jobPosition.companyName || t("common.n_a"),
            },
            ...(jobPosition.createdAt
              ? [
                  {
                    label: "careers.posted_date",
                    value: new Date(jobPosition.createdAt).toLocaleDateString(),
                  },
                ]
              : []),
            ...(canManage && jobPosition.createdBy
              ? [
                  {
                    label: "job_position_detail.created_by_hr",
                    value: jobPosition.createdBy.name,
                    subValue: jobPosition.createdBy.email,
                  },
                ]
              : []),
            {
              label: "job_position_detail.total_stages",
              value: jobPosition.stages?.length || 0,
            },
            ...(canManage
              ? [
                  {
                    label: "job_position_detail.active_processes",
                    value: jobPosition.hiringProcesses?.length || 0,
                  },
                ]
              : []),
          ]}
          translate
        />
      </Paper>

      {/* Job Description Section - visible to everyone */}
      {jobPosition.description && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            {t("job_position_detail.job_description")}
          </Typography>
          <Box
            sx={{
              // Free text: never let a long unbroken token (URL, long word)
              // blow out of the Paper or scroll the page sideways.
              ...wrapLongText,
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                mt: 2,
                mb: 1,
                fontWeight: 600,
                lineHeight: 1.3,
                ...wrapLongText,
              },
              "& h1": { fontSize: "1.5rem" },
              "& h2": { fontSize: "1.25rem" },
              "& h3": { fontSize: "1.1rem" },
              "& p": { mb: 1.5, lineHeight: 1.8, color: "text.secondary" },
              "& ul, & ol": { pl: 2.5, mb: 1.5 },
              "& li": { mb: 0.5, lineHeight: 1.7, color: "text.secondary" },
              "& code": {
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "action.hover",
                fontFamily: "monospace",
                fontSize: "0.875em",
              },
              // Code blocks keep their own horizontal scroll container so the
              // page itself never scrolls sideways.
              "& pre": {
                p: 2,
                borderRadius: 1,
                bgcolor: "action.hover",
                maxWidth: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                whiteSpace: "pre",
              },
              "& pre code": {
                overflowWrap: "normal",
                wordBreak: "normal",
                whiteSpace: "pre",
              },
              // Same for GFM tables: scroll inside the block, not the page.
              "& table": {
                display: "block",
                maxWidth: "100%",
                overflowX: "auto",
                borderCollapse: "collapse",
              },
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
                px: 1,
                py: 0.5,
                ...wrapLongText,
              },
              "& img": { maxWidth: "100%", height: "auto" },
              "& blockquote": {
                ml: 0,
                pl: 2,
                borderLeft: "4px solid",
                borderColor: "divider",
                color: "text.secondary",
                ...wrapLongText,
              },
              "& strong": { fontWeight: 600 },
              "& a": { color: "primary.main", ...wrapLongText },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {jobPosition.description}
            </ReactMarkdown>
          </Box>
        </Paper>
      )}

      {/* Location section */}
      {locationString && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <SectionTitle>
              {t("job_position_detail.location_section")}
            </SectionTitle>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={wrapLongText}>
            {locationString}
          </Typography>
        </Paper>
      )}

      {/* Salary section */}
      {salaryDisplay && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AttachMoneyIcon fontSize="small" color="action" />
            <SectionTitle>
              {t("job_position_detail.salary_section")}
            </SectionTitle>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={wrapLongText}>
            {salaryDisplay}
          </Typography>
        </Paper>
      )}

      {/* Application Deadline */}
      {deadlineDisplay && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <EventIcon fontSize="small" color="action" />
            <SectionTitle>
              {t("job_position_detail.deadline_section")}
            </SectionTitle>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {deadlineDisplay}
          </Typography>
        </Paper>
      )}

      {/* Skills */}
      {jobPosition.skills && jobPosition.skills.length > 0 && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <SectionTitle>{t("job_position_detail.skills_section")}</SectionTitle>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {jobPosition.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                color="primary"
                variant="outlined"
                sx={truncatingChipSx}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Requirements */}
      {jobPosition.requirements && jobPosition.requirements.length > 0 && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <SectionTitle>
            {t("job_position_detail.requirements_section")}
          </SectionTitle>
          <BulletList items={jobPosition.requirements} />
        </Paper>
      )}

      {/* Responsibilities */}
      {jobPosition.responsibilities &&
        jobPosition.responsibilities.length > 0 && (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <SectionTitle>
              {t("job_position_detail.responsibilities_section")}
            </SectionTitle>
            <BulletList items={jobPosition.responsibilities} />
          </Paper>
        )}

      {/* Benefits */}
      {jobPosition.benefits && jobPosition.benefits.length > 0 && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <SectionTitle>
            {t("job_position_detail.benefits_section")}
          </SectionTitle>
          <BulletList items={jobPosition.benefits} />
        </Paper>
      )}

      {/* Education Level */}
      {jobPosition.educationLevel && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <SchoolIcon fontSize="small" color="action" />
            <SectionTitle>
              {t("job_position_detail.education_section")}
            </SectionTitle>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={wrapLongText}>
            {t(getEducationLevelKey(jobPosition.educationLevel))}
          </Typography>
        </Paper>
      )}

      {/* Tags */}
      {jobPosition.tags && jobPosition.tags.length > 0 && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <SectionTitle>{t("job_position_detail.tags_section")}</SectionTitle>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {jobPosition.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={truncatingChipSx}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {canManage && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              {t("job_position_detail.hiring_processes_count", {
                filtered: filteredHiringProcesses.length,
                total: jobPosition.hiringProcesses?.length || 0,
              })}
            </Typography>
          </Box>

          <StatusFilterChips<HiringProcessStatus>
            options={statusOptions}
            currentFilter={statusFilter}
            onFilterChange={setStatusFilter}
            getCount={(status) =>
              status === "ALL"
                ? jobPosition.hiringProcesses?.length || 0
                : jobPosition.hiringProcesses?.filter(
                    (p) => p.status === status,
                  ).length || 0
            }
            translateStatus
            translationPrefix="hiring_process_status."
          />

          {filteredHiringProcesses.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>{t("job_position_detail.table_title")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("job_position_detail.table_status")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {t("job_position_detail.table_candidate")}
                      </strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("job_position_detail.table_actions")}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHiringProcesses.map((process) => (
                    <TableRow
                      key={process.uid}
                      hover
                      sx={{
                        backgroundColor: !process.candidate
                          ? "rgba(255, 193, 7, 0.05)"
                          : "inherit",
                      }}
                    >
                      <TableCell sx={wrapLongText}>{process.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(getHiringProcessStatusKey(process.status))}
                          color={getStatusColor(process.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {process.candidate ? (
                          <Box sx={wrapLongText}>
                            {process.candidate.name}
                            <br />
                            <Typography variant="caption" color="textSecondary">
                              {process.candidate.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="error"
                            sx={{ fontWeight: 500 }}
                          >
                            {t("hiring_processes.no_candidate")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() =>
                            navigate(`/hiring-process/${process.uid}`)
                          }
                        >
                          {t("job_positions.view_details")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
              <Typography variant="body1" color="textSecondary">
                {statusFilter === "ALL"
                  ? t("job_position_detail.no_processes")
                  : t("job_position_detail.no_processes_with_status", {
                      status: t(getHiringProcessStatusKey(statusFilter)),
                    })}
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Hiring Stages - visible to everyone */}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          mt: { xs: 3, sm: 5 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {t("job_position_detail.stage_template")}
      </Typography>
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <StagesList stages={jobPosition.stages || []} translate={false} />
        </CardContent>
      </Card>

      {/* Custom Questions - only visible to HR/Admin */}
      {canManage && (
        <>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: { xs: 1.5, sm: 2 },
              mt: { xs: 3, sm: 4 },
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            {t("job_position_detail.custom_questions")}
          </Typography>
          <Card sx={{ mb: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <CustomQuestionsList
                questions={jobPosition.customQuestions || []}
                emptyMessage={t("job_position_detail.no_custom_questions")}
                translate={false}
              />
            </CardContent>
          </Card>
        </>
      )}

      {uid && (
        <ApplyToJobDialog
          open={applyDialogOpen}
          onClose={() => setApplyDialogOpen(false)}
          jobUid={uid}
          jobTitle={jobPosition.title}
        />
      )}
    </Box>
  );
};

export default JobPositionDetailPage;
