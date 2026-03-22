import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStage,
  createStage,
  bulkCreateStages,
  updateStage,
  deleteStage,
  listStages,
  getStageNotes,
  createStageNote,
  updateStageNote,
  deleteStageNote,
  reorderStages,
} from "../../api/stages";
import {
  Stage,
  CreateStageNoteDto,
  UpdateStageNoteDto,
} from "../../types/stage.types";
import { PaginationParams } from "../../types/pagination.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const STAGES_KEY = "stages";

export function useStage(uid: string) {
  return useQuery({
    queryKey: [STAGES_KEY, uid],
    queryFn: () => getStage(uid),
    enabled: !!uid,
  });
}

export function useListStages(params: PaginationParams) {
  return useQuery({
    queryKey: [STAGES_KEY, "list", params],
    queryFn: () => listStages(params),
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Stage>) => createStage(data),
    onSuccess: () => {
      // Invalidate all jobPositions queries (including those with specific uids)
      queryClient.invalidateQueries({
        queryKey: ["jobPositions"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY] });
      showSuccessToast("Stage created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create stage");
    },
  });
}

export function useBulkCreateStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Stage>[]) => bulkCreateStages(data),
    onSuccess: () => {
      // Invalidate all jobPositions queries (including those with specific uids)
      queryClient.invalidateQueries({
        queryKey: ["jobPositions"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY] });
      showSuccessToast("Stages created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create stages");
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<Stage> }) =>
      updateStage(data, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPositions"] });
      queryClient.invalidateQueries({ queryKey: ["hiringProcess"] });
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY] });
      showSuccessToast("Stage updated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update stage");
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stages: { uid: string; position: number }[]) =>
      reorderStages(stages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPositions"] });
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY] });
    },
    onError: (error) => {
      showErrorToast(error, "Failed to reorder stages");
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteStage(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPositions"] });
      queryClient.invalidateQueries({ queryKey: [STAGES_KEY] });
      showSuccessToast("Stage deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete stage");
    },
  });
}

// Stage Notes Hooks
const STAGE_NOTES_KEY = "stageNotes";

export function useStageNotes(stageUid: string) {
  return useQuery({
    queryKey: [STAGE_NOTES_KEY, stageUid],
    queryFn: () => getStageNotes(stageUid),
    enabled: !!stageUid,
  });
}

export function useCreateStageNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stageUid,
      data,
    }: {
      stageUid: string;
      data: CreateStageNoteDto;
    }) => createStageNote(stageUid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [STAGE_NOTES_KEY, variables.stageUid],
      });
      showSuccessToast("Note created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create note");
    },
  });
}

export function useUpdateStageNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteUid,
      data,
    }: {
      noteUid: string;
      data: UpdateStageNoteDto;
    }) => updateStageNote(noteUid, data),
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({
        queryKey: [STAGE_NOTES_KEY, updatedNote.stageUid],
      });
      showSuccessToast("Note updated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update note");
    },
  });
}

export function useDeleteStageNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteUid }: { noteUid: string; stageUid: string }) =>
      deleteStageNote(noteUid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [STAGE_NOTES_KEY, variables.stageUid],
      });
      showSuccessToast("Note deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete note");
    },
  });
}
