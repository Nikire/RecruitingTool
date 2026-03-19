export interface AIQuotaResponseDto {
  uid: string;
  companyUid: string;
  quotaType: string;
  limit: number;
  used: number;
  remaining: number;
  resetDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetAIQuotaLimitDto {
  quotaType: string;
  limit: number;
}
