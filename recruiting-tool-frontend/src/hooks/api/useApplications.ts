import { applicationKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  getApplicationsGrouped,
  updateApplication,
  acceptApplication,
} from "../../api/applications";
import {
  ApplicationFilterDto,
  ApplicationGroupedFilterDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "../../types/application.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";

export function useApplications(filters?: ApplicationFilterDto) {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => getApplications(filters),
  });
}

export function useApplicationsGrouped(filters?: ApplicationGroupedFilterDto) {
  return useQuery({
    queryKey: applicationKeys.grouped(filters),
    queryFn: () => getApplicationsGrouped(filters),
  });
}

export function useApplication(uid: string) {
  return useQuery({
    queryKey: applicationKeys.detail(uid),
    queryFn: () => getApplication(uid),
    enabled: !!uid,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateApplicationDto) => createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      showSuccessToast(t("apply_job.submit_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("apply_job.submit_failed"));
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateApplicationDto }) =>
      updateApplication(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      showSuccessToast("Application updated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update application");
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteApplication(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      showSuccessToast("Application deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete application");
    },
  });
}

export function useAcceptApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => acceptApplication(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      showSuccessToast(
        "Application accepted! Candidate and hiring process created.",
      );
    },
    onError: (error) => {
      showErrorToast(error, "Failed to accept application");
    },
  });
}
