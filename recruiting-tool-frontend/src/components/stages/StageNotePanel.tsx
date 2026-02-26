import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Rating,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import {
  useUpsertStageNote,
  useDeleteStageEvalNote,
} from "../../hooks/api/useStageNotes";
import { StageEvalNote } from "../../types/stage.types";

const MAX_CHARS = 1000;

interface StageNotePanelProps {
  hiringProcessUid: string;
  stageUid: string;
  existingNote?: StageEvalNote | null;
  onClose?: () => void;
}

const StageNotePanel: React.FC<StageNotePanelProps> = ({
  hiringProcessUid,
  stageUid,
  existingNote,
  onClose,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(existingNote?.content ?? "");
  const [rating, setRating] = useState<number | null>(
    existingNote?.rating ?? null,
  );
  const [savedBriefly, setSavedBriefly] = useState(false);

  const { mutate: upsertNote, isPending: isSaving } = useUpsertStageNote();
  const { mutate: deleteNote, isPending: isDeleting } =
    useDeleteStageEvalNote();

  // Sync form when the note from the server changes (e.g. after query refetch).
  useEffect(() => {
    setContent(existingNote?.content ?? "");
    setRating(existingNote?.rating ?? null);
  }, [existingNote?.uid, existingNote?.content, existingNote?.rating]);

  const handleSave = () => {
    if (!content.trim()) return;

    upsertNote(
      {
        hiringProcessUid,
        stageUid,
        data: { content: content.trim(), rating: rating ?? 0 },
      },
      {
        onSuccess: () => {
          setSavedBriefly(true);
          setTimeout(() => {
            setSavedBriefly(false);
            onClose?.();
          }, 1000);
        },
      },
    );
  };

  const handleClear = () => {
    if (existingNote) {
      deleteNote(
        { hiringProcessUid, stageUid },
        {
          onSuccess: () => {
            setContent("");
            setRating(null);
            onClose?.();
          },
        },
      );
    } else {
      setContent("");
      setRating(null);
    }
  };

  const isLoading = isSaving || isDeleting;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Text area */}
      <TextField
        multiline
        rows={4}
        fullWidth
        value={content}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setContent(e.target.value);
          }
        }}
        placeholder={t("stage_note.note_placeholder")}
        disabled={isLoading}
        size="small"
        inputProps={{ maxLength: MAX_CHARS }}
      />

      {/* Char count */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ alignSelf: "flex-end", mt: -1 }}
      >
        {t("stage_note.char_count", { count: content.length })}
      </Typography>

      {/* Rating */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t("stage_note.rating_label")}:
        </Typography>
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue)}
          precision={1}
          disabled={isLoading}
          size="small"
        />
        {rating === null && (
          <Typography variant="caption" color="text.disabled">
            {t("stage_note.no_rating")}
          </Typography>
        )}
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={
            isDeleting ? <CircularProgress size={14} /> : <DeleteOutlineIcon />
          }
          onClick={handleClear}
          disabled={isLoading}
        >
          {t("stage_note.clear")}
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={
            savedBriefly ? (
              <CheckCircleIcon />
            ) : isSaving ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSave}
          disabled={isLoading || !content.trim()}
          color={savedBriefly ? "success" : "primary"}
        >
          {savedBriefly
            ? t("stage_note.saved")
            : isSaving
              ? t("stage_note.saving")
              : t("stage_note.save")}
        </Button>
      </Box>
    </Box>
  );
};

export default StageNotePanel;
