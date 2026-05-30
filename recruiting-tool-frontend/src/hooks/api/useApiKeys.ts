import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiKeysApi,
  CreateApiKeyDto,
  UpdateApiKeyDto,
} from "../../api/apiKeys";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";

const API_KEYS_QUERY_KEY = "api-keys";

export const useApiKeys = () => {
  return useQuery({
    queryKey: [API_KEYS_QUERY_KEY],
    queryFn: () => apiKeysApi.list(),
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateApiKeyDto) => apiKeysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS_QUERY_KEY] });
      showSuccessToast(t("apiKeys.messages.created"));
    },
    onError: (error) => {
      showErrorToast(error, t("apiKeys.messages.createError"));
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateApiKeyDto }) =>
      apiKeysApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS_QUERY_KEY] });
      showSuccessToast(t("apiKeys.messages.updated"));
    },
    onError: (error) => {
      showErrorToast(error, t("apiKeys.messages.updateError"));
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => apiKeysApi.revoke(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS_QUERY_KEY] });
      showSuccessToast(t("apiKeys.messages.revoked"));
    },
    onError: (error) => {
      showErrorToast(error, t("apiKeys.messages.revokeError"));
    },
  });
};
