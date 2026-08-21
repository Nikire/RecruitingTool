import { candidateStageNoteKeys, hiringProcessKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCandidateStageNotes,
  upsertStageEvalNote,
  deleteStageEvalNote,
} from "../../api/stageNotes";
import { UpsertStageEvalNoteDto } from "../../types/stage.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export function useCandidateStageNotes(candidateUid: string | undefined) {
  return useQuery({
    queryKey: candidateStageNoteKeys.byCandidate(candidateUid),
    queryFn: () => getCandidateStageNotes(candidateUid!),
    enabled: !!candidateUid,
  });
}

export function useUpsertStageNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hiringProcessUid,
      stageUid,
      data,
    }: {
      hiringProcessUid: string;
      stageUid: string;
      data: UpsertStageEvalNoteDto;
    }) => upsertStageEvalNote(hiringProcessUid, stageUid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: hiringProcessKeys.detail(variables.hiringProcessUid),
      });
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      // The candidate-facing stage notes list lives under its own root and
      // used to be left stale, so a saved evaluation never appeared there.
      queryClient.invalidateQueries({ queryKey: candidateStageNoteKeys.all });
    },
    onError: (error) => {
      showErrorToast(error, "Failed to save note");
    },
  });
}

export function useDeleteStageEvalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hiringProcessUid,
      stageUid,
    }: {
      hiringProcessUid: string;
      stageUid: string;
    }) => deleteStageEvalNote(hiringProcessUid, stageUid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: hiringProcessKeys.detail(variables.hiringProcessUid),
      });
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      queryClient.invalidateQueries({ queryKey: candidateStageNoteKeys.all });
      showSuccessToast("Note deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete note");
    },
  });
}
