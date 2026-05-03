import { useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
    case "SENT":
      return { color: "info" };
    case "REPLIED":
      return { color: "success" };
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

// ─── Leads Table ──────────────────────────────────────────────────────────────

interface LeadsTableProps {
  campaignUid: string;
  filterStatus: string;
  filterChannel: string;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  campaignUid,
  filterStatus,
  filterChannel,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useOutreachLeads(campaignUid, {
    status: filterStatus || undefined,
    channel: filterChannel || undefined,
  });
  const updateMutation = useUpdateLead(campaignUid);
  const convertMutation = useConvertLead(campaignUid);

  const [notesDialogLead, setNotesDialogLead] = useState<OutreachLead | null>(
    null,
  );
  const [convertConfirmLead, setConvertConfirmLead] =
    useState<OutreachLead | null>(null);

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

  const handleConvert = async () => {
    if (!convertConfirmLead) return;
    try {
      const result = await convertMutation.mutateAsync(convertConfirmLead.uid);
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
      void result;
      setConvertConfirmLead(null);
    } catch {
      toast.error(t("outreachCampaigns.error"));
      setConvertConfirmLead(null);
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
              <MenuItem value="SENT">
                {t("outreachCampaigns.status_sent")}
              </MenuItem>
              <MenuItem value="REPLIED">
                {t("outreachCampaigns.status_replied")}
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
                onClick={() => setConvertConfirmLead(params.row)}
                disabled={convertMutation.isPending}
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

      <ConfirmationDialog
        open={!!convertConfirmLead}
        onClose={() => setConvertConfirmLead(null)}
        onConfirm={handleConvert}
        title={t("outreachCampaigns.confirm_convert_title")}
        message={t("outreachCampaigns.confirm_convert_message", {
          name: convertConfirmLead?.name,
          company: convertConfirmLead?.company,
        })}
        severity="info"
        isLoading={convertMutation.isPending}
      />
    </>
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
                      <MenuItem value="SENT">
                        {t("outreachCampaigns.status_sent")}
                      </MenuItem>
                      <MenuItem value="REPLIED">
                        {t("outreachCampaigns.status_replied")}
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
                        key: "sent",
                        label: t("outreachCampaigns.status_sent"),
                        count: selectedCampaign.leadCounts.sent,
                        color: "info" as ChipColor,
                      },
                      {
                        key: "replied",
                        label: t("outreachCampaigns.status_replied"),
                        count: selectedCampaign.leadCounts.replied,
                        color: "success" as ChipColor,
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

                <Box sx={{ display: "flex", gap: 1 }}>
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
