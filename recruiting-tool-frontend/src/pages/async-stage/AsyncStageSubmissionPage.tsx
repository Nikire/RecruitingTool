import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {
  usePublicAsyncStageInfo,
  useSubmitAsyncStage,
} from "../../hooks/api/useAsyncStage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDeadline = (isoString: string): string => {
  try {
    return format(parseISO(isoString), "MMM d, yyyy");
  } catch {
    return isoString;
  }
};

// ─── State: Loading ───────────────────────────────────────────────────────────

const LoadingState: React.FC = () => (
  <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
    <CircularProgress size={60} />
  </Container>
);

// ─── State: Invalid link ──────────────────────────────────────────────────────

const InvalidLinkState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 6, px: 4 }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {t("asyncStage.invalidLink")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("asyncStage.invalidLinkDesc")}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

// ─── State: Already submitted ─────────────────────────────────────────────────

const AlreadySubmittedState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 6, px: 4 }}>
          <CheckCircleIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {t("asyncStage.alreadySubmitted")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("asyncStage.alreadySubmittedDesc")}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

// ─── State: Success (after submit) ───────────────────────────────────────────

const SuccessState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 6, px: 4 }}>
          <CheckCircleIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {t("asyncStage.submittedSuccess")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("asyncStage.submittedSuccessDesc")}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AsyncStageSubmissionPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();

  const [textContent, setTextContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: stageInfo,
    isLoading,
    isError,
  } = usePublicAsyncStageInfo(token ?? "");

  const { mutate: submitStage, isPending: isSubmitting } =
    useSubmitAsyncStage();

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingState />;

  // ─── Error / invalid token ──────────────────────────────────────────────────
  if (isError || !stageInfo) return <InvalidLinkState />;

  // ─── Already submitted ──────────────────────────────────────────────────────
  if (stageInfo.alreadySubmitted) return <AlreadySubmittedState />;

  // ─── Post-submit success ────────────────────────────────────────────────────
  if (submitted) return <SuccessState />;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    // reset input so the same file can be re-added if removed
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!token) return;

    const formData = new FormData();
    if (textContent.trim()) {
      formData.append("textContent", textContent.trim());
    }
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    submitStage(
      { token, formData },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      },
    );
  };

  // ─── Pending (can submit) ────────────────────────────────────────────────────

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <AssignmentIcon sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {stageInfo.companyName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {stageInfo.jobTitle}
        </Typography>
      </Box>

      {/* Stage info card */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {stageInfo.stageTitle}
          </Typography>

          {stageInfo.stageDescription && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}
            >
              {stageInfo.stageDescription}
            </Typography>
          )}

          {stageInfo.expiresAt && (
            <Chip
              label={t("asyncStage.submitDeadline", {
                date: formatDeadline(stageInfo.expiresAt),
              })}
              color="warning"
              size="small"
              sx={{ mt: 0.5 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Submission form */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t("asyncStage.stageInstructions")}
          </Typography>

          {/* Text response */}
          <TextField
            label={t("asyncStage.textResponse")}
            multiline
            rows={6}
            fullWidth
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ mb: 2 }}
          >
            {t("asyncStage.attachFiles")}
          </Button>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                {t("asyncStage.selectedFiles")}
              </Typography>
              <List dense disablePadding>
                {selectedFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 0.5,
                      px: 1,
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label={t("asyncStage.removeFile")}
                        onClick={() => handleRemoveFile(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                      primaryTypographyProps={{
                        variant: "body2",
                        noWrap: true,
                        sx: { maxWidth: "calc(100% - 40px)" },
                      }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Submit button */}
          <Stack alignItems="flex-end">
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{ minWidth: 140 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress
                    size={18}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  {t("common.submitting")}
                </>
              ) : (
                t("common.submit")
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AsyncStageSubmissionPage;
