import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { Visibility } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  usePreviewEmailTemplate,
} from "../../hooks/api/useEmailTemplates";
import {
  EmailTemplate,
  EmailTemplateType,
} from "../../types/emailTemplate.types";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";

interface EmailTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
}

interface EmailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType | "";
  isDefault: boolean;
}

const EmailTemplateDialog: React.FC<EmailTemplateDialogProps> = ({
  open,
  onClose,
  template,
}) => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    renderedSubject: string;
    renderedBody: string;
  } | null>(null);

  const AVAILABLE_VARIABLES = [
    {
      key: "{{candidateName}}",
      description: t("email_template.variable_candidate_name"),
    },
    {
      key: "{{positionTitle}}",
      description: t("email_template.variable_position_title"),
    },
    {
      key: "{{companyName}}",
      description: t("email_template.variable_company_name"),
    },
    { key: "{{hrName}}", description: t("email_template.variable_hr_name") },
    {
      key: "{{interviewDate}}",
      description: t("email_template.variable_interview_date"),
    },
    {
      key: "{{interviewTime}}",
      description: t("email_template.variable_interview_time"),
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailTemplateFormData>({
    defaultValues: {
      name: template?.name || "",
      subject: template?.subject || "",
      body: template?.body || "",
      type: template?.type || "",
      isDefault: template?.isDefault || false,
    },
  });

  const { mutate: createTemplate, isPending: isCreating } =
    useCreateEmailTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } =
    useUpdateEmailTemplate();
  const { mutate: previewTemplate, isPending: isPreviewing } =
    usePreviewEmailTemplate();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!template;

  const onSubmit = (data: EmailTemplateFormData) => {
    if (!user?.company?.uid) {
      return;
    }

    if (isEditMode && template) {
      updateTemplate(
        {
          uid: template.uid,
          data: {
            name: data.name,
            subject: data.subject,
            body: data.body,
            type: data.type || undefined,
            isDefault: data.isDefault,
          },
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        },
      );
    } else {
      createTemplate(
        {
          name: data.name,
          subject: data.subject,
          body: data.body,
          companyUid: user.company.uid,
          type: data.type || undefined,
          isDefault: data.isDefault,
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        },
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const insertVariable = (variable: string) => {
    const currentBody = watch("body") || "";
    setValue("body", currentBody + variable);
  };

  const handlePreview = () => {
    if (!template?.uid) {
      // For new templates, can't preview until saved
      setPreviewData({
        renderedSubject: watch("subject") || "",
        renderedBody: watch("body") || "",
      });
      setShowPreview(true);
      return;
    }

    previewTemplate(
      { uid: template.uid },
      {
        onSuccess: (data) => {
          setPreviewData(data);
          setShowPreview(true);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode
          ? t("email_template.edit_title")
          : t("email_template.create_title")}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label={t("email_template.template_name")}
            fullWidth
            margin="normal"
            {...register("name", {
              required: t("email_template.name_required"),
              minLength: {
                value: 3,
                message: t("email_template.name_min_length", { min: 3 }),
              },
              maxLength: {
                value: 200,
                message: t("email_template.name_max_length", { max: 200 }),
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
            placeholder={t("email_template.template_name_placeholder")}
          />

          <TextField
            label={t("email_template.subject")}
            fullWidth
            margin="normal"
            {...register("subject", {
              required: t("email_template.subject_required"),
              minLength: {
                value: 3,
                message: t("email_template.subject_min_length", { min: 3 }),
              },
              maxLength: {
                value: 500,
                message: t("email_template.subject_max_length", { max: 500 }),
              },
            })}
            error={!!errors.subject}
            helperText={errors.subject?.message}
            placeholder={t("email_template.subject_placeholder")}
          />

          <TextField
            select
            label={t("email_template.type_label")}
            fullWidth
            margin="normal"
            {...register("type")}
            error={!!errors.type}
            helperText={errors.type?.message || t("email_template.type_helper")}
            defaultValue={template?.type || ""}
          >
            <MenuItem value="">{t("email_template.type_none")}</MenuItem>
            <MenuItem value={EmailTemplateType.APPLICATION_RECEIVED}>
              {t("email_template.type_application_received")}
            </MenuItem>
            <MenuItem value={EmailTemplateType.APPLICATION_REJECTED}>
              {t("email_template.type_application_rejected")}
            </MenuItem>
            <MenuItem value={EmailTemplateType.APPLICATION_SHORTLISTED}>
              {t("email_template.type_application_shortlisted")}
            </MenuItem>
            <MenuItem value={EmailTemplateType.INTERVIEW_INVITATION}>
              {t("email_template.type_interview_invitation")}
            </MenuItem>
            <MenuItem value={EmailTemplateType.INTERVIEW_REMINDER}>
              {t("email_template.type_interview_reminder")}
            </MenuItem>
            <MenuItem value={EmailTemplateType.OFFER_LETTER}>
              {t("email_template.type_offer_letter")}
            </MenuItem>
            <MenuItem value={EmailTemplateType.CUSTOM}>
              {t("email_template.type_custom")}
            </MenuItem>
          </TextField>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("email_template.available_variables")}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {AVAILABLE_VARIABLES.map((variable) => (
                <Chip
                  key={variable.key}
                  label={variable.key}
                  onClick={() => insertVariable(variable.key)}
                  size="small"
                  sx={{ mb: 1 }}
                  color="primary"
                  variant="filled"
                />
              ))}
            </Stack>
          </Box>

          <TextField
            label={t("email_template.body")}
            fullWidth
            margin="normal"
            multiline
            rows={12}
            {...register("body", {
              required: t("email_template.body_required"),
            })}
            error={!!errors.body}
            helperText={errors.body?.message || t("email_template.body_helper")}
            placeholder={t("email_template.body_placeholder")}
          />

          <FormControlLabel
            control={
              <Checkbox
                {...register("isDefault")}
                defaultChecked={template?.isDefault || false}
              />
            }
            label={t("email_template.mark_default")}
          />

          {showPreview && previewData && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t("email_template.preview_title")}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                {t("email_template.preview_info")}
              </Alert>
              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 2, backgroundColor: "background.default" }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("email_template.preview_subject")}:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                  {previewData.renderedSubject}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("email_template.preview_body")}:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {previewData.renderedBody}
                </Typography>
              </Paper>
              <Button size="small" onClick={() => setShowPreview(false)}>
                {t("email_template.hide_preview")}
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          {isEditMode && (
            <Button
              onClick={handlePreview}
              disabled={isPreviewing}
              startIcon={
                isPreviewing ? <CircularProgress size={20} /> : <Visibility />
              }
            >
              {isPreviewing
                ? t("email_template.previewing")
                : t("email_template.preview")}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isPending
              ? t("common.saving")
              : isEditMode
                ? t("common.update")
                : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmailTemplateDialog;
