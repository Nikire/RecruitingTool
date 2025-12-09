import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

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
      const response = await api.get<CompanyMember[]>(
        `/companies/${companyUid}/roles`,
      );
      return response.data;
    },
    enabled: !!companyUid,
  });
};
