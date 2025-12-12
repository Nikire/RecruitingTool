import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export interface ConnectionRequest {
  uid: string;
  userUid: string;
  userName: string;
  userEmail: string;
  requestedRole: string;
  status: string;
  message?: string;
  createdAt: string;
}

/**
 * Hook to fetch connection requests for a company
 */
export const useCompanyConnectionRequests = (
  companyUid: string,
  status?: string,
) => {
  return useQuery({
    queryKey: ["connectionRequests", companyUid, status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await api.get<ConnectionRequest[]>(
        `/connection-requests/companies/${companyUid}`,
        { params },
      );
      return response.data;
    },
    enabled: !!companyUid,
  });
};
