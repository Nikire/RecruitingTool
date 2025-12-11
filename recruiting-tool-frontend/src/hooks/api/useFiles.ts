import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as filesApi from "../../api/files";
import toast from "react-hot-toast";

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
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to upload file";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to upload an image file
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: filesApi.uploadImage,
    onSuccess: (_data) => {
      toast.success("Image uploaded successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to upload image";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to download a file
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: ({ uid, filename }: { uid: string; filename: string }) =>
      filesApi.downloadFile(uid, filename),
    onSuccess: () => {
      toast.success("File downloaded successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to download file";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to delete a file
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: filesApi.deleteFile,
    onSuccess: () => {
      // Invalidate all file queries
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete file";
      toast.error(errorMessage);
    },
  });
}
