import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCandidateStageNotes,
  upsertStageEvalNote,
  deleteStageEvalNote,
} from "../../api/stageNotes";
import { UpsertStageEvalNoteDto } from "../../types/stage.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const HIRING_PROCESS_KEY = "hiringProcess";
const CANDIDATE_STAGE_NOTES_KEY = "candidateStageNotes";

export function useCandidateStageNotes(candidateUid: string | undefined) {
  return useQuery({
    queryKey: [CANDIDATE_STAGE_NOTES_KEY, candidateUid],
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
        queryKey: [HIRING_PROCESS_KEY, variables.hiringProcessUid],
      });
      queryClient.invalidateQueries({
        queryKey: [HIRING_PROCESS_KEY],
      });
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
        queryKey: [HIRING_PROCESS_KEY, variables.hiringProcessUid],
      });
      queryClient.invalidateQueries({
        queryKey: [HIRING_PROCESS_KEY],
      });
      showSuccessToast("Note deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete note");
    },
  });
}
