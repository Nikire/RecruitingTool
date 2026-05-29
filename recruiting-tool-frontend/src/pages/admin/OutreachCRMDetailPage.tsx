import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import NoteIcon from "@mui/icons-material/Note";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddCommentIcon from "@mui/icons-material/AddComment";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  useProspect,
  useAddProspectContact,
  useRemoveProspectContact,
  useAddProspectActivity,
  useUpdateProspect,
} from "../../hooks/api/useProspectTracking";
import { useOutreachTemplateOverrides } from "../../api/adminOutreachTemplates";
import type {
  ProspectStatus,
  ProspectContact,
  OutreachActivityType,
  OutreachChannel,
  CreateOutreachActivityDto,
  CreateOutreachContactDto,
} from "../../types/prospect-tracking.types";
import { CenteredLoadingSpinner } from "../../components/common";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// ── Status config (shared) ────────────────────────────────────────────────────

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

const STATUS_COLOR: Record<ProspectStatus, ChipColor> = {
  NEW: "default",
  CONTACTED: "info",
  FOLLOW_UP_1: "warning",
  FOLLOW_UP_2: "warning",
  RESPONDED: "success",
  DEMO_SCHEDULED: "primary",
  DEMO_DONE: "secondary",
  PROPOSAL_SENT: "info",
  CONVERTED: "success",
  LOST: "error",
  ARCHIVED: "default",
};

const ACTIVITY_TYPES: OutreachActivityType[] = [
  "NOTE",
  "MESSAGE_SENT",
  "RESPONSE_RECEIVED",
  "FOLLOW_UP",
  "DEMO_SCHEDULED",
  "DEMO_COMPLETED",
  "PROPOSAL_SENT",
  "STATUS_CHANGED",
  "CONTACT_ADDED",
];

const CHANNELS: OutreachChannel[] = [
  "LINKEDIN",
  "EMAIL",
  "WHATSAPP",
  "PHONE",
  "IN_PERSON",
  "OTHER",
];

const PROSPECT_STATUSES: ProspectStatus[] = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP_1",
  "FOLLOW_UP_2",
  "RESPONDED",
  "DEMO_SCHEDULED",
  "DEMO_DONE",
  "PROPOSAL_SENT",
  "CONVERTED",
  "LOST",
  "ARCHIVED",
];

// ── Activity icon helper ──────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: OutreachActivityType }) {
  switch (type) {
    case "MESSAGE_SENT":
      return <SendIcon fontSize="small" />;
    case "RESPONSE_RECEIVED":
      return <ReplyIcon fontSize="small" />;
    case "DEMO_SCHEDULED":
      return <EventIcon fontSize="small" />;
    case "DEMO_COMPLETED":
      return <EventIcon fontSize="small" color="success" />;
    case "FOLLOW_UP":
      return <EmailIcon fontSize="small" />;
    case "PROPOSAL_SENT":
      return <SendIcon fontSize="small" color="primary" />;
    case "STATUS_CHANGED":
      return <SwapHorizIcon fontSize="small" />;
    case "CONTACT_ADDED":
      return <PersonAddIcon fontSize="small" />;
    case "NOTE":
    default:
      return <NoteIcon fontSize="small" />;
  }
}

// ── Relative time ─────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
}

// ── Log Activity Dialog ───────────────────────────────────────────────────────

interface LogActivityDialogProps {
  open: boolean;
  onClose: () => void;
  prospectUid: string;
  prospectName: string;
}

interface LogActivityForm {
  type: OutreachActivityType;
  channel: OutreachChannel | "";
  notes: string;
  newStatus: ProspectStatus | "";
  templateUsed: string;
}

const LogActivityDialog: React.FC<LogActivityDialogProps> = ({
  open,
  onClose,
  prospectUid,
  prospectName,
}) => {
  const { t } = useTranslation();
  const addActivity = useAddProspectActivity();
  const { data: templateOverrides } = useOutreachTemplateOverrides();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState<
    string | null
  >(null);

  const { control, handleSubmit, watch, setValue, reset } =
    useForm<LogActivityForm>({
      defaultValues: {
        type: "NOTE",
        channel: "",
        notes: "",
        newStatus: "",
        templateUsed: "",
      },
    });

  const activityType = watch("type");

  React.useEffect(() => {
    if (open) {
      reset({
        type: "NOTE",
        channel: "",
        notes: "",
        newStatus: "",
        templateUsed: "",
      });
      setSelectedTemplateName(null);
      setShowTemplates(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: LogActivityForm) => {
    const dto: CreateOutreachActivityDto = {
      type: data.type,
      channel: data.channel || undefined,
      notes: data.notes || undefined,
      newStatus: (data.newStatus as ProspectStatus) || undefined,
      templateUsed: data.templateUsed || undefined,
    };
    await addActivity.mutateAsync({ uid: prospectUid, ...dto });
    onClose();
  };

  const handleTemplateSelect = (body: string, name: string) => {
    const substituted = body
      .replace(/\{\{EMPRESA\}\}/g, prospectName)
      .replace(/{{EMPRESA}}/g, prospectName);
    setValue("notes", substituted);
    setValue("templateUsed", name);
    setSelectedTemplateName(name);
    setShowTemplates(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("outreach_crm_detail.log_activity")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Activity Type */}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>
                    {t("outreach_crm_detail.field_activity_type")}
                  </InputLabel>
                  <Select
                    {...field}
                    label={t("outreach_crm_detail.field_activity_type")}
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {t(
                          `outreach_crm_detail.activity_type_${type.toLowerCase()}`,
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* Channel */}
            <Controller
              name="channel"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>
                    {t("outreach_crm_detail.field_channel")}
                  </InputLabel>
                  <Select
                    {...field}
                    label={t("outreach_crm_detail.field_channel")}
                  >
                    <MenuItem value="">
                      <em>{t("outreach_crm_detail.no_channel")}</em>
                    </MenuItem>
                    {CHANNELS.map((ch) => (
                      <MenuItem key={ch} value={ch}>
                        {t(`outreach_crm_detail.channel_${ch.toLowerCase()}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* Move to status */}
            <Controller
              name="newStatus"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>
                    {t("outreach_crm_detail.field_move_to_status")}
                  </InputLabel>
                  <Select
                    {...field}
                    label={t("outreach_crm_detail.field_move_to_status")}
                  >
                    <MenuItem value="">
                      <em>{t("outreach_crm_detail.no_status_change")}</em>
                    </MenuItem>
                    {PROSPECT_STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {t(`outreach_crm.status_${s.toLowerCase()}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm_detail.field_notes")}
                  multiline
                  rows={4}
                  size="small"
                  fullWidth
                />
              )}
            />

            {/* Template picker — only for MESSAGE_SENT */}
            {activityType === "MESSAGE_SENT" && (
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowTemplates((v) => !v)}
                >
                  {t("outreach_crm_detail.pick_template")}
                </Button>
                {selectedTemplateName && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {t("outreach_crm_detail.template_selected")}{" "}
                    {selectedTemplateName}
                  </Typography>
                )}

                {showTemplates && (
                  <Box
                    sx={{
                      mt: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: "auto",
                    }}
                  >
                    {templateOverrides && templateOverrides.length > 0 ? (
                      templateOverrides.map((tpl, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "action.hover" },
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                          onClick={() =>
                            handleTemplateSelect(
                              tpl.body,
                              `Template ${tpl.templateId} (${tpl.lang})`,
                            )
                          }
                        >
                          <Typography variant="body2" fontWeight={500}>
                            Template {tpl.templateId} — {tpl.lang.toUpperCase()}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tpl.body.slice(0, 80)}...
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("outreach_crm_detail.no_templates")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={addActivity.isPending}
          >
            {addActivity.isPending ? (
              <CircularProgress size={16} />
            ) : (
              t("outreach_crm_detail.log_activity_submit")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ── Add Contact Dialog ────────────────────────────────────────────────────────

interface AddContactDialogProps {
  open: boolean;
  onClose: () => void;
  prospectUid: string;
}

interface AddContactForm {
  name: string;
  role: string;
  email: string;
  linkedinUrl: string;
  phone: string;
  isPrimary: boolean;
}

const AddContactDialog: React.FC<AddContactDialogProps> = ({
  open,
  onClose,
  prospectUid,
}) => {
  const { t } = useTranslation();
  const addContact = useAddProspectContact();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddContactForm>({
    defaultValues: {
      name: "",
      role: "",
      email: "",
      linkedinUrl: "",
      phone: "",
      isPrimary: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: "",
        role: "",
        email: "",
        linkedinUrl: "",
        phone: "",
        isPrimary: false,
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: AddContactForm) => {
    const dto: CreateOutreachContactDto = {
      name: data.name,
      role: data.role || undefined,
      email: data.email || undefined,
      linkedinUrl: data.linkedinUrl || undefined,
      phone: data.phone || undefined,
      isPrimary: data.isPrimary,
    };
    await addContact.mutateAsync({ uid: prospectUid, ...dto });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("outreach_crm_detail.add_contact")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: t("outreach_crm_detail.contact_name_required"),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm_detail.contact_name")}
                  required
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm_detail.contact_role")}
                  size="small"
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm_detail.contact_email")}
                  size="small"
                  type="email"
                />
              )}
            />
            <Controller
              name="linkedinUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm_detail.contact_linkedin")}
                  size="small"
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm_detail.contact_phone")}
                  size="small"
                />
              )}
            />
            <Controller
              name="isPrimary"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={t("outreach_crm_detail.contact_is_primary")}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={addContact.isPending}
          >
            {addContact.isPending ? (
              <CircularProgress size={16} />
            ) : (
              t("common.save")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ── Delete Contact Confirmation ───────────────────────────────────────────────

interface DeleteContactDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

const DeleteContactDialog: React.FC<DeleteContactDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isPending,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>{t("outreach_crm_detail.delete_contact_title")}</DialogTitle>
      <DialogContent>
        <Typography>
          {t("outreach_crm_detail.delete_contact_message")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isPending}
        >
          {isPending ? <CircularProgress size={16} /> : t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Contact Row ───────────────────────────────────────────────────────────────

interface ContactRowProps {
  contact: ProspectContact;
  prospectUid: string;
}

const ContactRow: React.FC<ContactRowProps> = ({ contact, prospectUid }) => {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeContact = useRemoveProspectContact();

  const handleConfirmDelete = async () => {
    try {
      await removeContact.mutateAsync({
        uid: prospectUid,
        contactUid: contact.uid,
      });
      showSuccessToast(t("outreach_crm_detail.contact_deleted"));
      setConfirmOpen(false);
    } catch {
      showErrorToast(t("outreach_crm_detail.contact_delete_error"));
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          "&:last-child": { borderBottom: "none" },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {contact.name}
            </Typography>
            {contact.isPrimary && (
              <Chip
                label={t("outreach_crm_detail.primary")}
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
          {contact.role && (
            <Typography variant="caption" color="text.secondary">
              {contact.role}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            {contact.email && (
              <Link
                href={`mailto:${contact.email}`}
                variant="caption"
                sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
              >
                <EmailIcon sx={{ fontSize: 12 }} />
                {contact.email}
              </Link>
            )}
            {contact.phone && (
              <Link
                href={`tel:${contact.phone}`}
                variant="caption"
                sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
              >
                <PhoneIcon sx={{ fontSize: 12 }} />
                {contact.phone}
              </Link>
            )}
            {contact.linkedinUrl && (
              <Link
                href={contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
              >
                <LinkedInIcon sx={{ fontSize: 12 }} />
                LinkedIn
              </Link>
            )}
          </Box>
        </Box>
        <Tooltip title={t("common.delete")}>
          <IconButton
            size="small"
            color="error"
            onClick={() => setConfirmOpen(true)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <DeleteContactDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isPending={removeContact.isPending}
      />
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const OutreachCRMDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { data: prospect, isLoading, isError } = useProspect(uid ?? null);
  const updateProspect = useUpdateProspect();

  const [logActivityOpen, setLogActivityOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (isError || !prospect) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t("outreach_crm_detail.not_found")}</Alert>
      </Box>
    );
  }

  const activities = prospect.activities ?? [];
  const contacts = prospect.contacts ?? [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Back button + title header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/outreach-crm")}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          {t("outreach_crm_detail.back_to_crm")}
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {prospect.name}
              </Typography>
              {prospect.isFeatured && (
                <StarIcon sx={{ color: "warning.main" }} />
              )}
              {prospect.website && (
                <Tooltip title={prospect.website}>
                  <IconButton
                    size="small"
                    component="a"
                    href={
                      prospect.website.startsWith("http")
                        ? prospect.website
                        : `https://${prospect.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={t(
                  `outreach_crm.status_${prospect.status.toLowerCase()}`,
                )}
                color={STATUS_COLOR[prospect.status]}
                variant="filled"
                size="small"
              />
              <Chip
                label={t(
                  `outreach_crm.source_${prospect.source.toLowerCase()}`,
                )}
                variant="filled"
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main two-column layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Left: Activity Timeline */}
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {t("outreach_crm_detail.activity_timeline")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCommentIcon />}
              onClick={() => setLogActivityOpen(true)}
              size="small"
            >
              {t("outreach_crm_detail.log_activity")}
            </Button>
          </Box>

          {activities.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("outreach_crm_detail.no_activities")}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
              {activities.map((activity, idx) => (
                <Box key={activity.uid}>
                  <Box sx={{ display: "flex", gap: 2, py: 1.5 }}>
                    {/* Icon column */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: 32,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "action.hover",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ActivityIcon type={activity.type} />
                      </Box>
                      {idx < activities.length - 1 && (
                        <Box
                          sx={{
                            width: 2,
                            flex: 1,
                            bgcolor: "divider",
                            mt: 0.5,
                            minHeight: 16,
                          }}
                        />
                      )}
                    </Box>

                    {/* Content column */}
                    <Box sx={{ flex: 1, minWidth: 0, pb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {t(
                            `outreach_crm_detail.activity_type_${activity.type.toLowerCase()}`,
                          )}
                        </Typography>
                        {activity.channel && (
                          <Chip
                            label={t(
                              `outreach_crm_detail.channel_${activity.channel.toLowerCase()}`,
                            )}
                            size="small"
                            variant="filled"
                            color="default"
                          />
                        )}
                      </Box>

                      {/* Status change */}
                      {activity.previousStatus && activity.newStatus && (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Chip
                            label={t(
                              `outreach_crm.status_${activity.previousStatus.toLowerCase()}`,
                            )}
                            size="small"
                            variant="filled"
                            color={STATUS_COLOR[activity.previousStatus]}
                          />
                          <Typography variant="caption">→</Typography>
                          <Chip
                            label={t(
                              `outreach_crm.status_${activity.newStatus.toLowerCase()}`,
                            )}
                            size="small"
                            variant="filled"
                            color={STATUS_COLOR[activity.newStatus]}
                          />
                        </Box>
                      )}

                      {activity.notes && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5, whiteSpace: "pre-wrap" }}
                        >
                          {activity.notes}
                        </Typography>
                      )}

                      {activity.templateUsed && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          fontStyle="italic"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          {t("outreach_crm_detail.template_label")}{" "}
                          {activity.templateUsed}
                        </Typography>
                      )}

                      <Typography variant="caption" color="text.disabled">
                        {formatRelativeTime(activity.createdAt)}
                        {activity.createdBy && ` · ${activity.createdBy.name}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Right: Company Info + Contacts */}
        <Stack spacing={2}>
          {/* Company Info Card */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t("outreach_crm_detail.company_info")}
              </Typography>

              {/* Quick status change */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>
                  {t("outreach_crm_detail.change_status")}
                </InputLabel>
                <Select
                  value={prospect.status}
                  label={t("outreach_crm_detail.change_status")}
                  onChange={(e) => {
                    updateProspect.mutate({
                      uid: prospect.uid,
                      status: e.target.value as ProspectStatus,
                    });
                  }}
                >
                  {PROSPECT_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {t(`outreach_crm.status_${s.toLowerCase()}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack spacing={1.5}>
                {prospect.industry && (
                  <InfoRow
                    label={t("outreach_crm.field_industry")}
                    value={prospect.industry}
                  />
                )}
                {prospect.companySize && (
                  <InfoRow
                    label={t("outreach_crm.field_size")}
                    value={prospect.companySize}
                  />
                )}
                {(prospect.city || prospect.country) && (
                  <InfoRow
                    label={t("outreach_crm.field_city")}
                    value={[prospect.city, prospect.country]
                      .filter(Boolean)
                      .join(", ")}
                  />
                )}
                {prospect.campaignRef && (
                  <InfoRow
                    label={t("outreach_crm_detail.campaign_ref")}
                    value={prospect.campaignRef}
                  />
                )}
                {prospect.tags && prospect.tags.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {t("outreach_crm.field_tags")}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {prospect.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="filled"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {prospect.notes && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {t("outreach_crm.field_notes")}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {prospect.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  navigate("/admin/outreach-crm", {
                    state: { editUid: prospect.uid },
                  })
                }
              >
                {t("outreach_crm_detail.edit_in_list")}
              </Button>
            </CardContent>
          </Card>

          {/* Contacts Card */}
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {t("outreach_crm_detail.contacts")}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setAddContactOpen(true)}
                >
                  {t("outreach_crm_detail.add_contact")}
                </Button>
              </Box>

              {contacts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("outreach_crm_detail.no_contacts")}
                </Typography>
              ) : (
                <Box>
                  {contacts.map((contact) => (
                    <ContactRow
                      key={contact.uid}
                      contact={contact}
                      prospectUid={prospect.uid}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Dialogs */}
      <LogActivityDialog
        open={logActivityOpen}
        onClose={() => setLogActivityOpen(false)}
        prospectUid={prospect.uid}
        prospectName={prospect.name}
      />
      <AddContactDialog
        open={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        prospectUid={prospect.uid}
      />
    </Box>
  );
};

// ── InfoRow helper ────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: "block" }}
    >
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

export default OutreachCRMDetailPage;
