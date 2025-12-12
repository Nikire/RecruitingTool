import {
  Box,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUploadImage } from "../../hooks/api/useFiles";
import { showErrorToast } from "../../utils/toast";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

interface ProfilePictureUploadProps {
  currentPicture?: string;
  userName: string;
  onUploadSuccess: (fileUrl: string, fileUid: string) => void;
  onRemove?: () => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  userName,
  onUploadSuccess,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadImage, isPending } = useUploadImage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      showErrorToast(t("profile.invalid_image_type"));
      return;
    }

    // Validate file size (2MB max for profile pictures)
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      showErrorToast(t("profile.image_size_limit"));
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadImage(selectedFile, {
      onSuccess: (data) => {
        // Pass both download URL and file UID
        onUploadSuccess(data.downloadUrl || "", data.uid);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePicture = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onRemove) {
      onRemove();
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentPicture;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={displayUrl}
          alt={userName}
          sx={{
            width: 120,
            height: 120,
            fontSize: "3rem",
            border: selectedFile ? "3px solid" : "none",
            borderColor: "primary.main",
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        {isPending && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
            }}
          >
            <CircularProgress size={40} sx={{ color: "white" }} />
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {selectedFile ? (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleUpload}
              disabled={isPending}
              startIcon={<PhotoCameraIcon />}
            >
              {isPending ? t("profile.uploading") : t("profile.upload")}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoCameraIcon />}
            onClick={handleButtonClick}
            disabled={isPending}
          >
            {t("profile.change_picture")}
          </Button>
          {currentPicture && onRemove && (
            <IconButton
              size="small"
              color="error"
              onClick={handleRemovePicture}
              disabled={isPending}
              title={t("profile.remove_picture_tooltip")}
              aria-label={t("profile.remove_picture_tooltip")}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {t("profile.supported_formats")}
      </Typography>

      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("profile.remove_picture_title")}
        message={t("profile.remove_picture_message")}
        isDeleting={isPending}
      />
    </Box>
  );
};

export default ProfilePictureUpload;
