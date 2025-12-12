import React, { useState, useCallback } from "react";
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
        setValidationError(`File size must be less than ${maxSizeMB}MB`);
        return false;
      }

      // Check file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !acceptedTypes.includes(fileExtension)) {
        setValidationError(
          `File type must be one of: ${acceptedTypes.join(", ")}`,
        );
        return false;
      }

      return true;
    },
    [maxSizeMB, acceptedTypes],
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
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <CloudUploadIcon
            sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Drag and drop a file here
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or click to browse
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Accepted types: {acceptedTypes.join(", ")} (max {maxSizeMB}MB)
          </Typography>
          <input
            id="file-input"
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
                Uploading...
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
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isPending}
                startIcon={<CloudUploadIcon />}
              >
                Upload
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
