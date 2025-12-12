import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUpdateStageNote } from "../../hooks/api/useStages";
import { StageNote, UpdateStageNoteDto } from "../../types/stage.types";

interface EditStageNoteDialogProps {
  open: boolean;
  onClose: () => void;
  note: StageNote;
}

const EditStageNoteDialog: React.FC<EditStageNoteDialogProps> = ({
  open,
  onClose,
  note,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateStageNoteDto>({
    defaultValues: {
      content: note.content,
    },
  });

  const { mutate: updateNote, isPending, isError } = useUpdateStageNote();

  const onSubmit = (data: UpdateStageNoteDto) => {
    updateNote(
      { noteUid: note.uid, data },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("stage_notes.edit_note")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label={t("stage_notes.note_content")}
            placeholder={t("stage_notes.note_placeholder")}
            fullWidth
            multiline
            rows={6}
            margin="normal"
            {...register("content", {
              required: t("stage_notes.validation_required"),
              minLength: {
                value: 10,
                message: t("stage_notes.validation_min_length", { min: 10 }),
              },
              maxLength: {
                value: 2000,
                message: t("stage_notes.validation_max_length", { max: 2000 }),
              },
            })}
            error={!!errors.content}
            helperText={errors.content?.message}
          />

          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("errors.update_failed", { entity: "note" })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            {t("stage_notes.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? t("common.saving") : t("stage_notes.save_note")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditStageNoteDialog;
