import { useQuery } from "@tanstack/react-query";
import api from "./axios";

export interface UnsubscribeResult {
  success: boolean;
  message: string;
}

export function useConsumeUnsubscribeToken(token: string) {
  return useQuery<UnsubscribeResult>({
    queryKey: ["unsubscribe", token],
    queryFn: () =>
      api.get<UnsubscribeResult>(`/unsubscribe/${token}`).then((r) => r.data),
    retry: false,
    enabled: Boolean(token),
  });
}
