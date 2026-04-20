import { useState, useMemo } from "react";
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
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PageHeader from "../../components/common/PageHeader";
import QuotaBanner from "../../components/common/QuotaBanner";
import {
  useCompanyFiles,
  useDownloadZip,
  useDeleteManyFiles,
  useDeleteFile,
} from "../../hooks/api/useFiles";
import { CompanyFile } from "../../api/files";

type FileTypeFilter = "all" | "document" | "image" | "other";

function getFileType(mimetype: string): "document" | "image" | "other" {
  if (
    mimetype === "application/pdf" ||
    mimetype === "application/msword" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "text/plain"
  ) {
    return "document";
  }
  if (mimetype.startsWith("image/")) {
    return "image";
  }
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const FilesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: files = [], isLoading: filesLoading } = useCompanyFiles();
  const downloadZip = useDownloadZip();
  const deleteManyFiles = useDeleteManyFiles();
  const deleteFile = useDeleteFile();

  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>("all");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const filteredFiles = useMemo(() => {
    if (typeFilter === "all") return files;
    return files.filter((f) => getFileType(f.mimetype) === typeFilter);
  }, [files, typeFilter]);

  const handleSelectionChange = (model: unknown) => {
    // In DataGrid v8, selection model is { type: string, ids: Set<GridRowId> }
    const m = model as { ids?: Set<string>; type?: string };
    if (m && m.ids) {
      setSelectedUids(Array.from(m.ids));
    } else if (Array.isArray(model)) {
      setSelectedUids(model as string[]);
    }
  };

  const handleTypeFilterChange = (e: SelectChangeEvent<FileTypeFilter>) => {
    setTypeFilter(e.target.value as FileTypeFilter);
  };

  const handleDownloadSelected = () => {
    if (selectedUids.length === 0) return;
    downloadZip.mutate(selectedUids);
  };

  const handleDeleteSelected = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteManyFiles.mutate(selectedUids, {
      onSuccess: () => {
        setSelectedUids([]);
        setConfirmDeleteOpen(false);
      },
    });
  };

  const handleDeleteSingle = (uid: string) => {
    deleteFile.mutate(uid, {
      onSuccess: () => {
        setSelectedUids((prev) => prev.filter((u) => u !== uid));
      },
    });
  };

  const columns: GridColDef<CompanyFile>[] = [
    {
      field: "originalName",
      headerName: t("files.fileName"),
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            "&:hover": { color: "primary.main", textDecoration: "underline" },
          }}
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_URL}/files/${params.row.uid}/view`,
              "_blank",
            )
          }
        >
          <AttachFileIcon fontSize="small" sx={{ flexShrink: 0 }} />
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "mimetype",
      headerName: t("files.type"),
      width: 130,
      renderCell: (params) => {
        const ftype = getFileType(params.value as string);
        const labelMap: Record<string, string> = {
          document: t("files.documents"),
          image: t("files.images"),
          other: t("files.other"),
        };
        const colorMap: Record<string, "primary" | "success" | "default"> = {
          document: "primary",
          image: "success",
          other: "default",
        };
        return (
          <Chip
            label={labelMap[ftype]}
            color={colorMap[ftype]}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "size",
      headerName: t("files.size"),
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{formatBytes(params.value)}</Typography>
      ),
    },
    {
      field: "candidateName",
      headerName: t("files.candidate"),
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        if (!params.row.candidateUid)
          return <Typography variant="body2">—</Typography>;
        return (
          <Box
            sx={{
              cursor: "pointer",
              color: "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() =>
              navigate(`/hr/candidates?uid=${params.row.candidateUid}`)
            }
          >
            <Typography variant="body2">{params.value || "—"}</Typography>
          </Box>
        );
      },
    },
    {
      field: "uploadedByName",
      headerName: t("files.uploadedBy"),
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || t("files.publicUpload")}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: t("files.date"),
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t("common.download")}>
            <IconButton
              size="small"
              onClick={() =>
                params.row.downloadUrl &&
                window.open(params.row.downloadUrl, "_blank")
              }
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("common.delete")}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteSingle(params.row.uid)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title={t("files.title")} translate={false} />

      <QuotaBanner
        resource="storage"
        labelKey="files.storageUsage"
        unit=" MB"
        precision={2}
      />

      {/* Toolbar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          {selectedUids.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("files.selectedCount", { count: selectedUids.length })}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>{t("files.filterByType")}</InputLabel>
            <Select
              value={typeFilter}
              label={t("files.filterByType")}
              onChange={handleTypeFilterChange}
            >
              <MenuItem value="all">{t("files.allTypes")}</MenuItem>
              <MenuItem value="document">{t("files.documents")}</MenuItem>
              <MenuItem value="image">{t("files.images")}</MenuItem>
              <MenuItem value="other">{t("files.other")}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={
              downloadZip.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <FileDownloadIcon />
              )
            }
            onClick={handleDownloadSelected}
            disabled={selectedUids.length === 0 || downloadZip.isPending}
          >
            {t("files.downloadSelected")}
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            disabled={selectedUids.length === 0 || deleteManyFiles.isPending}
          >
            {t("files.deleteSelected")}
          </Button>
        </Stack>
      </Stack>

      {/* DataGrid */}
      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={filteredFiles}
          columns={columns}
          getRowId={(row) => row.uid}
          loading={filesLoading}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={{ type: "include", ids: new Set(selectedUids) }}
          onRowSelectionModelChange={handleSelectionChange}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography color="text.secondary">
                  {t("files.noFiles")}
                </Typography>
              </Box>
            ),
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-cell--withRenderer": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </Box>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("files.confirmDeleteTitle", { count: selectedUids.length })}
        </DialogTitle>
        <DialogContent>
          <Typography>{t("files.confirmDeleteBody")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteManyFiles.isPending}
            startIcon={
              deleteManyFiles.isPending ? (
                <CircularProgress size={16} />
              ) : undefined
            }
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilesPage;
