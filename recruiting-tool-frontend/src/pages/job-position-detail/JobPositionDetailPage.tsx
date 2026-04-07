import { useState } from "react";
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
} from "../../components/common";
import { StagesList, CustomQuestionsList } from "../../components/job-position";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const getSalaryPeriodKey = (period: SalaryPeriod): string => {
  const map: Record<SalaryPeriod, string> = {
    HOURLY: "job_position_detail.salary_period_hourly",
    MONTHLY: "job_position_detail.salary_period_monthly",
    YEARLY: "job_position_detail.salary_period_yearly",
  };
  return map[period] ?? period;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography
    variant="h6"
    sx={{
      mb: 1.5,
      fontSize: { xs: "1rem", sm: "1.125rem" },
      fontWeight: 600,
    }}
  >
    {children}
  </Typography>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
    {items.map((item, index) => (
      <Box
        component="li"
        key={index}
        sx={{ mb: 0.5, color: "text.secondary", lineHeight: 1.7 }}
      >
        <Typography variant="body2" component="span">
          {item}
        </Typography>
      </Box>
    ))}
  </Box>
);

const JobPositionDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
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

  const statusOptions: (HiringProcessStatus | "ALL")[] = [
    "ALL",
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
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography
                variant="h4"
                sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
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
            sx={{
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            {t("job_position_detail.job_description")}
          </Typography>
          <Box
            sx={{
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                mt: 2,
                mb: 1,
                fontWeight: 600,
                lineHeight: 1.3,
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
              "& pre": {
                p: 2,
                borderRadius: 1,
                bgcolor: "action.hover",
                overflow: "auto",
              },
              "& blockquote": {
                ml: 0,
                pl: 2,
                borderLeft: "4px solid",
                borderColor: "divider",
                color: "text.secondary",
              },
              "& strong": { fontWeight: 600 },
              "& a": { color: "primary.main" },
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
          <Typography variant="body1" color="text.secondary">
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
          <Typography variant="body1" color="text.secondary">
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
          <Typography variant="body1" color="text.secondary">
            {jobPosition.educationLevel}
          </Typography>
        </Paper>
      )}

      {/* Tags */}
      {jobPosition.tags && jobPosition.tags.length > 0 && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <SectionTitle>{t("job_position_detail.tags_section")}</SectionTitle>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {jobPosition.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
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
              sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              {t("job_position_detail.hiring_processes_count", {
                filtered: filteredHiringProcesses.length,
                total: jobPosition.hiringProcesses?.length || 0,
              })}
            </Typography>
          </Box>

          <Box
            sx={{
              mb: { xs: 2, sm: 3 },
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {statusOptions.map((status) => {
              const count =
                status === "ALL"
                  ? jobPosition.hiringProcesses?.length || 0
                  : jobPosition.hiringProcesses?.filter(
                      (p) => p.status === status,
                    ).length || 0;

              return (
                <Chip
                  key={status}
                  label={`${status.replace(/_/g, " ")} (${count})`}
                  onClick={() => setStatusFilter(status)}
                  color={statusFilter === status ? "primary" : "default"}
                  variant={statusFilter === status ? "filled" : "outlined"}
                  clickable
                />
              );
            })}
          </Box>

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
                      <TableCell>{process.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={process.status}
                          color={getStatusColor(process.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {process.candidate ? (
                          <>
                            {process.candidate.name}
                            <br />
                            <Typography variant="caption" color="textSecondary">
                              {process.candidate.email}
                            </Typography>
                          </>
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
                      status: statusFilter.replace(/_/g, " "),
                    })}
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Hiring Stages - visible to everyone */}
      <Typography
        variant="h5"
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
