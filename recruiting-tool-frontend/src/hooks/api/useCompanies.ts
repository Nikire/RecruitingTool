import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../../api/companies';
import { CreateCompanyDto, UpdateCompanyDto } from '../../types/company.types';

export const useCompanies = (uid?: string) => {
  return useQuery({
    queryKey: uid ? ['companies', uid] : ['companies'],
    queryFn: () => (uid ? companiesApi.getOne(uid) : companiesApi.getAll()),
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyDto) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateCompanyDto }) => companiesApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => companiesApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
