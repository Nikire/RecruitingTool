import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import {
  useCandidateNotes,
  useCreateCandidateNote,
  useUpdateCandidateNote,
  useDeleteCandidateNote,
} from "../../hooks/api/useCandidates";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { formatDateTime } from "../../utils/dateFormatters";
import type { CandidateNote } from "../../types/candidate";

interface CandidateNotesProps {
  candidateUid?: string;
}

/** Keeps the delete confirmation readable when a note runs long. */
const NOTE_PREVIEW_LENGTH = 80;

const CandidateNotes: React.FC<CandidateNotesProps> = ({ candidateUid }) => {
  const { t, i18n } = useTranslation();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteUid, setEditingNoteUid] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: notes, isLoading } = useCandidateNotes(candidateUid || "");
  const { mutate: createNote, isPending: isCreating } =
    useCreateCandidateNote();
  const { mutate: updateNote, isPending: isUpdating } =
    useUpdateCandidateNote();
  const deleteNoteMutation = useDeleteCandidateNote();
  const deleteConfirm = useConfirmDelete<CandidateNote>(deleteNoteMutation);

  if (!candidateUid) {
    return (
      <Typography color="text.secondary">
        {t("notes.save_candidate_first")}
      </Typography>
    );
  }

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) return;

    createNote(
      {
        content: newNoteContent,
        candidateUid,
      },
      {
        onSuccess: () => {
          setNewNoteContent("");
        },
      },
    );
  };

  const handleStartEdit = (noteUid: string, content: string) => {
    setEditingNoteUid(noteUid);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setEditingNoteUid(null);
    setEditContent("");
  };

  const handleUpdateNote = (noteUid: string) => {
    if (!editContent.trim()) return;

    updateNote(
      {
        noteUid,
        data: { content: editContent },
      },
      {
        onSuccess: () => {
          setEditingNoteUid(null);
          setEditContent("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const noteToDelete = deleteConfirm.selectedItem?.content ?? "";
  const noteToDeletePreview =
    noteToDelete.length > NOTE_PREVIEW_LENGTH
      ? `${noteToDelete.slice(0, NOTE_PREVIEW_LENGTH)}...`
      : noteToDelete;

  return (
    <Box>
      {/* Add Note Form */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          {t("notes.add_new_note")}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder={t("notes.enter_note_placeholder")}
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleCreateNote}
          disabled={!newNoteContent.trim() || isCreating}
        >
          {isCreating ? t("notes.adding") : t("notes.add_note")}
        </Button>
      </Box>

      {/* Notes List */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {t("notes.notes_count", { count: notes?.length || 0 })}
        </Typography>

        {notes && notes.length > 0 ? (
          <Stack spacing={2}>
            {notes.map((note) => (
              <Card key={note.uid} variant="outlined">
                <CardContent>
                  {editingNoteUid === note.uid ? (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleUpdateNote(note.uid)}
                          disabled={!editContent.trim() || isUpdating}
                        >
                          {isUpdating ? t("common.saving") : t("common.save")}
                        </Button>
                        <Button
                          size="small"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          {t("common.cancel")}
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {note.content}
                        </Typography>
                        <Box sx={{ display: "flex", flexShrink: 0 }}>
                          <Tooltip title={t("common.edit")}>
                            <IconButton
                              size="small"
                              aria-label={t("common.edit")}
                              onClick={() =>
                                handleStartEdit(note.uid, note.content)
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("common.delete")}>
                            <span>
                              <IconButton
                                size="small"
                                aria-label={t("common.delete")}
                                onClick={() =>
                                  deleteConfirm.confirmDelete(note)
                                }
                                disabled={deleteConfirm.isDeleting}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          {t("notes.by_author_date", {
                            author: note.authorName,
                            date: formatDateTime(note.createdAt, i18n.language),
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            {t("notes.no_notes_yet")}
          </Typography>
        )}
      </Box>

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onClose={deleteConfirm.handleCancel}
        onConfirm={deleteConfirm.handleConfirm}
        title={t("notes.delete_title")}
        message={t("notes.delete_confirmation")}
        itemName={noteToDeletePreview}
        isDeleting={deleteConfirm.isDeleting}
      />
    </Box>
  );
};

export default CandidateNotes;
