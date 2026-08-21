import { apiKeyKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiKeysApi,
  CreateApiKeyDto,
  UpdateApiKeyDto,
} from "../../api/apiKeys";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";

export const useApiKeys = () => {
  return useQuery({
    queryKey: apiKeyKeys.all,
    queryFn: () => apiKeysApi.list(),
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateApiKeyDto) => apiKeysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
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
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
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
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
      showSuccessToast(t("apiKeys.messages.revoked"));
    },
    onError: (error) => {
      showErrorToast(error, t("apiKeys.messages.revokeError"));
    },
  });
};
