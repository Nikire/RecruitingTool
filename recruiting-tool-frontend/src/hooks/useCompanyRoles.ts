import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface CompanyMember {
  uid: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture?: string;
}

/**
 * Hook to fetch company members (team)
 */
export const useCompanyMembers = (companyUid: string) => {
  return useQuery({
    queryKey: ['companyMembers', companyUid],
    queryFn: async () => {
      const response = await axios.get<CompanyMember[]>(
        `${API_BASE_URL}/companies/${companyUid}/roles`,
      );
      return response.data;
    },
    enabled: !!companyUid,
  });
};
