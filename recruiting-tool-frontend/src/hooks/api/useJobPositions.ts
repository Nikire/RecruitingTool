import { jobPositionKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  approveJobPosition,
  createJobPosition,
  deleteJobPosition,
  getJobModerationItem,
  getJobModerationQueue,
  getJobModerationStats,
  getJobPositions,
  getPublicJobPositions,
  getPublicJobPosition,
  listJobPositions,
  rejectJobPosition,
  updateJobPosition,
  PublicJobPositionFilters,
} from "../../api/jobPositions";
import {
  JobModerationQueueParams,
  JobPosition,
} from "../../types/jobPosition.types";
import { PaginationParams } from "../../types/pagination.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { ANALYTICS_EVENTS } from "../../analytics";
import { useActivationEvents } from "./useActivationEvents";

export function usePublicJobPositions(
  filters?: PublicJobPositionFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: jobPositionKeys.publicList(filters),
    queryFn: () => getPublicJobPositions(filters),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes - data is considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache retention time
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
  });
}

export function usePublicJobPosition(
  uid: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: jobPositionKeys.publicDetail(uid),
    queryFn: () => getPublicJobPosition(uid),
    enabled: options?.enabled !== false && !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes - individual jobs change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

export function useJobPositions(uid?: string) {
  return useQuery({
    queryKey: uid ? jobPositionKeys.detail(uid) : jobPositionKeys.all,
    queryFn: () => getJobPositions(uid),
  });
}

export function useListJobPositions(
  params: PaginationParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: jobPositionKeys.list(params),
    queryFn: () => listJobPositions(params),
    enabled: options?.enabled !== false,
  });
}

export function useCreateJobPosition() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { trackFirstTime } = useActivationEvents();

  return useMutation({
    mutationFn: (data: Partial<JobPosition>) => createJobPosition(data),
    onSuccess: (created) => {
      // Invalidate all job position queries including public career page
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      showSuccessToast(t("job_positions.created_success"));
      // Activation milestone. Mirrored server-side as JOB_POSITION_CREATED.
      trackFirstTime(ANALYTICS_EVENTS.FIRST_JOB_POSITION_CREATED, {
        jobPositionUid: created?.uid,
      });
    },
    onError: (error) => {
      showErrorToast(error, t("job_positions.create_error"));
    },
  });
}

export function useUpdateJobPosition() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<JobPosition> }) =>
      updateJobPosition(data, uid),
    onSuccess: () => {
      // Invalidate all job position queries including public career page
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      showSuccessToast(t("job_positions.updated_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("job_positions.update_error"));
    },
  });
}

export function useDeleteJobPosition() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deleteJobPosition(uid),
    onSuccess: () => {
      // Invalidate all job position queries including public career page
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      showSuccessToast(t("job_positions.deleted_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("job_positions.delete_error"));
    },
  });
}

// ─── Platform job posting moderation (SUPER_ADMIN only) ──────────────────────
//
// Query keys stay under the jobPositions root so a single
// `invalidateQueries({ queryKey: jobPositionKeys.all })` refreshes both the
// moderation queue and every job position list (HR list, detail, public board).

export function useJobModerationStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: jobPositionKeys.moderationStats(),
    queryFn: () => getJobModerationStats(),
    enabled: options?.enabled !== false,
  });
}

export function useJobModerationQueue(
  params?: JobModerationQueueParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: jobPositionKeys.moderationQueue(params),
    queryFn: () => getJobModerationQueue(params),
    enabled: options?.enabled !== false,
  });
}

export function useJobModerationItem(
  uid: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: jobPositionKeys.moderationDetail(uid),
    queryFn: () => getJobModerationItem(uid),
    enabled: options?.enabled !== false && !!uid,
  });
}

export function useApproveJobPosition() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, reason }: { uid: string; reason?: string }) =>
      approveJobPosition(uid, reason),
    onSuccess: () => {
      // Refreshes the moderation queue/stats AND every job position list,
      // since an approved posting becomes visible on the public careers board.
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      showSuccessToast(t("job_moderation.approved_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("job_moderation.approve_error"));
    },
  });
}

export function useRejectJobPosition() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, reason }: { uid: string; reason: string }) =>
      rejectJobPosition(uid, reason),
    onSuccess: () => {
      // Same invalidation as approve: a rejected posting must disappear from
      // the public board and show its reason on the company's own views.
      queryClient.invalidateQueries({ queryKey: jobPositionKeys.all });
      showSuccessToast(t("job_moderation.rejected_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("job_moderation.reject_error"));
    },
  });
}
