import { authKeys, userKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../api/users";
import { CreateUserDto, UpdateUserDto } from "../../types/user.types";
import { PaginationParams } from "../../types/pagination.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import i18n from "i18next";

export const useListUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => usersApi.getAll(),
  });
};

export const useUser = (uid: string) => {
  return useQuery({
    queryKey: userKeys.detail(uid),
    queryFn: () => usersApi.getOne(uid),
    enabled: !!uid,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccessToast("User created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateUserDto }) =>
      usersApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Also invalidate the auth/me query to refresh the current user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      showSuccessToast(i18n.t("users.toast.updated"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("users.toast.update_failed"));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => usersApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccessToast("User deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete user");
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => usersApi.deactivate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccessToast("User deactivated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to deactivate user");
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => usersApi.reactivate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccessToast("User reactivated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to reactivate user");
    },
  });
};

export const useUserActivity = (uid: string) => {
  return useQuery({
    queryKey: userKeys.activity(uid),
    queryFn: () => usersApi.getActivity(uid),
    enabled: !!uid,
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => usersApi.uploadResume(file),
    onSuccess: () => {
      // Invalidate auth/me query to refresh user data with resume info
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      showSuccessToast(i18n.t("users.toast.resume_uploaded"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("users.toast.resume_upload_failed"));
    },
  });
};

export const useGetResumeDownloadUrl = () => {
  return useQuery({
    queryKey: userKeys.resumeDownload(),
    queryFn: () => usersApi.getResumeDownloadUrl(),
    enabled: false, // Manual fetch
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deleteResume(),
    onSuccess: () => {
      // Invalidate auth/me query to refresh user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      showSuccessToast("Resume deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete resume");
    },
  });
};
