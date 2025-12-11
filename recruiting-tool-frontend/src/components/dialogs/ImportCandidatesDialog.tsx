import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  AlertTitle,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {
  usePreviewCandidateImport,
  useImportCandidates,
  downloadCandidateImportTemplate,
} from "../../hooks/api/useCandidateImport";
import {
  CandidateImportPreview,
  CandidateImportResult,
} from "../../types/candidate-import.types";

interface ImportCandidatesDialogProps {
  open: boolean;
  onClose: () => void;
}

const ImportCandidatesDialog: React.FC<ImportCandidatesDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CandidateImportPreview | null>(null);
  const [importResult, setImportResult] =
    useState<CandidateImportResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const previewMutation = usePreviewCandidateImport();
  const importMutation = useImportCandidates();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(null);
      setImportResult(null);

      // Auto-preview the file
      try {
        const result = await previewMutation.mutateAsync(file);
        setPreview(result);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await importMutation.mutateAsync(selectedFile);
      setImportResult(result);

      // If all successful, close dialog after a short delay
      if (result.errorCount === 0) {
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDownloadTemplate = () => {
    downloadCandidateImportTemplate();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setImportResult(null);
    setShowErrors(false);
    onClose();
  };

  const isLoading = previewMutation.isPending || importMutation.isPending;
  const canImport = preview && preview.validCount > 0 && !importResult;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("candidate_import.title")}</DialogTitle>
      <DialogContent>
        {/* Download Template */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            fullWidth
          >
            {t("candidate_import.download_template")}
          </Button>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: "block" }}
          >
            {t("candidate_import.template_help")}
          </Typography>
        </Box>

        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv"
            style={{ display: "none" }}
            id="csv-file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <label htmlFor="csv-file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={isLoading}
              fullWidth
            >
              {selectedFile
                ? t("candidate_import.change_file")
                : t("candidate_import.select_file")}
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t("candidate_import.selected_file")}:{" "}
              <strong>{selectedFile.name}</strong>
            </Typography>
          )}
        </Box>

        {/* Loading State */}
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Preview Results */}
        {preview && !importResult && (
          <Box sx={{ mb: 2 }}>
            <Alert
              severity={preview.invalidCount > 0 ? "warning" : "success"}
              sx={{ mb: 2 }}
            >
              <AlertTitle>{t("candidate_import.preview_title")}</AlertTitle>
              <Typography variant="body2">
                {t("candidate_import.total_rows")}:{" "}
                <strong>{preview.totalRows}</strong>
              </Typography>
              <Typography variant="body2" color="success.main">
                {t("candidate_import.valid_rows")}:{" "}
                <strong>{preview.validCount}</strong>
              </Typography>
              {preview.invalidCount > 0 && (
                <Typography variant="body2" color="error.main">
                  {t("candidate_import.invalid_rows")}:{" "}
                  <strong>{preview.invalidCount}</strong>
                </Typography>
              )}
            </Alert>

            {/* Invalid Rows Table */}
            {preview.invalidRows.length > 0 && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setShowErrors(!showErrors)}
                    sx={{ mr: 1 }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: showErrors
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </IconButton>
                  <Typography variant="subtitle2" color="error">
                    {t("candidate_import.view_errors")}
                  </Typography>
                </Box>
                <Collapse in={showErrors}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {t("candidate_import.row_number")}
                        </TableCell>
                        <TableCell>{t("candidate_import.name")}</TableCell>
                        <TableCell>{t("candidate_import.email")}</TableCell>
                        <TableCell>{t("candidate_import.errors")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.invalidRows.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.name || "-"}</TableCell>
                          <TableCell>{error.email || "-"}</TableCell>
                          <TableCell>
                            {error.errors.map((err, i) => (
                              <Chip
                                key={i}
                                label={err}
                                size="small"
                                color="error"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Collapse>
              </Box>
            )}
          </Box>
        )}

        {/* Import Results */}
        {importResult && (
          <Box sx={{ mb: 2 }}>
            <Alert
              severity={importResult.errorCount > 0 ? "warning" : "success"}
            >
              <AlertTitle>
                {importResult.errorCount > 0
                  ? t("candidate_import.import_completed_with_errors")
                  : t("candidate_import.import_successful")}
              </AlertTitle>
              <Typography variant="body2">
                {t("candidate_import.imported_count")}:{" "}
                <strong>{importResult.successCount}</strong>
              </Typography>
              {importResult.errorCount > 0 && (
                <Typography variant="body2" color="error.main">
                  {t("candidate_import.failed_count")}:{" "}
                  <strong>{importResult.errorCount}</strong>
                </Typography>
              )}
            </Alert>

            {/* Import Errors */}
            {importResult.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  {t("candidate_import.import_errors")}:
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("candidate_import.row_number")}</TableCell>
                      <TableCell>{t("candidate_import.name")}</TableCell>
                      <TableCell>{t("candidate_import.email")}</TableCell>
                      <TableCell>{t("candidate_import.errors")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importResult.errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell>{error.name || "-"}</TableCell>
                        <TableCell>{error.email || "-"}</TableCell>
                        <TableCell>
                          {error.errors.map((err, i) => (
                            <Chip
                              key={i}
                              label={err}
                              size="small"
                              color="error"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {importResult ? t("common.close") : t("common.cancel")}
        </Button>
        {!importResult && (
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!canImport || isLoading}
            startIcon={isLoading ? undefined : <CheckCircleIcon />}
          >
            {isLoading
              ? t("candidate_import.importing")
              : t("candidate_import.import")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportCandidatesDialog;
