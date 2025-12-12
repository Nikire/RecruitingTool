import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deletedRecordsService } from "../../services/deletedRecords.service";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  DeletedCandidate,
  DeletedJobPosition,
  DeletedApplication,
  DeletedInterview,
} from "../../types/deleted.types";

/**
 * Hook to fetch deleted candidates
 */
export const useDeletedCandidates = () => {
  return useQuery<DeletedCandidate[]>({
    queryKey: ["deleted", "candidates"],
    queryFn: deletedRecordsService.getDeletedCandidates,
  });
};

/**
 * Hook to restore a candidate
 */
export const useRestoreCandidate = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.restoreCandidate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success(t("deleted_records.restore_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.restore_error"));
    },
  });
};

/**
 * Hook to permanently delete a candidate
 */
export const usePurgeCandidate = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.purgeCandidate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "candidates"] });
      toast.success(t("deleted_records.purge_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.purge_error"));
    },
  });
};

/**
 * Hook to fetch deleted job positions
 */
export const useDeletedJobPositions = () => {
  return useQuery<DeletedJobPosition[]>({
    queryKey: ["deleted", "job-positions"],
    queryFn: deletedRecordsService.getDeletedJobPositions,
  });
};

/**
 * Hook to restore a job position
 */
export const useRestoreJobPosition = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.restoreJobPosition(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "job-positions"] });
      queryClient.invalidateQueries({ queryKey: ["jobPositions"] });
      toast.success(t("deleted_records.restore_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.restore_error"));
    },
  });
};

/**
 * Hook to permanently delete a job position
 */
export const usePurgeJobPosition = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.purgeJobPosition(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "job-positions"] });
      toast.success(t("deleted_records.purge_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.purge_error"));
    },
  });
};

/**
 * Hook to fetch deleted applications
 */
export const useDeletedApplications = () => {
  return useQuery<DeletedApplication[]>({
    queryKey: ["deleted", "applications"],
    queryFn: deletedRecordsService.getDeletedApplications,
  });
};

/**
 * Hook to restore an application
 */
export const useRestoreApplication = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.restoreApplication(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success(t("deleted_records.restore_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.restore_error"));
    },
  });
};

/**
 * Hook to permanently delete an application
 */
export const usePurgeApplication = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.purgeApplication(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "applications"] });
      toast.success(t("deleted_records.purge_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.purge_error"));
    },
  });
};

/**
 * Hook to fetch deleted interviews
 */
export const useDeletedInterviews = () => {
  return useQuery<DeletedInterview[]>({
    queryKey: ["deleted", "interviews"],
    queryFn: deletedRecordsService.getDeletedInterviews,
  });
};

/**
 * Hook to restore an interview
 */
export const useRestoreInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.restoreInterview(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "interviews"] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast.success(t("deleted_records.restore_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.restore_error"));
    },
  });
};

/**
 * Hook to permanently delete an interview
 */
export const usePurgeInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => deletedRecordsService.purgeInterview(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted", "interviews"] });
      toast.success(t("deleted_records.purge_success"));
    },
    onError: () => {
      toast.error(t("deleted_records.purge_error"));
    },
  });
};
