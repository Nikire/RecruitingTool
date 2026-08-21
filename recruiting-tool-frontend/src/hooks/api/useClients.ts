import { clientKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { clientsApi, ClientListParams } from "../../api/clients";
import { CreateClientDto, UpdateClientDto } from "../../types/client.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

/**
 * Every client of the current company, for pickers and filter dropdowns.
 *
 * Cached generously: an agency's account list changes far less often than its roles, and
 * this hook is mounted on both the job positions and hiring processes list pages.
 */
export const useClients = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: clientKeys.allRecords(),
    queryFn: () => clientsApi.getAll(),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useListClients = (params: ClientListParams) => {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.list(params),
  });
};

export const useClient = (uid: string) => {
  return useQuery({
    queryKey: clientKeys.detail(uid),
    queryFn: () => clientsApi.getOne(uid),
    enabled: !!uid,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      showSuccessToast(t("clients.created_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("clients.create_error"));
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateClientDto }) =>
      clientsApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      showSuccessToast(t("clients.updated_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("clients.update_error"));
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => clientsApi.remove(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      showSuccessToast(t("clients.deleted_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("clients.delete_error"));
    },
  });
};
