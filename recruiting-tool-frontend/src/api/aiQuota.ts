import api from "./axios";
import type {
  AIQuotaResponseDto,
  SetAIQuotaLimitDto,
} from "../types/ai-quota.types";

/**
 * Fetch AI quotas for a specific company (SUPER_ADMIN only)
 */
export const getCompanyAIQuotas = async (
  companyUid: string,
): Promise<AIQuotaResponseDto[]> => {
  const response = await api.get<AIQuotaResponseDto[]>(
    `/ai-quota/${companyUid}`,
  );
  return response.data;
};

/**
 * Set the AI quota limit for a specific company and quota type (SUPER_ADMIN only)
 */
export const setCompanyAIQuotaLimit = async (
  companyUid: string,
  data: SetAIQuotaLimitDto,
): Promise<AIQuotaResponseDto> => {
  const response = await api.put<AIQuotaResponseDto>(
    `/ai-quota/${companyUid}`,
    data,
  );
  return response.data;
};
