import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Button,
  Alert,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useUploadFile } from "../../hooks/api/useFiles";

interface FileUploadProps {
  candidateUid?: string;
  onUploadSuccess?: () => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  candidateUid,
  onUploadSuccess,
  maxSizeMB = 10,
  acceptedTypes = ["pdf", "doc", "docx", "txt"],
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate: uploadFile, isPending } = useUploadFile();

  const validateFile = useCallback(
    (file: File): boolean => {
      setValidationError(null);

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setValidationError(
          t("file_upload.error_too_large", { max: maxSizeMB }),
        );
        return false;
      }

      // Check file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !acceptedTypes.includes(fileExtension)) {
        setValidationError(
          t("file_upload.error_bad_type", { types: acceptedTypes.join(", ") }),
        );
        return false;
      }

      return true;
    },
    [maxSizeMB, acceptedTypes, t],
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    },
    [validateFile],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
    // Reset so re-picking the same file after a validation error still fires
    e.target.value = "";
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadFile(
      { file: selectedFile, candidateUid },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setValidationError(null);
          onUploadSuccess?.();
        },
      },
    );
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setValidationError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Box sx={{ width: "100%" }}>
      {!selectedFile ? (
        <Paper
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: dragActive ? "2px dashed #1976d2" : "2px dashed #ccc",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: dragActive
              ? "rgba(25, 118, 210, 0.08)"
              : "transparent",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              borderColor: "#1976d2",
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon
            sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            {t("file_upload.drop_here")}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("file_upload.or_browse")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {t("file_upload.accepted_types", {
              types: acceptedTypes.join(", "),
              max: maxSizeMB,
            })}
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.map((type) => `.${type}`).join(",")}
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
        </Paper>
      ) : (
        <Paper
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FileIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>
            {!isPending && (
              <IconButton size="small" onClick={handleClearFile}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {isPending && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {t("file_upload.uploading")}
              </Typography>
            </Box>
          )}

          {!isPending && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={handleClearFile} disabled={isPending}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isPending}
                startIcon={<CloudUploadIcon />}
              >
                {t("common.upload")}
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {validationError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {validationError}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
