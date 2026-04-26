import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { UnifiedStatCard } from "../../components/common";
import {
  useProspects,
  useProspectStats,
  useCreateProspect,
  useUpdateProspect,
  useDeleteProspect,
} from "../../hooks/api/useProspectTracking";
import type {
  ProspectCompany,
  ProspectSource,
  ProspectStatus,
  CreateProspectDto,
} from "../../types/prospect-tracking.types";

// ── Status config ────────────────────────────────────────────────────────────

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";
type ChipVariant = "filled" | "outlined";

interface StatusConfig {
  color: ChipColor;
  variant: ChipVariant;
}

const STATUS_CONFIG: Record<ProspectStatus, StatusConfig> = {
  NEW: { color: "default", variant: "outlined" },
  CONTACTED: { color: "info", variant: "outlined" },
  FOLLOW_UP_1: { color: "warning", variant: "outlined" },
  FOLLOW_UP_2: { color: "warning", variant: "filled" },
  RESPONDED: { color: "success", variant: "outlined" },
  DEMO_SCHEDULED: { color: "primary", variant: "filled" },
  DEMO_DONE: { color: "secondary", variant: "outlined" },
  PROPOSAL_SENT: { color: "info", variant: "filled" },
  CONVERTED: { color: "success", variant: "filled" },
  LOST: { color: "error", variant: "filled" },
  ARCHIVED: { color: "default", variant: "outlined" },
};

const SOURCE_COLORS: Record<ProspectSource, string | undefined> = {
  CLUTCH: "#e84d4d",
  GOODFIRMS: "#4CAF50",
  LINKEDIN: "#0077b5",
  SALES_NAVIGATOR: "#0066cc",
  UPWORK: "#6fda44",
  TOPTAL: "#204ECF",
  GOOGLE_MAPS: "#fbbc04",
  REFERRAL: "#9c27b0",
  DIRECT: "#607d8b",
  OTHER: undefined,
};

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

const PROSPECT_SOURCES: ProspectSource[] = [
  "CLUTCH",
  "GOODFIRMS",
  "LINKEDIN",
  "SALES_NAVIGATOR",
  "UPWORK",
  "TOPTAL",
  "GOOGLE_MAPS",
  "REFERRAL",
  "DIRECT",
  "OTHER",
];

const COMPANY_SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
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

function getPrimaryContact(prospect: ProspectCompany): string {
  if (!prospect.contacts || prospect.contacts.length === 0) return "";
  const primary = prospect.contacts.find((c) => c.isPrimary);
  return (primary ?? prospect.contacts[0]).name;
}

// ── Prospect Form ────────────────────────────────────────────────────────────

interface ProspectFormData {
  name: string;
  website: string;
  industry: string;
  companySize: string;
  country: string;
  city: string;
  source: ProspectSource | "";
  status: ProspectStatus | "";
  notes: string;
}

interface ProspectDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: ProspectCompany | null;
}

const ProspectDialog: React.FC<ProspectDialogProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const { t } = useTranslation();
  const createMutation = useCreateProspect();
  const updateMutation = useUpdateProspect();
  const isEdit = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProspectFormData>({
    defaultValues: {
      name: "",
      website: "",
      industry: "",
      companySize: "",
      country: "",
      city: "",
      source: "",
      status: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          website: initialData.website ?? "",
          industry: initialData.industry ?? "",
          companySize: initialData.companySize ?? "",
          country: initialData.country ?? "",
          city: initialData.city ?? "",
          source: initialData.source,
          status: initialData.status,
          notes: initialData.notes ?? "",
        });
      } else {
        reset({
          name: "",
          website: "",
          industry: "",
          companySize: "",
          country: "",
          city: "",
          source: "",
          status: "",
          notes: "",
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: ProspectFormData) => {
    const dto: CreateProspectDto = {
      name: data.name,
      website: data.website || undefined,
      industry: data.industry || undefined,
      companySize: data.companySize || undefined,
      country: data.country || undefined,
      city: data.city || undefined,
      source: (data.source as ProspectSource) || undefined,
      status: (data.status as ProspectStatus) || undefined,
      notes: data.notes || undefined,
    };

    if (isEdit && initialData) {
      await updateMutation.mutateAsync({ uid: initialData.uid, ...dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {isEdit
            ? t("outreach_crm.edit_prospect")
            : t("outreach_crm.add_prospect")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: t("outreach_crm.name_required") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm.field_name")}
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  size="small"
                  fullWidth
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("outreach_crm.field_website")}
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("outreach_crm.field_industry")}
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("outreach_crm.field_country")}
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("outreach_crm.field_city")}
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="companySize"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel>{t("outreach_crm.field_size")}</InputLabel>
                      <Select {...field} label={t("outreach_crm.field_size")}>
                        <MenuItem value="">
                          <em>—</em>
                        </MenuItem>
                        {COMPANY_SIZE_OPTIONS.map((s) => (
                          <MenuItem key={s} value={s}>
                            {t(`outreach_crm.size_options.${s}`, {
                              defaultValue: s,
                            })}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel>{t("outreach_crm.field_source")}</InputLabel>
                      <Select {...field} label={t("outreach_crm.field_source")}>
                        <MenuItem value="">
                          <em>—</em>
                        </MenuItem>
                        {PROSPECT_SOURCES.map((s) => (
                          <MenuItem key={s} value={s}>
                            {t(`outreach_crm.source_${s.toLowerCase()}`)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl size="small" fullWidth>
                  <InputLabel>{t("outreach_crm.field_status")}</InputLabel>
                  <Select {...field} label={t("outreach_crm.field_status")}>
                    <MenuItem value="">
                      <em>—</em>
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

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("outreach_crm.field_notes")}
                  placeholder={t("outreach_crm.field_notes_placeholder")}
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
  open: boolean;
  name: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteDialogProps> = ({
  open,
  name,
  onClose,
  onConfirm,
  isPending,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("outreach_crm.delete_confirm_title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("outreach_crm.delete_confirm_message", { name })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isPending}
        >
          {isPending ? t("common.deleting") : t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────

const OutreachCRMPage: React.FC = () => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProspectStatus | "">("");
  const [filterSource, setFilterSource] = useState<ProspectSource | "">("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProspectCompany | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProspectCompany | null>(
    null,
  );

  const deleteMutation = useDeleteProspect();

  // Debounce search
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearch(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(val);
        setPaginationModel((p) => ({ ...p, page: 0 }));
      }, 400);
    },
    [],
  );

  const queryParams = useMemo(
    () => ({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: debouncedSearch || undefined,
      status: filterStatus || undefined,
      source: filterSource || undefined,
    }),
    [
      paginationModel.page,
      paginationModel.pageSize,
      debouncedSearch,
      filterStatus,
      filterSource,
    ],
  );

  const { data: listData, isLoading } = useProspects(queryParams);
  const { data: stats, isLoading: statsLoading } = useProspectStats();

  const rows = listData?.data ?? [];
  const totalRows = listData?.total ?? 0;

  const handleOpenCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = useCallback((row: ProspectCompany) => {
    setEditTarget(row);
    setDialogOpen(true);
  }, []);

  const handleOpenDelete = useCallback((row: ProspectCompany) => {
    setDeleteTarget(row);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.uid);
    setDeleteTarget(null);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: t("outreach_crm.col_company"),
        flex: 1.5,
        minWidth: 160,
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, cursor: "pointer" }}
            onClick={() => handleOpenEdit(params.row)}
          >
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "website",
        headerName: t("outreach_crm.col_website"),
        flex: 1,
        minWidth: 130,
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => {
          const url = params.value as string | undefined;
          if (!url) return null;
          const display = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 110,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {display}
              </Typography>
              <IconButton
                size="small"
                component="a"
                href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                sx={{ p: 0.25 }}
              >
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          );
        },
      },
      {
        field: "source",
        headerName: t("outreach_crm.col_source"),
        width: 130,
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => {
          const src = params.value as ProspectSource;
          const color = SOURCE_COLORS[src];
          return (
            <Chip
              label={t(`outreach_crm.source_${src.toLowerCase()}`)}
              size="small"
              variant="outlined"
              sx={color ? { borderColor: color, color } : undefined}
            />
          );
        },
      },
      {
        field: "status",
        headerName: t("outreach_crm.col_status"),
        width: 150,
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => {
          const st = params.value as ProspectStatus;
          const cfg = STATUS_CONFIG[st];
          return (
            <Chip
              label={t(`outreach_crm.status_${st.toLowerCase()}`)}
              size="small"
              color={cfg.color}
              variant={cfg.variant}
            />
          );
        },
      },
      {
        field: "location",
        headerName: t("outreach_crm.col_location"),
        width: 140,
        sortable: false,
        valueGetter: (_value: unknown, row: ProspectCompany) => {
          const parts = [row.city, row.country].filter(Boolean);
          return parts.join(", ");
        },
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "primaryContact",
        headerName: t("outreach_crm.col_contact"),
        width: 140,
        sortable: false,
        valueGetter: (_value: unknown, row: ProspectCompany) =>
          getPrimaryContact(row),
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value as string}
          </Typography>
        ),
      },
      {
        field: "lastActivityAt",
        headerName: t("outreach_crm.col_last_activity"),
        width: 130,
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => {
          const val = params.value as string | null | undefined;
          if (!val) {
            return (
              <Typography variant="body2" color="text.disabled">
                {t("outreach_crm.never")}
              </Typography>
            );
          }
          return (
            <Typography variant="body2">{formatRelativeTime(val)}</Typography>
          );
        },
      },
      {
        field: "createdAt",
        headerName: t("outreach_crm.col_created"),
        width: 110,
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => (
          <Typography variant="body2">
            {new Date(params.value as string).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: t("outreach_crm.col_actions"),
        width: 90,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<ProspectCompany>) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t("common.edit")}>
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("common.delete")}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenDelete(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [t, handleOpenEdit, handleOpenDelete],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t("outreach_crm.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("outreach_crm.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          {t("outreach_crm.add_prospect")}
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <UnifiedStatCard
            title={t("outreach_crm.stat_total")}
            icon={<TrackChangesIcon />}
            color="#1976d2"
            value={stats?.total}
            isLoading={statsLoading}
            variant="statistic"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <UnifiedStatCard
            title={t("outreach_crm.stat_contacted")}
            icon={<PeopleIcon />}
            color="#ed6c02"
            value={stats?.contacted}
            isLoading={statsLoading}
            variant="statistic"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <UnifiedStatCard
            title={t("outreach_crm.stat_demo")}
            icon={<CalendarTodayIcon />}
            color="#9c27b0"
            value={stats?.demoScheduled}
            isLoading={statsLoading}
            variant="statistic"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <UnifiedStatCard
            title={t("outreach_crm.stat_converted")}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
            value={stats?.converted}
            isLoading={statsLoading}
            variant="statistic"
          />
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder={t("outreach_crm.search_placeholder")}
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 220, flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t("outreach_crm.filter_status")}</InputLabel>
          <Select
            value={filterStatus}
            label={t("outreach_crm.filter_status")}
            onChange={(e) => {
              setFilterStatus(e.target.value as ProspectStatus | "");
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
          >
            <MenuItem value="">
              <em>{t("outreach_crm.all_statuses")}</em>
            </MenuItem>
            {PROSPECT_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {t(`outreach_crm.status_${s.toLowerCase()}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("outreach_crm.filter_source")}</InputLabel>
          <Select
            value={filterSource}
            label={t("outreach_crm.filter_source")}
            onChange={(e) => {
              setFilterSource(e.target.value as ProspectSource | "");
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
          >
            <MenuItem value="">
              <em>{t("outreach_crm.all_sources")}</em>
            </MenuItem>
            {PROSPECT_SOURCES.map((s) => (
              <MenuItem key={s} value={s}>
                {t(`outreach_crm.source_${s.toLowerCase()}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Box
        sx={{
          height: 520,
          width: "100%",
          "& .MuiDataGrid-root": { borderRadius: 2 },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.uid}
          rowCount={totalRows}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: t("outreach_crm.no_prospects"),
          }}
          sx={{
            "& .MuiDataGrid-cell": { alignItems: "center" },
            "& .MuiDataGrid-columnHeader": { bgcolor: "background.default" },
          }}
        />
      </Box>

      {/* Dialogs */}
      <ProspectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialData={editTarget}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </Box>
  );
};

export default OutreachCRMPage;
