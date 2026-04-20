import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  ContentCopy as CopyIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {
  useAsyncStageStatus,
  useAsyncSubmission,
  useReviewSubmission,
  useRevokeAsyncToken,
} from "../../hooks/api/useAsyncStage";

interface AsyncSubmissionPanelProps {
  stageUid: string;
  hiringProcessUid: string;
  candidateName: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const AsyncSubmissionPanel: React.FC<AsyncSubmissionPanelProps> = ({
  stageUid,
  hiringProcessUid,
}) => {
  const { t } = useTranslation();
  const [hrNote, setHrNote] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const {
    data: statusData,
    isLoading: statusLoading,
    isError: statusError,
  } = useAsyncStageStatus(stageUid, hiringProcessUid);

  const submissionUid = statusData?.submission?.uid;

  const { data: submission, isLoading: submissionLoading } =
    useAsyncSubmission(submissionUid);

  const { mutate: reviewSubmission, isPending: isReviewing } =
    useReviewSubmission();
  const { mutate: revokeToken, isPending: isRevoking } = useRevokeAsyncToken();

  // Sync hrNote from loaded submission (only once when submission loads)
  React.useEffect(() => {
    if (submission?.hrNote) {
      setHrNote(submission.hrNote);
    }
  }, [submission?.hrNote]);

  if (statusLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (statusError) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        {t("errors.fetch_failed")}
      </Alert>
    );
  }

  const token = statusData?.token ?? null;
  const submissionSummary = statusData?.submission ?? null;

  const hasActiveToken =
    !!token && !token.revokedAt && !token.usedAt && !submissionSummary;
  const hasSubmission = !!submissionSummary;
  const isReviewed = !!submissionSummary?.reviewedAt;

  // --- State 1: No token and no submission ---
  if (!token && !hasSubmission) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 1,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("asyncStage.noLinkSent")}
        </Typography>
      </Box>
    );
  }

  // --- State 2: Token sent, no submission yet ---
  if (hasActiveToken && !hasSubmission) {
    const submissionUrl = token?.submissionUrl ?? "";
    const deadline = token?.expiresAt;

    const handleCopyUrl = () => {
      navigator.clipboard.writeText(submissionUrl).then(() => {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      });
    };

    const handleRevoke = () => {
      if (!token) return;
      if (!confirmRevoke) {
        setConfirmRevoke(true);
        return;
      }
      revokeToken(
        {
          tokenUid: token.uid,
          stageUid,
          hiringProcessUid,
        },
        {
          onSuccess: () => setConfirmRevoke(false),
          onError: () => setConfirmRevoke(false),
        },
      );
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={t("asyncStage.awaitingSubmission")}
            color="warning"
            size="small"
          />
        </Box>

        {deadline && (
          <Typography variant="caption" color="text.secondary">
            {t("asyncStage.deadlineLabel")}:{" "}
            {new Date(deadline).toLocaleString()}
          </Typography>
        )}

        {submissionUrl && (
          <TextField
            label={t("asyncStage.submissionUrl")}
            value={submissionUrl}
            size="small"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        copiedUrl
                          ? t("asyncStage.linkCopied")
                          : t("asyncStage.copyLink")
                      }
                    >
                      <IconButton onClick={handleCopyUrl} size="small">
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        <Box>
          {confirmRevoke ? (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography variant="caption" color="error">
                {t("asyncStage.confirmRevoke")}
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleRevoke}
                disabled={isRevoking}
              >
                {isRevoking ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  t("asyncStage.revokeLink")
                )}
              </Button>
              <Button
                size="small"
                onClick={() => setConfirmRevoke(false)}
                disabled={isRevoking}
              >
                {t("common.cancel")}
              </Button>
            </Box>
          ) : (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {t("asyncStage.revokeLink")}
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // --- States 3 & 4: Submission exists ---
  if (hasSubmission) {
    if (submissionLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    const handleMarkReviewed = () => {
      if (!submissionUid) return;
      reviewSubmission({
        submissionUid,
        dto: { hrNote: hrNote || undefined },
      });
    };

    const displaySubmission = submission ?? submissionSummary;
    const files = submission?.files ?? [];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {/* Status chip */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isReviewed ? (
            <Chip
              label={t("asyncStage.reviewed")}
              color="success"
              size="small"
            />
          ) : (
            <Chip
              label={t("asyncStage.submissionReceived")}
              color="warning"
              size="small"
            />
          )}
        </Box>

        {/* Submitted at */}
        {displaySubmission?.submittedAt && (
          <Typography variant="caption" color="text.secondary">
            {t("asyncStage.submittedAt")}:{" "}
            {new Date(displaySubmission.submittedAt).toLocaleString()}
          </Typography>
        )}

        <Divider />

        {/* Text content */}
        {displaySubmission?.textContent && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("asyncStage.textContent")}
            </Typography>
            <Box
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "inherit",
                fontSize: "0.875rem",
                backgroundColor: "action.hover",
                borderRadius: 1,
                p: 2,
                m: 0,
              }}
            >
              {displaySubmission.textContent}
            </Box>
          </Box>
        )}

        {/* Files */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("asyncStage.files")}
          </Typography>
          {files.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("asyncStage.noFilesSubmitted")}
            </Typography>
          ) : (
            <List dense disablePadding>
              {files.map((file) => (
                <ListItem
                  key={file.uid}
                  disableGutters
                  secondaryAction={
                    <Tooltip title={t("asyncStage.downloadFile")}>
                      <IconButton
                        size="small"
                        onClick={() => window.open(file.downloadUrl, "_blank")}
                        aria-label={t("asyncStage.downloadFile")}
                      >
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AttachFileIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.originalName}
                    secondary={formatBytes(file.size)}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider />

        {/* HR Note */}
        {isReviewed ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("asyncStage.hrNote")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {displaySubmission?.hrNote || "-"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              label={t("asyncStage.hrNote")}
              multiline
              minRows={2}
              maxRows={5}
              value={hrNote}
              onChange={(e) => setHrNote(e.target.value)}
              fullWidth
              size="small"
              placeholder={t("asyncStage.hrNotePlaceholder")}
            />
            <Box>
              <Button
                variant="contained"
                size="small"
                onClick={handleMarkReviewed}
                disabled={isReviewing}
                startIcon={
                  isReviewing ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : undefined
                }
              >
                {t("asyncStage.markAsReviewed")}
              </Button>
            </Box>
          </Box>
        )}

        {/* Reviewed by info */}
        {isReviewed && submissionSummary?.reviewedByName && (
          <Typography variant="caption" color="text.secondary">
            {t("asyncStage.reviewedBy", {
              name: submissionSummary.reviewedByName,
              date: submissionSummary.reviewedAt
                ? new Date(submissionSummary.reviewedAt).toLocaleString()
                : "",
            })}
          </Typography>
        )}
      </Box>
    );
  }

  // Fallback — revoked token with no submission
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {t("asyncStage.noLinkSent")}
      </Typography>
    </Box>
  );
};

export default AsyncSubmissionPanel;
