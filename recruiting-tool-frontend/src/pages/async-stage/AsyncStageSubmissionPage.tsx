import React, { useEffect, useRef, useState } from "react";
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

// ─── Accessibility helpers ────────────────────────────────────────────────────

/** Hides content visually while keeping it available to screen readers. */
const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/**
 * Moves keyboard focus onto the heading of a terminal state as soon as it
 * replaces the form, so screen-reader and keyboard users are told what happened
 * instead of being left on a control that no longer exists.
 */
const useFocusOnMount = () => {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
};

const outcomeHeadingSx = {
  "&:focus-visible": {
    outline: "3px solid",
    outlineColor: "primary.main",
    outlineOffset: "2px",
  },
};

// ─── State: Loading ───────────────────────────────────────────────────────────

const LoadingState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 10, textAlign: "center" }}
      role="status"
      aria-live="polite"
    >
      <CircularProgress size={60} aria-label={t("common.loading")} />
    </Container>
  );
};

// ─── State: Invalid link ──────────────────────────────────────────────────────

const InvalidLinkState: React.FC = () => {
  const { t } = useTranslation();
  const headingRef = useFocusOnMount();
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 6, px: 4 }} role="alert">
          <ErrorOutlineIcon
            aria-hidden="true"
            sx={{ fontSize: 80, color: "error.main", mb: 2 }}
          />
          <Typography
            ref={headingRef}
            tabIndex={-1}
            component="h1"
            variant="h5"
            fontWeight={700}
            gutterBottom
            sx={outcomeHeadingSx}
          >
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
  const headingRef = useFocusOnMount();
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 6, px: 4 }} role="status">
          <CheckCircleIcon
            aria-hidden="true"
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography
            ref={headingRef}
            tabIndex={-1}
            component="h1"
            variant="h5"
            fontWeight={700}
            gutterBottom
            sx={outcomeHeadingSx}
          >
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
  const headingRef = useFocusOnMount();
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 6, px: 4 }} role="status">
          <CheckCircleIcon
            aria-hidden="true"
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography
            ref={headingRef}
            tabIndex={-1}
            component="h1"
            variant="h5"
            fontWeight={700}
            gutterBottom
            sx={outcomeHeadingSx}
          >
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
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

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
    const oversized = Array.from(files).filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setFileSizeError(
        t("asyncStage.fileTooLarge", { name: oversized[0].name }),
      );
    } else {
      setFileSizeError(null);
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
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
        <AssignmentIcon
          aria-hidden="true"
          sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }}
        />
        <Typography component="h1" variant="h5" fontWeight={700} gutterBottom>
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
          <Typography
            component="h2"
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            {t("asyncStage.stageInstructions")}
          </Typography>

          {/* Text response */}
          <TextField
            id="async-stage-text-response"
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
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Button
            variant="outlined"
            startIcon={<AttachFileIcon aria-hidden="true" />}
            onClick={() => fileInputRef.current?.click()}
            aria-describedby="async-stage-file-hint"
            sx={{ mb: 0.5 }}
          >
            {t("asyncStage.attachFiles")}
          </Button>

          <Typography
            id="async-stage-file-hint"
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: fileSizeError ? 1 : 2 }}
          >
            {t("asyncStage.fileSizeLimit")}
          </Typography>

          {fileSizeError && (
            <Box
              role="alert"
              sx={{
                mb: 2,
                px: 1.5,
                py: 1,
                bgcolor: "error.light",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="error.contrastText">
                {fileSizeError}
              </Typography>
            </Box>
          )}

          {/* Announces attachments being added or removed */}
          <Box aria-live="polite" sx={srOnly}>
            {t("asyncStage.attachedFilesCount", {
              total: selectedFiles.length,
            })}
          </Box>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                id="async-stage-selected-files"
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                {t("asyncStage.selectedFiles")}
              </Typography>
              <List
                dense
                disablePadding
                aria-labelledby="async-stage-selected-files"
              >
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
                        aria-label={t("asyncStage.removeFileNamed", {
                          name: file.name,
                        })}
                        onClick={() => handleRemoveFile(index)}
                      >
                        <CloseIcon fontSize="small" aria-hidden="true" />
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
              aria-busy={isSubmitting}
              sx={{ minWidth: 140 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress
                    size={18}
                    aria-hidden="true"
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
