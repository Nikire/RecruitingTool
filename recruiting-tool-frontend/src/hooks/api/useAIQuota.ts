import { adminKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanyAIQuotas, setCompanyAIQuotaLimit } from "../../api/aiQuota";
import type {
  AIQuotaResponseDto,
  SetAIQuotaLimitDto,
} from "../../types/ai-quota.types";

/**
 * Hook to fetch AI quotas for a specific company
 */
export const useCompanyAIQuotas = (companyUid: string | null) => {
  return useQuery<AIQuotaResponseDto[]>({
    queryKey: adminKeys.aiQuota(companyUid),
    queryFn: () => getCompanyAIQuotas(companyUid!),
    enabled: !!companyUid,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to set the AI quota limit for a specific company
 */
export const useSetAIQuotaLimit = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AIQuotaResponseDto,
    Error,
    { companyUid: string; data: SetAIQuotaLimitDto }
  >({
    mutationFn: ({ companyUid, data }) =>
      setCompanyAIQuotaLimit(companyUid, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.aiQuota(variables.companyUid),
      });
    },
  });
};
