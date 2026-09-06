import { hiringProcessKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  HiringProcess,
  CreateHiringProcessDto,
} from "../../types/hiringProcess.types";
import {
  createHiringProcess,
  deleteHiringProcess,
  getHiringProcesses,
  listHiringProcesses,
  listHiringProcessesGrouped,
  updateHiringProcess,
  progressStage,
  moveToStage,
} from "../../api/hiringProcess";
import { PaginationParams } from "../../types/pagination.types";
import { HiringProcessGroupedFilterDto } from "../../types/hiringProcess.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";
import { ANALYTICS_EVENTS } from "../../analytics";
import { useActivationEvents } from "./useActivationEvents";

export function useHiringProcesses(uid?: string) {
  return useQuery({
    queryKey: uid ? hiringProcessKeys.detail(uid) : hiringProcessKeys.all,
    queryFn: () => getHiringProcesses(uid),
  });
}

export function useListHiringProcesses(
  params: PaginationParams & { status?: string },
) {
  return useQuery({
    queryKey: hiringProcessKeys.list(params),
    queryFn: () => listHiringProcesses(params),
  });
}

export function useListHiringProcessesGrouped(
  params: HiringProcessGroupedFilterDto,
) {
  return useQuery({
    queryKey: hiringProcessKeys.listGrouped(params),
    queryFn: () => listHiringProcessesGrouped(params),
  });
}

export function useCreateHiringProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHiringProcessDto) => createHiringProcess(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      showSuccessToast("Hiring process created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create hiring process");
    },
  });
}

/**
 * @param options.showToast Set to `false` when the call site renders its own,
 * more specific feedback. React Query fires hook-level and `mutate`-level
 * callbacks both, so without this a caller with its own toast would stack two
 * notifications for a single update.
 */
export function useUpdateHiringProcess(options?: { showToast?: boolean }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: ({
      uid,
      data,
    }: {
      uid: string;
      data: Partial<HiringProcess>;
    }) => updateHiringProcess(data, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      if (showToast) {
        showSuccessToast(t("hiring_processes.updated_success"));
      }
    },
    onError: (error) => {
      if (showToast) {
        showErrorToast(error, t("hiring_processes.update_error"));
      }
    },
  });
}

export function useDeleteHiringProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteHiringProcess(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      showSuccessToast("Hiring process deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete hiring process");
    },
  });
}

export function useProgressStage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { trackFirstTime } = useActivationEvents();

  return useMutation({
    mutationFn: (uid: string) => progressStage(uid),
    onSuccess: (_data, uid) => {
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      showSuccessToast(t("hiring_processes.stage_progressed_success"));
      // Activation milestone. Mirrored server-side as APPLICATION_STAGE_ADVANCED.
      trackFirstTime(ANALYTICS_EVENTS.FIRST_APPLICATION_ADVANCED, {
        hiringProcessUid: uid,
        mode: "NEXT",
      });
    },
    onError: (error) => {
      showErrorToast(error, t("hiring_processes.stage_progress_error"));
    },
  });
}

export function useMoveToStage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { trackFirstTime } = useActivationEvents();

  return useMutation({
    mutationFn: ({ uid, stageUid }: { uid: string; stageUid: string }) =>
      moveToStage(uid, stageUid),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: hiringProcessKeys.all });
      showSuccessToast(t("hiring_processes.moved_to_stage_success"));
      // Activation milestone. Mirrored server-side as APPLICATION_STAGE_ADVANCED.
      trackFirstTime(ANALYTICS_EVENTS.FIRST_APPLICATION_ADVANCED, {
        hiringProcessUid: variables.uid,
        targetStageUid: variables.stageUid,
        mode: "SPECIFIC",
      });
    },
    onError: (error) => {
      showErrorToast(error, t("hiring_processes.move_to_stage_error"));
    },
  });
}
