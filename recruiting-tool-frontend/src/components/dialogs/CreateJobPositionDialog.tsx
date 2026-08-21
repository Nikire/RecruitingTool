import React, { useState, KeyboardEvent } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import FormDialog from "./FormDialog";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCreateJobPosition } from "../../hooks/api/useJobPositions";
import { Stage } from "../../types/stage.types";
import StageBuilder from "../job-positions/StageBuilder";
import FormErrorSummary from "../common/FormErrorSummary";
import { CustomQuestionBuilder } from "../forms/CustomQuestionBuilder";
import { CustomQuestion } from "../../types/customQuestions";
import { MarkdownEditor } from "../common";
import {
  JobPosition,
  JobType,
  WorkLocation,
  ExperienceLevel,
  SalaryPeriod,
} from "../../types/jobPosition.types";

interface CreateJobPositionDialogProps {
  open: boolean;
  onClose: () => void;
}

interface JobPositionFormData {
  title: string;
  description?: string;
  // Job details
  jobType?: JobType | "";
  experienceLevel?: ExperienceLevel | "";
  educationLevel?: string;
  workLocation?: WorkLocation | "";
  isUrgent?: boolean;
  // Location
  city?: string;
  state?: string;
  country?: string;
  // Salary
  salaryMin?: number | "";
  salaryMax?: number | "";
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod | "";
  showSalary?: boolean;
  // Application
  applicationDeadline?: string;
}

const JOB_TYPES: { value: JobType; labelKey: string }[] = [
  { value: "FULL_TIME", labelKey: "create_job_position.job_type_full_time" },
  { value: "PART_TIME", labelKey: "create_job_position.job_type_part_time" },
  { value: "CONTRACT", labelKey: "create_job_position.job_type_contract" },
  { value: "INTERNSHIP", labelKey: "create_job_position.job_type_internship" },
  { value: "TEMPORARY", labelKey: "create_job_position.job_type_temporary" },
  { value: "FREELANCE", labelKey: "create_job_position.job_type_freelance" },
] as const;

const EXPERIENCE_LEVELS: { value: ExperienceLevel; labelKey: string }[] = [
  { value: "ENTRY", labelKey: "create_job_position.experience_entry" },
  { value: "MID", labelKey: "create_job_position.experience_mid" },
  { value: "SENIOR", labelKey: "create_job_position.experience_senior" },
  { value: "LEAD", labelKey: "create_job_position.experience_lead" },
  { value: "EXECUTIVE", labelKey: "create_job_position.experience_executive" },
] as const;

const EDUCATION_LEVELS: { value: string; labelKey: string }[] = [
  {
    value: "HIGH_SCHOOL",
    labelKey: "create_job_position.education_high_school",
  },
  { value: "ASSOCIATE", labelKey: "create_job_position.education_associate" },
  { value: "BACHELOR", labelKey: "create_job_position.education_bachelor" },
  { value: "MASTER", labelKey: "create_job_position.education_master" },
  { value: "DOCTORATE", labelKey: "create_job_position.education_doctorate" },
  { value: "NONE", labelKey: "create_job_position.education_none" },
];

const WORK_LOCATIONS: { value: WorkLocation; labelKey: string }[] = [
  { value: "REMOTE", labelKey: "create_job_position.location_remote" },
  { value: "ON_SITE", labelKey: "create_job_position.location_onsite" },
  { value: "HYBRID", labelKey: "create_job_position.location_hybrid" },
] as const;

const SALARY_CURRENCIES = ["USD", "EUR", "GBP", "MXN", "ARS", "COP"];

const SALARY_PERIODS: { value: SalaryPeriod; labelKey: string }[] = [
  { value: "HOURLY", labelKey: "create_job_position.salary_period_hourly" },
  { value: "MONTHLY", labelKey: "create_job_position.salary_period_monthly" },
  { value: "YEARLY", labelKey: "create_job_position.salary_period_yearly" },
] as const;

// Helper component for chip-based list input
interface ChipListInputProps {
  label: string;
  placeholder: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
}

const ChipListInput: React.FC<ChipListInputProps> = ({
  label,
  placeholder,
  items,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          label={label}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleAdd}
          startIcon={<AddIcon />}
          sx={{ whiteSpace: "nowrap" }}
        >
          {t("common.add")}
        </Button>
      </Box>
      {items.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {items.map((item, index) => (
            <Chip
              key={index}
              label={item}
              size="small"
              onDelete={() => onRemove(index)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const CreateJobPositionDialog: React.FC<CreateJobPositionDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [stages, setStages] = useState<Omit<Stage, "uid" | "status">[]>([]);
  const [stageError, setStageError] = useState<string>("");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Array fields managed separately (not in react-hook-form)
  const [requirements, setRequirements] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<JobPositionFormData>({
    defaultValues: {
      title: "",
      description: "",
      jobType: "",
      experienceLevel: "",
      educationLevel: "",
      workLocation: "",
      isUrgent: false,
      city: "",
      state: "",
      country: "",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "USD",
      salaryPeriod: "",
      showSalary: false,
      applicationDeadline: "",
    },
  });

  const description = watch("description");
  const showSalary = watch("showSalary");
  const isUrgent = watch("isUrgent");

  const {
    mutate: createJobPosition,
    isPending,
    isError,
  } = useCreateJobPosition();

  const addToList = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    return (item: string) => setter((prev) => [...prev, item]);
  };

  const removeFromList = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    list: string[],
  ) => {
    return (index: number) => setter(list.filter((_, i) => i !== index));
  };

  const onSubmit = (data: JobPositionFormData) => {
    // Validate stages
    if (stages.length === 0) {
      setStageError(t("validation.stage_required"));
      return;
    }

    // Build clean payload — omit empty string values for optional selects/numbers
    const jobPositionData: Record<string, unknown> = {
      title: data.title,
      status: "OPEN" as const,
      stages: stages.map((stage) => ({
        title: stage.title,
        type: stage.type,
        description: stage.description,
        position: stage.position,
        estimatedTime: stage.estimatedTime,
      })),
      customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
    };

    if (data.description) jobPositionData.description = data.description;
    if (data.jobType) jobPositionData.jobType = data.jobType;
    if (data.experienceLevel)
      jobPositionData.experienceLevel = data.experienceLevel;
    if (data.educationLevel)
      jobPositionData.educationLevel = data.educationLevel;
    if (data.workLocation) jobPositionData.workLocation = data.workLocation;
    if (data.isUrgent) jobPositionData.isUrgent = data.isUrgent;
    if (data.city) jobPositionData.city = data.city;
    if (data.state) jobPositionData.state = data.state;
    if (data.country) jobPositionData.country = data.country;
    if (data.salaryMin !== "" && data.salaryMin !== undefined)
      jobPositionData.salaryMin = Number(data.salaryMin);
    if (data.salaryMax !== "" && data.salaryMax !== undefined)
      jobPositionData.salaryMax = Number(data.salaryMax);
    if (data.salaryCurrency)
      jobPositionData.salaryCurrency = data.salaryCurrency;
    if (data.salaryPeriod) jobPositionData.salaryPeriod = data.salaryPeriod;
    if (data.showSalary !== undefined)
      jobPositionData.showSalary = data.showSalary;
    if (data.applicationDeadline)
      jobPositionData.applicationDeadline = data.applicationDeadline;
    if (requirements.length > 0) jobPositionData.requirements = requirements;
    if (responsibilities.length > 0)
      jobPositionData.responsibilities = responsibilities;
    if (benefits.length > 0) jobPositionData.benefits = benefits;
    if (skills.length > 0) jobPositionData.skills = skills;

    createJobPosition(jobPositionData as Partial<JobPosition>, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    setStages([]);
    setCustomQuestions([]);
    setStageError("");
    setRequirements([]);
    setResponsibilities([]);
    setBenefits([]);
    setSkills([]);
    onClose();
  };

  // Stages, custom questions and the list builders live outside react-hook-form,
  // so they have to be taken into account before discarding the draft.
  const hasUnsavedChanges =
    isDirty ||
    stages.length > 0 ||
    customQuestions.length > 0 ||
    requirements.length > 0 ||
    responsibilities.length > 0 ||
    benefits.length > 0 ||
    skills.length > 0;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      isDirty={hasUnsavedChanges}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t("job_positions.create_title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormErrorSummary errors={errors} />

          {/* Basic Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("job_positions.details")}
            </Typography>

            <TextField
              label={t("job_positions.job_title_label")}
              fullWidth
              margin="normal"
              {...register("title", {
                required: t("job_positions.job_title_label")
                  ? t("validation.field_required", {
                      field: t("job_positions.job_title_label"),
                    })
                  : t("validation.required"),
                minLength: {
                  value: 3,
                  message: t("validation.min_length", { min: 3 }),
                },
              })}
              error={!!errors.title}
              helperText={errors.title?.message}
              placeholder={t("job_positions.title_placeholder")}
              InputProps={{
                endAdornment: errors.title ? (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" />
                  </InputAdornment>
                ) : null,
              }}
            />

            <MarkdownEditor
              value={description || ""}
              onChange={(val) => setValue("description", val || "")}
              label={t("job_positions.description_label")}
              placeholder={t("job_positions.description_placeholder")}
              maxLength={5000}
              minHeight={300}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Job Details Accordion */}
          <Accordion defaultExpanded disableGutters sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t("create_job_position.section_job_details")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="jobType"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          {t("create_job_position.job_type_label")}
                        </InputLabel>
                        <Select
                          {...field}
                          label={t("create_job_position.job_type_label")}
                        >
                          <MenuItem value="">
                            <em>{t("create_job_position.select_none")}</em>
                          </MenuItem>
                          {JOB_TYPES.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {t(opt.labelKey)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="experienceLevel"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          {t("create_job_position.experience_level_label")}
                        </InputLabel>
                        <Select
                          {...field}
                          label={t(
                            "create_job_position.experience_level_label",
                          )}
                        >
                          <MenuItem value="">
                            <em>{t("create_job_position.select_none")}</em>
                          </MenuItem>
                          {EXPERIENCE_LEVELS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {t(opt.labelKey)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="educationLevel"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          {t("create_job_position.education_level_label")}
                        </InputLabel>
                        <Select
                          {...field}
                          label={t("create_job_position.education_level_label")}
                        >
                          <MenuItem value="">
                            <em>{t("create_job_position.select_none")}</em>
                          </MenuItem>
                          {EDUCATION_LEVELS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {t(opt.labelKey)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="workLocation"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          {t("create_job_position.work_location_label")}
                        </InputLabel>
                        <Select
                          {...field}
                          label={t("create_job_position.work_location_label")}
                        >
                          <MenuItem value="">
                            <em>{t("create_job_position.select_none")}</em>
                          </MenuItem>
                          {WORK_LOCATIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {t(opt.labelKey)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="isUrgent"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value ?? false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={t("create_job_position.is_urgent_label")}
                      />
                    )}
                  />
                  {isUrgent && (
                    <Typography
                      variant="caption"
                      color="warning.main"
                      sx={{ display: "block", mt: -1 }}
                    >
                      {t("create_job_position.is_urgent_hint")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Location Accordion */}
          <Accordion disableGutters sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t("create_job_position.section_location")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label={t("create_job_position.city_label")}
                    fullWidth
                    size="small"
                    {...register("city")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label={t("create_job_position.state_label")}
                    fullWidth
                    size="small"
                    {...register("state")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label={t("create_job_position.country_label")}
                    fullWidth
                    size="small"
                    {...register("country")}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Salary Accordion */}
          <Accordion disableGutters sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t("create_job_position.section_salary")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("create_job_position.salary_min_label")}
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 0 }}
                    {...register("salaryMin", {
                      min: {
                        value: 0,
                        message: t("validation.positive_number"),
                      },
                    })}
                    error={!!errors.salaryMin}
                    helperText={errors.salaryMin?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t("create_job_position.salary_max_label")}
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 0 }}
                    {...register("salaryMax", {
                      min: {
                        value: 0,
                        message: t("validation.positive_number"),
                      },
                    })}
                    error={!!errors.salaryMax}
                    helperText={errors.salaryMax?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="salaryCurrency"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          {t("create_job_position.salary_currency_label")}
                        </InputLabel>
                        <Select
                          {...field}
                          label={t("create_job_position.salary_currency_label")}
                        >
                          {SALARY_CURRENCIES.map((curr) => (
                            <MenuItem key={curr} value={curr}>
                              {curr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="salaryPeriod"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          {t("create_job_position.salary_period_label")}
                        </InputLabel>
                        <Select
                          {...field}
                          label={t("create_job_position.salary_period_label")}
                        >
                          <MenuItem value="">
                            <em>{t("create_job_position.select_none")}</em>
                          </MenuItem>
                          {SALARY_PERIODS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {t(opt.labelKey)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="showSalary"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value ?? false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={t("create_job_position.show_salary_label")}
                      />
                    )}
                  />
                  {showSalary && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: -1 }}
                    >
                      {t("create_job_position.show_salary_hint")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Requirements & Skills Accordion */}
          <Accordion disableGutters sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t("create_job_position.section_requirements")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("create_job_position.requirements_label")}
                  </Typography>
                  <ChipListInput
                    label={t("create_job_position.requirements_label")}
                    placeholder={t(
                      "create_job_position.requirements_placeholder",
                    )}
                    items={requirements}
                    onAdd={addToList(setRequirements)}
                    onRemove={removeFromList(setRequirements, requirements)}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("create_job_position.responsibilities_label")}
                  </Typography>
                  <ChipListInput
                    label={t("create_job_position.responsibilities_label")}
                    placeholder={t(
                      "create_job_position.responsibilities_placeholder",
                    )}
                    items={responsibilities}
                    onAdd={addToList(setResponsibilities)}
                    onRemove={removeFromList(
                      setResponsibilities,
                      responsibilities,
                    )}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("create_job_position.skills_label")}
                  </Typography>
                  <ChipListInput
                    label={t("create_job_position.skills_label")}
                    placeholder={t("create_job_position.skills_placeholder")}
                    items={skills}
                    onAdd={addToList(setSkills)}
                    onRemove={removeFromList(setSkills, skills)}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Benefits Accordion */}
          <Accordion disableGutters sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {t("create_job_position.section_benefits")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ChipListInput
                label={t("create_job_position.benefits_label")}
                placeholder={t("create_job_position.benefits_placeholder")}
                items={benefits}
                onAdd={addToList(setBenefits)}
                onRemove={removeFromList(setBenefits, benefits)}
              />
            </AccordionDetails>
          </Accordion>

          {/* Application Deadline */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label={t("create_job_position.application_deadline_label")}
              fullWidth
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register("applicationDeadline")}
              helperText={t("create_job_position.application_deadline_hint")}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Stage Builder */}
          <Box sx={{ mb: 2 }}>
            <StageBuilder
              stages={stages}
              onChange={(newStages) => {
                setStages(newStages);
                if (newStages.length > 0) {
                  setStageError("");
                }
              }}
              minStages={1}
              error={stageError}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Custom Questions Builder */}
          <Box sx={{ mb: 2 }}>
            <CustomQuestionBuilder
              questions={customQuestions}
              onQuestionsChange={setCustomQuestions}
            />
          </Box>

          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("errors.create_failed", {
                entity: t("job_positions.title").toLowerCase(),
              })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || stages.length === 0}
            startIcon={
              isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            {isPending ? t("common.creating") : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </FormDialog>
  );
};

export default CreateJobPositionDialog;
