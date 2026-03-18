import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { StageEvalNote } from "../../types/stage.types";
import StageNotePanel from "./StageNotePanel";

interface StageNoteButtonProps {
  hiringProcessUid: string;
  stageUid: string;
  stageTitle?: string;
  existingNote?: StageEvalNote | null;
}

const StageNoteButton: React.FC<StageNoteButtonProps> = ({
  hiringProcessUid,
  stageUid,
  stageTitle,
  existingNote,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const hasNote = !!existingNote;
  const tooltipTitle = hasNote
    ? t("stage_note.edit_note")
    : t("stage_note.add_note");

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      {/* Trigger button */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {hasNote && existingNote.rating > 0 && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ fontWeight: 600, lineHeight: 1 }}
          >
            {"★ " + existingNote.rating}
          </Typography>
        )}
        <Tooltip title={tooltipTitle}>
          <IconButton
            size="small"
            onClick={handleOpen}
            color={hasNote ? "primary" : "default"}
            aria-label={tooltipTitle}
          >
            <EditNoteIcon
              fontSize="small"
              sx={{ opacity: hasNote ? 1 : 0.5 }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Notes Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {t("stage_note.dialog_title")}
              </Typography>
              {stageTitle && (
                <Typography variant="body2" color="text.secondary">
                  {stageTitle}
                </Typography>
              )}
            </Box>
            <IconButton size="small" onClick={handleClose} sx={{ mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 2 }}>
          <StageNotePanel
            hiringProcessUid={hiringProcessUid}
            stageUid={stageUid}
            existingNote={existingNote}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StageNoteButton;
