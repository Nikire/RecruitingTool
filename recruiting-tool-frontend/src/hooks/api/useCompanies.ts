import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../../api/companies';
import { CreateCompanyDto, UpdateCompanyDto } from '../../types/company.types';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

export const useCompanies = (uid?: string) => {
  return useQuery({
    queryKey: uid ? ['companies', uid] : ['companies'],
    queryFn: () => companiesApi.getAll(),
    enabled: !uid,
  });
};

export const useCompany = (uid: string) => {
  return useQuery({
    queryKey: ['companies', uid],
    queryFn: () => companiesApi.getOne(uid),
    enabled: !!uid,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyDto) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      showSuccessToast('Company created successfully!');
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to create company');
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateCompanyDto }) => companiesApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      showSuccessToast('Company updated successfully!');
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to update company');
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => companiesApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      showSuccessToast('Company deleted successfully!');
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to delete company');
    },
  });
};
