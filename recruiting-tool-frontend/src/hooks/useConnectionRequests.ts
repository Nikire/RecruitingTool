import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
export const useCompanyConnectionRequests = (companyUid: string, status?: string) => {
  return useQuery({
    queryKey: ['connectionRequests', companyUid, status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await axios.get<ConnectionRequest[]>(
        `${API_BASE_URL}/connection-requests/companies/${companyUid}`,
        { params },
      );
      return response.data;
    },
    enabled: !!companyUid,
  });
};
