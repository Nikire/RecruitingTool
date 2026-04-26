import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { PageHeader, ConfirmationDialog } from "../../components/common";
import {
  ReleaseNoteAdminItem,
  useAdminReleaseNotes,
  useCreateReleaseNote,
  useUpdateReleaseNote,
  useTogglePublishReleaseNote,
  useDeleteReleaseNote,
  CreateReleaseNotePayload,
} from "../../api/adminChangelog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const tierColor = (
  tier: string,
): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
  if (tier === "professional") return "primary";
  if (tier === "enterprise") return "secondary";
  return "default";
};

// ─── Create/Edit Dialog ───────────────────────────────────────────────────────

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: ReleaseNoteAdminItem | null;
}

const emptyForm: CreateReleaseNotePayload = {
  title: "",
  body: "",
  version: "",
  targetTier: "all",
  isPublished: false,
};

function NoteDialog({ open, onClose, initial }: NoteDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!initial;

  const [form, setForm] = useState<CreateReleaseNotePayload>(
    initial
      ? {
          title: initial.title,
          body: initial.body,
          version: initial.version ?? "",
          targetTier:
            (initial.targetTier as "all" | "professional" | "enterprise") ??
            "all",
          isPublished: initial.isPublished,
        }
      : { ...emptyForm },
  );

  const { mutateAsync: create, isPending: creating } = useCreateReleaseNote();
  const { mutateAsync: update, isPending: updating } = useUpdateReleaseNote();

  const isPending = creating || updating;

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) return;

    try {
      if (isEdit && initial) {
        await update({
          uid: initial.uid,
          title: form.title,
          body: form.body,
          version: form.version || undefined,
          targetTier: form.targetTier,
          isPublished: form.isPublished,
        });
        toast.success(t("changelog.updated_success"));
      } else {
        await create({
          title: form.title,
          body: form.body,
          version: form.version || undefined,
          targetTier: form.targetTier,
          isPublished: form.isPublished,
        });
        toast.success(t("changelog.created_success"));
      }
      onClose();
    } catch {
      toast.error(
        isEdit ? t("changelog.updated_error") : t("changelog.created_error"),
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? t("changelog.edit_note") : t("changelog.new_note")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label={t("changelog.note_title")}
            placeholder={t("changelog.note_title_placeholder")}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label={t("changelog.version")}
            placeholder={t("changelog.version_placeholder")}
            value={form.version}
            onChange={(e) =>
              setForm((f) => ({ ...f, version: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label={t("changelog.body")}
            placeholder={t("changelog.body_placeholder")}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            required
            fullWidth
            multiline
            rows={5}
          />
          <FormControl fullWidth>
            <InputLabel>{t("changelog.target_tier")}</InputLabel>
            <Select
              value={form.targetTier ?? "all"}
              label={t("changelog.target_tier")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  targetTier: e.target.value as
                    | "all"
                    | "professional"
                    | "enterprise",
                }))
              }
            >
              <MenuItem value="all">{t("changelog.all_tiers")}</MenuItem>
              <MenuItem value="professional">
                {t("changelog.professional_plus")}
              </MenuItem>
              <MenuItem value="enterprise">
                {t("changelog.enterprise_only")}
              </MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={form.isPublished ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
              />
            }
            label={t("changelog.publish")}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || !form.title.trim() || !form.body.trim()}
        >
          {isPending ? t("common.saving") : t("changelog.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ChangelogPage: React.FC = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState<ReleaseNoteAdminItem | null>(null);
  const [deleteNote, setDeleteNote] = useState<ReleaseNoteAdminItem | null>(
    null,
  );

  const { data, isLoading } = useAdminReleaseNotes({
    page: page + 1,
    limit: pageSize,
  });

  const { mutateAsync: togglePublish } = useTogglePublishReleaseNote();
  const { mutateAsync: remove, isPending: deleting } = useDeleteReleaseNote();

  const handleTogglePublish = async (uid: string) => {
    try {
      await togglePublish(uid);
      toast.success(t("changelog.toggle_success"));
    } catch {
      toast.error(t("changelog.toggle_error"));
    }
  };

  const handleDelete = async () => {
    if (!deleteNote) return;
    try {
      await remove(deleteNote.uid);
      toast.success(t("changelog.deleted_success"));
      setDeleteNote(null);
    } catch {
      toast.error(t("changelog.deleted_error"));
    }
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("changelog.note_title"),
      flex: 2,
      minWidth: 160,
    },
    {
      field: "version",
      headerName: t("changelog.version"),
      width: 110,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? `v${params.value}` : "—",
    },
    {
      field: "targetTier",
      headerName: t("changelog.target_tier"),
      width: 140,
      renderCell: (params: GridRenderCellParams<ReleaseNoteAdminItem>) => {
        const tier = params.value as string;
        let label = t("changelog.all_tiers");
        if (tier === "professional") label = t("changelog.professional_plus");
        if (tier === "enterprise") label = t("changelog.enterprise_only");
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip
              label={label}
              size="small"
              variant="filled"
              color={tierColor(tier)}
            />
          </Box>
        );
      },
    },
    {
      field: "isPublished",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams<ReleaseNoteAdminItem>) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            label={
              params.value ? t("changelog.published") : t("changelog.draft")
            }
            size="small"
            variant="filled"
            color={params.value ? "success" : "default"}
          />
        </Box>
      ),
    },
    {
      field: "publishedAt",
      headerName: t("changelog.publish"),
      width: 130,
      renderCell: (params: GridRenderCellParams) =>
        formatDate(params.value as string | null),
    },
    {
      field: "seenCount",
      headerName: t("changelog.seen_by"),
      width: 110,
      type: "number",
    },
    {
      field: "actions",
      headerName: t("changelog.actions"),
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ReleaseNoteAdminItem>) => {
        const note = params.row as ReleaseNoteAdminItem;
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Tooltip title={t("common.edit")}>
              <IconButton
                size="small"
                onClick={() => {
                  setEditNote(note);
                  setDialogOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                note.isPublished
                  ? t("changelog.draft")
                  : t("changelog.published")
              }
            >
              <IconButton
                size="small"
                onClick={() => handleTogglePublish(note.uid)}
              >
                {note.isPublished ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={t("common.delete")}>
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteNote(note)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader
        title={t("changelog.title")}
        subtitle={t("changelog.subtitle")}
        translate={false}
        action={{
          label: t("changelog.new_note"),
          icon: <AddIcon />,
          onClick: () => {
            setEditNote(null);
            setDialogOpen(true);
          },
        }}
      />

      <Box sx={{ height: 600, mt: 2 }}>
        <DataGrid
          rows={data?.notes ?? []}
          columns={columns}
          getRowId={(row: ReleaseNoteAdminItem) => row.uid}
          rowCount={data?.total ?? 0}
          loading={isLoading}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={({ page: p, pageSize: ps }) => {
            setPage(p);
            setPageSize(ps);
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell": { alignItems: "center", display: "flex" },
          }}
        />
      </Box>

      {/* Create / Edit Dialog */}
      {dialogOpen && (
        <NoteDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditNote(null);
          }}
          initial={editNote}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteNote}
        title={t("changelog.delete_title")}
        message={t("changelog.confirm_delete")}
        onConfirm={handleDelete}
        onClose={() => setDeleteNote(null)}
        isLoading={deleting}
        severity="error"
      />
    </Box>
  );
};

export default ChangelogPage;
