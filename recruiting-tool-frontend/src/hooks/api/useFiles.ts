import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as filesApi from "../../api/files";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

/**
 * Hook to fetch files (optionally filter by candidate)
 */
export function useFiles(candidateUid?: string) {
  return useQuery({
    queryKey: candidateUid ? ["files", candidateUid] : ["files"],
    queryFn: () =>
      filesApi.getFiles(candidateUid ? { candidateUid } : undefined),
  });
}

/**
 * Hook to fetch a single file
 */
export function useFile(uid: string) {
  return useQuery({
    queryKey: ["files", uid],
    queryFn: () => filesApi.getFile(uid),
    enabled: !!uid,
  });
}

/**
 * Hook to upload a document file
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: filesApi.uploadFile,
    onSuccess: (data) => {
      // Invalidate all file queries
      queryClient.invalidateQueries({ queryKey: ["files"] });

      // If file is associated with a candidate, invalidate that specific query
      if (data.candidateUid) {
        queryClient.invalidateQueries({
          queryKey: ["files", data.candidateUid],
        });
      }

      toast.success(`File "${data.originalName}" uploaded successfully`);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to upload file";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to upload an image file
 */
export function useUploadImage() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: filesApi.uploadImage,
    onSuccess: () => {
      toast.success(t("files.image_uploaded"));
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to upload image";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to download a file
 */
export function useDownloadFile() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ uid, filename }: { uid: string; filename: string }) =>
      filesApi.downloadFile(uid, filename),
    onSuccess: () => {
      toast.success(t("files.file_downloaded"));
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to download file";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to delete a file
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: filesApi.deleteFile,
    onSuccess: () => {
      // Invalidate all file queries
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["company-files"] });
      queryClient.invalidateQueries({ queryKey: ["company-storage"] });
      toast.success(t("files.file_deleted"));
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete file";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to fetch all company files
 */
export function useCompanyFiles() {
  return useQuery({
    queryKey: ["company-files"],
    queryFn: filesApi.getCompanyFiles,
  });
}

/**
 * Hook to fetch company storage usage
 */
export function useCompanyStorageUsage() {
  return useQuery({
    queryKey: ["company-storage"],
    queryFn: filesApi.getCompanyStorageUsage,
  });
}

/**
 * Hook to download selected files as a ZIP
 */
export function useDownloadZip() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (uids: string[]) => filesApi.downloadZip(uids),
    onError: () => {
      toast.error(t("files.downloadError"));
    },
  });
}

/**
 * Hook to delete multiple files
 */
export function useDeleteManyFiles() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uids: string[]) => filesApi.deleteManyFiles(uids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["company-files"] });
      queryClient.invalidateQueries({ queryKey: ["company-storage"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success(t("files.deleteSuccess", { count: data.deleted }));
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete files";
      toast.error(errorMessage);
    },
  });
}
