import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../../api/companies';
import { CreateCompanyDto, UpdateCompanyDto } from '../../types/company.types';
import { PaginationParams } from '../../types/pagination.types';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

const COMPANIES_KEY = 'companies';

export const useCompanies = (uid?: string) => {
  return useQuery({
    queryKey: uid ? [COMPANIES_KEY, uid] : [COMPANIES_KEY],
    queryFn: () => companiesApi.getAll(),
    enabled: !uid,
  });
};

export const usePublicCompaniesWithJobs = () => {
  return useQuery({
    queryKey: [COMPANIES_KEY, 'public', 'with-jobs'],
    queryFn: () => companiesApi.getPublicWithJobs(),
    staleTime: 10 * 60 * 1000, // 10 minutes (matches backend cache)
  });
};

export const useListCompanies = (params: PaginationParams) => {
  return useQuery({
    queryKey: [COMPANIES_KEY, 'list', params],
    queryFn: () => companiesApi.list(params),
  });
};

export const useCompany = (uid: string) => {
  return useQuery({
    queryKey: [COMPANIES_KEY, uid],
    queryFn: () => companiesApi.getOne(uid),
    enabled: !!uid,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyDto) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] });
      showSuccessToast('Company deleted successfully!');
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to delete company');
    },
  });
};
