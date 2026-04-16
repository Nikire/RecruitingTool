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
import { useState, useEffect } from "react";
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

interface DefaultTemplateContent {
  name: string;
  subject: string;
  body: string;
}

const DEFAULT_TEMPLATES: Record<EmailTemplateType, DefaultTemplateContent> = {
  [EmailTemplateType.APPLICATION_RECEIVED]: {
    name: "Application Received",
    subject: "We received your application for {{jobTitle}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Application Received</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">Thank you for applying for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>. We have received your application and our team will review it shortly.</p>
    <p style="margin: 0 0 16px;">We appreciate your interest and will be in touch with you soon regarding the next steps.</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
  [EmailTemplateType.APPLICATION_UNDER_REVIEW]: {
    name: "Application Under Review",
    subject: "Your application for {{jobTitle}} is under review",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Application Under Review</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">We wanted to let you know that your application for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> is currently being reviewed by our hiring team.</p>
    <p style="margin: 0 0 16px;">We appreciate your patience and will update you as soon as we have news.</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
  [EmailTemplateType.APPLICATION_REJECTED]: {
    name: "Application Not Moving Forward",
    subject: "Update on your application for {{jobTitle}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Application Update</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">Thank you for your interest in the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> and for the time you invested in the application process.</p>
    <p style="margin: 0 0 16px;">After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs. We encourage you to apply for future openings that align with your background.</p>
    <p style="margin: 0 0 16px;">We wish you the very best in your job search.</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
  [EmailTemplateType.APPLICATION_SHORTLISTED]: {
    name: "You've Been Shortlisted",
    subject: "Great news about your application for {{jobTitle}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">You've Been Shortlisted!</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">We are pleased to inform you that your application for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> has been shortlisted. You are among the top candidates we are considering.</p>
    <p style="margin: 0 0 16px;">Our team will be in contact with you shortly to discuss the next steps in the process.</p>
    <p style="margin: 0 0 16px;">Congratulations on reaching this stage — we look forward to learning more about you!</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
  [EmailTemplateType.INTERVIEW_INVITATION]: {
    name: "Interview Invitation",
    subject: "Interview invitation for {{jobTitle}} at {{companyName}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Interview Invitation</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">We would like to invite you for an interview for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
    <div style="background-color: #f5f7ff; border-left: 4px solid #325CE7; padding: 16px; margin: 0 0 16px; border-radius: 0 4px 4px 0;">
      <p style="margin: 0 0 8px;"><strong>Date:</strong> {{interviewDate}}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> {{interviewTime}}</p>
      <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="{{meetingLink}}" style="color: #325CE7;">{{meetingLink}}</a></p>
    </div>
    <p style="margin: 0 0 16px;">Please confirm your availability by replying to this email. If you have any questions, do not hesitate to reach out.</p>
    <p style="margin: 0 0 16px;">We look forward to meeting you.</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
  [EmailTemplateType.INTERVIEW_REMINDER]: {
    name: "Interview Reminder",
    subject: "Reminder: Your interview for {{jobTitle}} is coming up",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Interview Reminder</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">This is a friendly reminder that your interview for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> is coming up soon.</p>
    <div style="background-color: #f5f7ff; border-left: 4px solid #325CE7; padding: 16px; margin: 0 0 16px; border-radius: 0 4px 4px 0;">
      <p style="margin: 0 0 8px;"><strong>Date:</strong> {{interviewDate}}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> {{interviewTime}}</p>
      <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="{{meetingLink}}" style="color: #325CE7;">{{meetingLink}}</a></p>
    </div>
    <p style="margin: 0 0 16px;">If you need to reschedule or have any questions, please contact us as soon as possible.</p>
    <p style="margin: 0 0 16px;">We look forward to speaking with you!</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
  [EmailTemplateType.OFFER_LETTER]: {
    name: "Job Offer",
    subject: "Job Offer: {{jobTitle}} at {{companyName}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Job Offer</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">We are delighted to offer you the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>. We were impressed by your skills and experience, and we believe you will be a valuable addition to our team.</p>
    <p style="margin: 0 0 16px;">Please review the offer details below and let us know if you have any questions. We look forward to welcoming you aboard.</p>
    <p style="margin: 0 0 16px;">To accept this offer, please reply to this email or contact us directly.</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
  [EmailTemplateType.CUSTOM]: {
    name: "Custom Email",
    subject: "Message from {{companyName}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #325CE7; padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">{{companyName}}</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Dear {{candidateName}},</p>
    <p style="margin: 0 0 16px;">{{message}}</p>
    <p style="margin: 0 0 4px;">Best regards,</p>
    <p style="margin: 0; color: #325CE7; font-weight: bold;">{{hrName}}</p>
    <p style="margin: 0; color: #666;">{{companyName}}</p>
  </div>
</div>`,
  },
};

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

  const watchedType = watch("type");

  // Auto-fill name/subject/body when a type is selected in create mode and body is empty
  useEffect(() => {
    if (isEditMode) return;
    if (!watchedType || !(watchedType in DEFAULT_TEMPLATES)) return;
    const currentBody = watch("body");
    if (currentBody && currentBody.trim() !== "") return;
    const defaults = DEFAULT_TEMPLATES[watchedType as EmailTemplateType];
    setValue("name", defaults.name, { shouldValidate: false });
    setValue("subject", defaults.subject, { shouldValidate: false });
    setValue("body", defaults.body, { shouldValidate: false });
  }, [watchedType, isEditMode, setValue, watch]);

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
