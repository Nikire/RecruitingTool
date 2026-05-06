import { useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PageHeader, ConfirmationDialog } from "../../components/common";
import {
  useOutreachCampaigns,
  useCreateCampaign,
  useDeleteCampaign,
  useOutreachLeads,
  useImportLeads,
  useUpdateLead,
  useConvertLead,
  usePreviewLeadEmail,
} from "../../api/outreachCampaigns";
import type {
  OutreachCampaign,
  OutreachLead,
  OutreachLeadChannel,
  OutreachLeadStatus,
} from "../../types/outreach-campaigns.types";

// ─── Status chip helper ───────────────────────────────────────────────────────

type ChipColor =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "primary"
  | "secondary";

function statusChipProps(status: OutreachLeadStatus): {
  color: ChipColor;
  sx?: Record<string, unknown>;
} {
  switch (status) {
    case "PENDING":
      return { color: "default" };
    case "CONVERTED":
      return { color: "secondary", sx: { bgcolor: "purple", color: "white" } };
    default:
      return { color: "default" };
  }
}

// ─── New Campaign Dialog ───────────────────────────────────────────────────────

interface NewCampaignDialogProps {
  open: boolean;
  onClose: () => void;
}

const NewCampaignDialog: React.FC<NewCampaignDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateCampaign();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success(t("outreachCampaigns.campaign_created"));
      setName("");
      setDescription("");
      onClose();
    } catch {
      toast.error(t("outreachCampaigns.error"));
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("outreachCampaigns.new_campaign")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t("outreachCampaigns.campaign_name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            size="small"
            autoFocus
          />
          <TextField
            label={t("outreachCampaigns.campaign_description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={createMutation.isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !name.trim()}
        >
          {createMutation.isPending ? t("common.creating") : t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Import CSV Dialog ────────────────────────────────────────────────────────

interface ImportCsvDialogProps {
  open: boolean;
  onClose: () => void;
  campaignUid: string;
}

const ImportCsvDialog: React.FC<ImportCsvDialogProps> = ({
  open,
  onClose,
  campaignUid,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const importMutation = useImportLeads(campaignUid);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    try {
      const result = await importMutation.mutateAsync(selectedFile);
      toast.success(
        t("outreachCampaigns.import_success", {
          imported: result.imported,
          skipped: result.skipped,
        }),
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch {
      toast.error(t("outreachCampaigns.import_error"));
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("outreachCampaigns.import_csv")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("outreachCampaigns.import_hint")}
          </Typography>
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadFileIcon />}
                size="small"
              >
                {t("outreachCampaigns.choose_file")}
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                {selectedFile.name}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={importMutation.isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={importMutation.isPending || !selectedFile}
          startIcon={
            importMutation.isPending ? (
              <CircularProgress size={16} />
            ) : undefined
          }
        >
          {importMutation.isPending
            ? t("common.uploading")
            : t("outreachCampaigns.import")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Edit Notes Dialog ────────────────────────────────────────────────────────

interface EditNotesDialogProps {
  open: boolean;
  onClose: () => void;
  lead: OutreachLead;
  campaignUid: string;
}

const EditNotesDialog: React.FC<EditNotesDialogProps> = ({
  open,
  onClose,
  lead,
  campaignUid,
}) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const updateMutation = useUpdateLead(campaignUid);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ leadUid: lead.uid, notes });
      toast.success(t("outreachCampaigns.lead_updated"));
      onClose();
    } catch {
      toast.error(t("outreachCampaigns.error"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("outreachCampaigns.edit_notes")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {lead.name} — {lead.company}
          </Typography>
          <TextField
            label={t("outreachCampaigns.notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={4}
            fullWidth
            size="small"
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateMutation.isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Preview Email Dialog ─────────────────────────────────────────────────────

interface PreviewEmailDialogProps {
  open: boolean;
  onClose: () => void;
  lead: OutreachLead;
  campaignUid: string;
  onAddToCrm?: () => void;
}

const PreviewEmailDialog: React.FC<PreviewEmailDialogProps> = ({
  open,
  onClose,
  lead,
  campaignUid,
  onAddToCrm,
}) => {
  const { t } = useTranslation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { data, isLoading, isError } = usePreviewLeadEmail(
    campaignUid,
    lead.uid,
    open,
  );

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent ?? div.innerText ?? html;
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const plainBody = data ? stripHtml(data.body) : "";

  const handleCopyAll = () => {
    if (!data) return;
    copy(`${data.subject}\n\n${plainBody}`, "all");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t("outreachCampaigns.previewEmail.title")}
        {data && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("outreachCampaigns.previewEmail.template_label")}:{" "}
            <strong>{data.templateName}</strong>
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Stack spacing={1.5}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        )}
        {isError && (
          <Typography color="error">
            {t("outreachCampaigns.previewEmail.error")}
          </Typography>
        )}
        {data && (
          <Stack spacing={2}>
            {/* To */}
            {lead.email && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ display: "block", mb: 0.5 }}
                >
                  {t("outreachCampaigns.previewEmail.to_label")}
                </Typography>
                <TextField
                  value={`${lead.name} <${lead.email}>`}
                  fullWidth
                  size="small"
                  slotProps={{ input: { readOnly: true } }}
                />
              </Box>
            )}

            {/* Subject */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {t("outreachCampaigns.previewEmail.subject_label")}
                </Typography>
                <Button
                  size="small"
                  variant={copiedKey === "subject" ? "contained" : "outlined"}
                  color={copiedKey === "subject" ? "success" : "primary"}
                  startIcon={
                    copiedKey === "subject" ? (
                      <CheckIcon fontSize="small" />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )
                  }
                  onClick={() => copy(data.subject, "subject")}
                >
                  {copiedKey === "subject"
                    ? t("outreachCampaigns.previewEmail.copied_subject")
                    : t("outreachCampaigns.previewEmail.copy_subject")}
                </Button>
              </Box>
              <TextField
                value={data.subject}
                fullWidth
                size="small"
                slotProps={{ input: { readOnly: true } }}
                sx={{ "& .MuiInputBase-input": { fontWeight: 500 } }}
              />
            </Box>

            {/* Body */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {t("outreachCampaigns.previewEmail.body_label")}
                </Typography>
                <Button
                  size="small"
                  variant={copiedKey === "body" ? "contained" : "outlined"}
                  color={copiedKey === "body" ? "success" : "primary"}
                  startIcon={
                    copiedKey === "body" ? (
                      <CheckIcon fontSize="small" />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )
                  }
                  onClick={() => copy(plainBody, "body")}
                >
                  {copiedKey === "body"
                    ? t("outreachCampaigns.previewEmail.copied_body")
                    : t("outreachCampaigns.previewEmail.copy_body")}
                </Button>
              </Box>
              <TextField
                value={plainBody}
                fullWidth
                multiline
                rows={12}
                slotProps={{ input: { readOnly: true } }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                  },
                }}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 2.5, pb: 2 }}>
        <Button
          variant="outlined"
          startIcon={
            copiedKey === "all" ? (
              <CheckIcon fontSize="small" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )
          }
          color={copiedKey === "all" ? "success" : "inherit"}
          onClick={handleCopyAll}
          disabled={!data}
        >
          {copiedKey === "all"
            ? t("outreachCampaigns.previewEmail.copied_all")
            : t("outreachCampaigns.previewEmail.copy_all")}
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>{t("common.close")}</Button>
          {onAddToCrm && !lead.convertedToProspectAt && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                onClose();
                onAddToCrm();
              }}
            >
              {t("outreachCampaigns.add_to_crm")}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

// ─── Convert Lead Dialog ──────────────────────────────────────────────────────

interface ConvertLeadDialogProps {
  open: boolean;
  onClose: () => void;
  lead: OutreachLead | null;
  campaignUid: string;
}

const TAG_SUGGESTIONS = ["Santiago", "Erik"];

const ConvertLeadDialog: React.FC<ConvertLeadDialogProps> = ({
  open,
  onClose,
  lead,
  campaignUid,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const convertMutation = useConvertLead(campaignUid);

  const handleConvert = async () => {
    if (!lead) return;
    try {
      await convertMutation.mutateAsync({ leadUid: lead.uid, tags });
      toast.success(
        <Box>
          <Typography variant="body2">
            {t("outreachCampaigns.converted_success")}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/admin/outreach-crm")}
            sx={{ cursor: "pointer" }}
          >
            {t("outreachCampaigns.view_in_crm")}
          </Link>
        </Box>,
      );
      setTags([]);
      onClose();
    } catch {
      toast.error(t("outreachCampaigns.error"));
      onClose();
    }
  };

  const handleClose = () => {
    setTags([]);
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("outreachCampaigns.confirm_convert_title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("outreachCampaigns.confirm_convert_message", {
              name: lead.name,
              company: lead.company,
            })}
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={TAG_SUGGESTIONS}
            value={tags}
            onChange={(_e, newValue) => setTags(newValue as string[])}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option}
                    size="small"
                    variant="filled"
                    {...tagProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={t("outreachCampaigns.convert_tags_label")}
                placeholder={t("outreachCampaigns.convert_tags_placeholder")}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={convertMutation.isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleConvert}
          disabled={convertMutation.isPending}
          startIcon={
            convertMutation.isPending ? (
              <CircularProgress size={16} />
            ) : undefined
          }
        >
          {convertMutation.isPending
            ? t("common.saving")
            : t("outreachCampaigns.add_to_crm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Leads Table ──────────────────────────────────────────────────────────────

interface LeadsTableProps {
  campaignUid: string;
  filterStatus: string;
  filterChannel: string;
  filterDate: string;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  campaignUid,
  filterStatus,
  filterChannel,
  filterDate,
}) => {
  const { t } = useTranslation();
  const { data: rawLeads = [], isLoading } = useOutreachLeads(campaignUid, {
    status: filterStatus || undefined,
    channel: filterChannel || undefined,
  });

  const leads = filterDate
    ? rawLeads.filter((l) => {
        const leadDay = l.createdAt.slice(0, 10);
        return leadDay === filterDate;
      })
    : rawLeads;
  const updateMutation = useUpdateLead(campaignUid);

  const [notesDialogLead, setNotesDialogLead] = useState<OutreachLead | null>(
    null,
  );
  const [convertDialogLead, setConvertDialogLead] =
    useState<OutreachLead | null>(null);
  const [previewEmailLead, setPreviewEmailLead] = useState<OutreachLead | null>(
    null,
  );

  const handleStatusChange = async (
    lead: OutreachLead,
    status: OutreachLeadStatus,
  ) => {
    try {
      await updateMutation.mutateAsync({ leadUid: lead.uid, status });
    } catch {
      toast.error(t("outreachCampaigns.error"));
    }
  };

  const handleChannelChange = async (
    lead: OutreachLead,
    channel: OutreachLeadChannel,
  ) => {
    try {
      await updateMutation.mutateAsync({ leadUid: lead.uid, channel });
    } catch {
      toast.error(t("outreachCampaigns.error"));
    }
  };

  const columns: GridColDef<OutreachLead>[] = [
    {
      field: "name",
      headerName: t("outreachCampaigns.col_name"),
      flex: 1,
      minWidth: 140,
    },
    {
      field: "company",
      headerName: t("outreachCampaigns.col_company"),
      flex: 1,
      minWidth: 140,
    },
    {
      field: "email",
      headerName: t("outreachCampaigns.col_email"),
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<OutreachLead>) =>
        params.row.email ? (
          <Typography variant="body2" noWrap>
            {params.row.email}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: "title",
      headerName: t("outreachCampaigns.col_title"),
      width: 160,
      renderCell: (params: GridRenderCellParams<OutreachLead>) =>
        params.row.title ? (
          <Typography variant="body2" noWrap>
            {params.row.title}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: "phone",
      headerName: t("outreachCampaigns.col_phone"),
      width: 140,
      renderCell: (params: GridRenderCellParams<OutreachLead>) =>
        params.row.phone ? (
          <Link
            href={`tel:${params.row.phone}`}
            variant="body2"
            underline="hover"
          >
            {params.row.phone}
          </Link>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: "city",
      headerName: t("outreachCampaigns.col_city"),
      width: 120,
      renderCell: (params: GridRenderCellParams<OutreachLead>) =>
        params.row.city ? (
          <Typography variant="body2" noWrap>
            {params.row.city}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: "country",
      headerName: t("outreachCampaigns.col_country"),
      width: 120,
      renderCell: (params: GridRenderCellParams<OutreachLead>) =>
        params.row.country ? (
          <Typography variant="body2" noWrap>
            {params.row.country}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: "seniority",
      headerName: t("outreachCampaigns.col_seniority"),
      width: 120,
      renderCell: (params: GridRenderCellParams<OutreachLead>) =>
        params.row.seniority ? (
          <Typography variant="body2" noWrap>
            {params.row.seniority}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: "linkedinUrl",
      headerName: t("outreachCampaigns.col_linkedin"),
      width: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<OutreachLead>) =>
        params.row.linkedinUrl ? (
          <Tooltip title={params.row.linkedinUrl}>
            <IconButton
              size="small"
              component="a"
              href={params.row.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: "channel",
      headerName: t("outreachCampaigns.col_channel"),
      width: 140,
      renderCell: (params: GridRenderCellParams<OutreachLead>) => (
        <FormControl size="small" fullWidth>
          <Select
            value={params.row.channel}
            onChange={(e) =>
              handleChannelChange(
                params.row,
                e.target.value as OutreachLeadChannel,
              )
            }
            variant="standard"
            disableUnderline
          >
            <MenuItem value="EMAIL">
              {t("outreachCampaigns.channel_email")}
            </MenuItem>
            <MenuItem value="LINKEDIN">
              {t("outreachCampaigns.channel_linkedin")}
            </MenuItem>
          </Select>
        </FormControl>
      ),
    },
    {
      field: "status",
      headerName: t("outreachCampaigns.col_status"),
      width: 150,
      renderCell: (params: GridRenderCellParams<OutreachLead>) => {
        const { color, sx } = statusChipProps(params.row.status);
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={params.row.status}
              onChange={(e) =>
                handleStatusChange(
                  params.row,
                  e.target.value as OutreachLeadStatus,
                )
              }
              renderValue={(val) => {
                return (
                  <Chip
                    label={t(`outreachCampaigns.status_${val.toLowerCase()}`)}
                    color={color}
                    variant="filled"
                    size="small"
                    sx={sx}
                  />
                );
              }}
              variant="standard"
              disableUnderline
            >
              <MenuItem value="PENDING">
                {t("outreachCampaigns.status_pending")}
              </MenuItem>
              <MenuItem value="CONVERTED">
                {t("outreachCampaigns.status_converted")}
              </MenuItem>
            </Select>
          </FormControl>
        );
      },
    },
    {
      field: "notes",
      headerName: t("outreachCampaigns.col_notes"),
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<OutreachLead>) => (
        <Tooltip title={params.row.notes ?? ""}>
          <Typography
            variant="body2"
            color={params.row.notes ? "text.primary" : "text.disabled"}
            noWrap
            sx={{ cursor: "pointer", textDecoration: "underline dotted" }}
            onClick={() => setNotesDialogLead(params.row)}
          >
            {params.row.notes
              ? params.row.notes.length > 40
                ? params.row.notes.slice(0, 40) + "…"
                : params.row.notes
              : t("outreachCampaigns.add_notes")}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "sendEmail",
      headerName: t("outreachCampaigns.sendEmail.title"),
      width: 70,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<OutreachLead>) => {
        const hasEmail = !!params.row.email;
        const isConverted = params.row.status === "CONVERTED";
        if (!hasEmail || isConverted) return null;
        return (
          <Tooltip title={t("outreachCampaigns.sendEmail.disabled_tooltip")}>
            <span>
              <IconButton size="small" color="primary" disabled={true}>
                <EmailIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "previewEmail",
      headerName: t("outreachCampaigns.previewEmail.col_header"),
      width: 70,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<OutreachLead>) => (
        <Tooltip title={t("outreachCampaigns.previewEmail.tooltip")}>
          <IconButton
            size="small"
            color="default"
            onClick={() => setPreviewEmailLead(params.row)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams<OutreachLead>) => {
        const isConverted = !!params.row.convertedToProspectAt;
        return (
          <Box>
            {isConverted ? (
              <Chip
                label={t("outreachCampaigns.in_crm")}
                size="small"
                color="secondary"
                variant="filled"
                sx={{ bgcolor: "purple", color: "white" }}
              />
            ) : (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => setConvertDialogLead(params.row)}
              >
                {t("outreachCampaigns.add_to_crm")}
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <DataGrid
        rows={leads}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        sx={{
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
        }}
      />

      {notesDialogLead && (
        <EditNotesDialog
          open={true}
          onClose={() => setNotesDialogLead(null)}
          lead={notesDialogLead}
          campaignUid={campaignUid}
        />
      )}

      {previewEmailLead && (
        <PreviewEmailDialog
          open={true}
          onClose={() => setPreviewEmailLead(null)}
          lead={previewEmailLead}
          campaignUid={campaignUid}
          onAddToCrm={
            !previewEmailLead.convertedToProspectAt
              ? () => {
                  setConvertDialogLead(previewEmailLead);
                  setPreviewEmailLead(null);
                }
              : undefined
          }
        />
      )}

      <ConvertLeadDialog
        open={!!convertDialogLead}
        onClose={() => setConvertDialogLead(null)}
        lead={convertDialogLead}
        campaignUid={campaignUid}
      />
    </>
  );
};

// ─── Guide Accordion ──────────────────────────────────────────────────────────

const GuideAccordion: React.FC = () => {
  const { t } = useTranslation();

  const csvRows = [
    {
      col: t("outreachCampaigns.guide.csv_row1_col"),
      field: t("outreachCampaigns.guide.csv_row1_field"),
    },
    {
      col: t("outreachCampaigns.guide.csv_row2_col"),
      field: t("outreachCampaigns.guide.csv_row2_field"),
    },
    {
      col: t("outreachCampaigns.guide.csv_row3_col"),
      field: t("outreachCampaigns.guide.csv_row3_field"),
    },
    {
      col: t("outreachCampaigns.guide.csv_row4_col"),
      field: t("outreachCampaigns.guide.csv_row4_field"),
    },
    {
      col: t("outreachCampaigns.guide.csv_row5_col"),
      field: t("outreachCampaigns.guide.csv_row5_field"),
    },
  ];

  const apolloFilterChips = [
    "HR Director",
    "VP of People",
    "Head of Talent",
    "50–500 employees",
    "Tech",
    "Consulting",
    "Agency",
  ];

  return (
    <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" fontWeight={600}>
          {t("outreachCampaigns.guide.accordion_title")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          {/* Section 1: Apollo.io */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t("outreachCampaigns.guide.apollo_title")}
            </Typography>
            <Stack component="ol" spacing={1} sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2">
                {t("outreachCampaigns.guide.apollo_step1")}
              </Typography>
              <Box component="li">
                <Typography variant="body2" gutterBottom>
                  {t("outreachCampaigns.guide.apollo_step2")}
                </Typography>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
                >
                  {apolloFilterChips.map((chip) => (
                    <Chip
                      key={chip}
                      label={chip}
                      size="small"
                      variant="filled"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
              <Box component="li">
                <Typography variant="body2" gutterBottom>
                  {t("outreachCampaigns.guide.apollo_step3_label")}
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}
                >
                  <Typography
                    variant="body2"
                    fontStyle="italic"
                    color="text.secondary"
                  >
                    &ldquo;{t("outreachCampaigns.guide.apollo_step3_prompt")}
                    &rdquo;
                  </Typography>
                </Paper>
              </Box>
              <Typography component="li" variant="body2">
                {t("outreachCampaigns.guide.apollo_step4")}
              </Typography>
              <Typography component="li" variant="body2">
                {t("outreachCampaigns.guide.apollo_step5")}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          {/* Section 2: CSV format */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t("outreachCampaigns.guide.csv_title")}
            </Typography>
            <Table size="small" sx={{ maxWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t("outreachCampaigns.guide.csv_apollo_col")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t("outreachCampaigns.guide.csv_our_field")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {csvRows.map((row) => (
                  <TableRow key={row.col}>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.col}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.field}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Divider />

          {/* Section 3: n8n */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t("outreachCampaigns.guide.n8n_title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("outreachCampaigns.guide.n8n_description")}
            </Typography>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const OutreachCampaignsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: campaigns = [], isLoading: campaignsLoading } =
    useOutreachCampaigns();
  const deleteMutation = useDeleteCampaign();

  const [selectedTab, setSelectedTab] = useState(0);
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [deleteCampaign, setDeleteCampaign] = useState<OutreachCampaign | null>(
    null,
  );

  const selectedCampaign = campaigns[selectedTab] ?? null;

  const handleDeleteCampaign = async () => {
    if (!deleteCampaign) return;
    try {
      await deleteMutation.mutateAsync(deleteCampaign.uid);
      toast.success(t("outreachCampaigns.campaign_deleted"));
      setSelectedTab(0);
      setDeleteCampaign(null);
    } catch {
      toast.error(t("outreachCampaigns.error"));
      setDeleteCampaign(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="outreachCampaigns.title"
        subtitle="outreachCampaigns.subtitle"
        translate={true}
        action={{
          label: "outreachCampaigns.new_campaign",
          icon: <AddIcon />,
          onClick: () => setNewCampaignOpen(true),
        }}
      />

      {/* How to get leads guide */}
      <GuideAccordion />

      {/* Campaign tabs */}
      {campaignsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : campaigns.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary" gutterBottom>
            {t("outreachCampaigns.no_campaigns")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewCampaignOpen(true)}
          >
            {t("outreachCampaigns.new_campaign")}
          </Button>
        </Box>
      ) : (
        <>
          {/* Tabs row */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Tabs
              value={Math.min(selectedTab, campaigns.length - 1)}
              onChange={(_, v) => {
                setSelectedTab(v as number);
                setFilterStatus("");
                setFilterChannel("");
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ flex: 1 }}
            >
              {campaigns.map((c) => (
                <Tab
                  key={c.uid}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{c.name}</span>
                      <Chip
                        label={c.leadCounts.total}
                        size="small"
                        variant="filled"
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {selectedCampaign && (
            <>
              {/* Campaign UID row */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {t("outreachCampaigns.campaign_uid_label")}:
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                  {selectedCampaign.uid}
                </Typography>
                <Tooltip title={t("common.copy")}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCampaign.uid);
                      toast.success(t("outreachCampaigns.uid_copied"));
                    }}
                  >
                    <ContentCopyIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Toolbar */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>
                      {t("outreachCampaigns.filter_status")}
                    </InputLabel>
                    <Select
                      value={filterStatus}
                      label={t("outreachCampaigns.filter_status")}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>{t("common.filter")}</em>
                      </MenuItem>
                      <MenuItem value="PENDING">
                        {t("outreachCampaigns.status_pending")}
                      </MenuItem>
                      <MenuItem value="CONVERTED">
                        {t("outreachCampaigns.status_converted")}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>
                      {t("outreachCampaigns.filter_channel")}
                    </InputLabel>
                    <Select
                      value={filterChannel}
                      label={t("outreachCampaigns.filter_channel")}
                      onChange={(e) => setFilterChannel(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>{t("common.filter")}</em>
                      </MenuItem>
                      <MenuItem value="EMAIL">
                        {t("outreachCampaigns.channel_email")}
                      </MenuItem>
                      <MenuItem value="LINKEDIN">
                        {t("outreachCampaigns.channel_linkedin")}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    type="date"
                    size="small"
                    label={t("outreachCampaigns.filter_date")}
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 160 }}
                    InputProps={{
                      endAdornment: filterDate ? (
                        <Tooltip
                          title={t("outreachCampaigns.filter_date_clear")}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setFilterDate("")}
                            edge="end"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : undefined,
                    }}
                  />

                  {/* Lead counts summary */}
                  <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
                    {[
                      {
                        key: "pending",
                        label: t("outreachCampaigns.status_pending"),
                        count: selectedCampaign.leadCounts.pending,
                        color: "default" as ChipColor,
                      },
                      {
                        key: "converted",
                        label: t("outreachCampaigns.status_converted"),
                        count: selectedCampaign.leadCounts.converted,
                        color: "secondary" as ChipColor,
                      },
                    ].map(({ key, label, count, color }) => (
                      <Chip
                        key={key}
                        label={`${label}: ${count}`}
                        size="small"
                        color={color}
                        variant="filled"
                        sx={
                          key === "converted"
                            ? { bgcolor: "purple", color: "white" }
                            : undefined
                        }
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    size="small"
                    onClick={() => setImportOpen(true)}
                  >
                    {t("outreachCampaigns.import_csv")}
                  </Button>
                  <Tooltip title={t("outreachCampaigns.delete_campaign")}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteCampaign(selectedCampaign)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Leads DataGrid */}
              <LeadsTable
                campaignUid={selectedCampaign.uid}
                filterStatus={filterStatus}
                filterChannel={filterChannel}
                filterDate={filterDate}
              />
            </>
          )}
        </>
      )}

      {/* Dialogs */}
      <NewCampaignDialog
        open={newCampaignOpen}
        onClose={() => setNewCampaignOpen(false)}
      />

      {selectedCampaign && (
        <ImportCsvDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          campaignUid={selectedCampaign.uid}
        />
      )}

      <ConfirmationDialog
        open={!!deleteCampaign}
        onClose={() => setDeleteCampaign(null)}
        onConfirm={handleDeleteCampaign}
        title={t("outreachCampaigns.confirm_delete_campaign_title")}
        message={t("outreachCampaigns.confirm_delete_campaign_message", {
          name: deleteCampaign?.name,
        })}
        severity="error"
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
};

export default OutreachCampaignsPage;
