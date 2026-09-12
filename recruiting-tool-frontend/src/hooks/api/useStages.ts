import {
  hiringProcessKeys,
  jobPositionKeys,
  stageKeys,
  stageNoteKeys,
} from "../../api/queryKeys";
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
import i18n from "i18next";

export function useStage(uid: string) {
  return useQuery({
    queryKey: stageKeys.detail(uid),
    queryFn: () => getStage(uid),
    enabled: !!uid,
  });
}

export function useListStages(params: PaginationParams) {
  return useQuery({
    queryKey: stageKeys.list(params),
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
        queryKey: jobPositionKeys.all,
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: stageKeys.all });
      showSuccessToast(i18n.t("stages.toast.created"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stages.toast.create_failed"));
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
        queryKey: jobPositionKeys.all,
        refetchType: "all",
      });
      queryClient.invalidateQueries({ queryKey: stageKeys.all });
      showSuccessToast(i18n.t("stages.toast.bulk_created"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stages.toast.bulk_create_failed"));
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<Stage> }) =>
      updateStage(data, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      queryClient.invalidateQueries({ queryKey: stageKeys.all });
      showSuccessToast(i18n.t("stages.toast.updated"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stages.toast.update_failed"));
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stages: { uid: string; position: number }[]) =>
      reorderStages(stages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      queryClient.invalidateQueries({ queryKey: stageKeys.all });
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stages.toast.reorder_failed"));
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteStage(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      queryClient.invalidateQueries({ queryKey: stageKeys.all });
      showSuccessToast(i18n.t("stages.toast.deleted"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stages.toast.delete_failed"));
    },
  });
}

// Stage Notes Hooks
export function useStageNotes(stageUid: string) {
  return useQuery({
    queryKey: stageNoteKeys.byStage(stageUid),
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
        queryKey: stageNoteKeys.byStage(variables.stageUid),
      });
      showSuccessToast(i18n.t("stage_notes.toast.created"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stage_notes.toast.create_failed"));
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
        queryKey: stageNoteKeys.byStage(updatedNote.stageUid),
      });
      showSuccessToast(i18n.t("stage_notes.toast.updated"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stage_notes.toast.update_failed"));
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
        queryKey: stageNoteKeys.byStage(variables.stageUid),
      });
      showSuccessToast(i18n.t("stage_notes.toast.deleted"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("stage_notes.toast.delete_failed"));
    },
  });
}
